import os
from flask import Flask, request, send_from_directory, jsonify
frontend_build_folder = os.path.join(os.path.dirname(__file__), 'frontend', 'build')

from logging.handlers import RotatingFileHandler
import logging
import sentry_sdk
from typing import List, Optional
from flask_cors import CORS
from sentry_sdk.integrations.flask import FlaskIntegration

# Import absolus de package (PRO)
from backend.token_stream import TokenStreamGenerator
from backend.entropy_oracle import generate_quantum_geometric_entropy, get_cubes_entropy, get_pyramids_entropy
from backend.geometry_api import geometry_api, get_icosahedron_animate
from backend.utils import load_config, combine_weather_data, get_quantum_entropy

from dotenv import load_dotenv
import requests
import numpy as np
from blake3 import blake3
from hashlib import sha3_256

# -------------------- INITIALISATION SENTRY --------------------
load_dotenv()
sentry_sdk.init(
    dsn=os.environ.get("SENTRY_DSN"),
    integrations=[FlaskIntegration()],
    traces_sample_rate=1.0,
    environment=os.getenv("FLASK_ENV", "dev")
)

app = Flask(__name__)
CORS(app)

# Enregistrement du blueprint geometry_api
app.register_blueprint(geometry_api, url_prefix='/geometry')

# -------------------- CONFIGURATION --------------------
LOG_FILENAME = "app.log"
LOG_LEVEL = logging.INFO
LOG_FORMAT = "%(asctime)s - %(levelname)s - %(message)s"
LOG_MAX_BYTES = 10 * 1024 * 1024
LOG_BACKUP_COUNT = 5

log_handler = RotatingFileHandler(LOG_FILENAME, maxBytes=LOG_MAX_BYTES, backupCount=LOG_BACKUP_COUNT)
log_handler.setFormatter(logging.Formatter(LOG_FORMAT))
logger = logging.getLogger("entropy_generator")
logger.addHandler(log_handler)
logger.setLevel(LOG_LEVEL)

def log_error(message: str) -> None:
    logger.error(message)

def log_warning(message: str) -> None:
    logger.warning(message)

def log_info(message: str) -> None:
    logger.info(message)

config = load_config()

# -------------------- FONCTIONS D'ENTROPIE --------------------
def get_weather_entropy():
    try:
        response = requests.get(
            os.getenv("WEATHER_API_URL"),
            params={
                "latitude": config["latitude"],
                "longitude": config["longitude"],
                "current_weather": True,
                "hourly": "temperature_2m,pressure_msl,relative_humidity_2m"
            }
        )
        response.raise_for_status()
        data = response.json()
        temperature = str(data.get("current_weather", {}).get("temperature", ""))
        hourly = data.get("hourly", {})
        pressure = str(hourly.get("pressure_msl", [None])[-1] or "")
        humidity = str(hourly.get("relative_humidity_2m", [None])[-1] or "")
        return temperature + pressure + humidity
    except Exception as e:
        logger.error(f"Erreur API météo : {e}")
        return str(np.random.normal(0, 1, 1000))

def generate_token_from_entropy(frames, length=32):
    weather_seed = get_weather_entropy()
    positions = [pos for frame in frames for pyramid in frame["pyramids"] for pos in pyramid["bricks_positions"]]
    billes = [b["position"] for frame in frames for b in frame.get("billes", [])]
    entropy_data = str(positions) + str(billes)
    if weather_seed:
        entropy_data += weather_seed
    else:
        entropy_data += str(np.random.normal(0, 1, 1000)) + os.urandom(16).hex()
    blake_hash = blake3(entropy_data.encode()).digest(length=32)
    final_token = sha3_256(blake_hash).hexdigest()[:length * 2]
    return final_token

# -------------------- FONCTIONS D'ENTROPIE FINALE --------------------
def get_final_entropy(
    geometries: List[str],
    use_weather: bool = False,
    use_quantum: bool = True,
    use_timestamps: bool = True,
    use_local_noise: bool = True
) -> Optional[bytes]:
    try:
        from backend.temporal_entropy import get_world_timestamps, mix_timestamps
        import json
        import time
        valid_geometries = {"cubes", "icosahedron", "pyramids"}

        quantum_geo_entropy = generate_quantum_geometric_entropy(
            use_weather=use_weather,
            use_icosahedron="icosahedron" in geometries,
            use_quantum=use_quantum,
            use_timestamps=use_timestamps,
            use_local_noise=use_local_noise,
            use_cubes="cubes" in geometries,
            use_pyramids="pyramids" in geometries
        )
        seed_string = str(time.time_ns())
        if quantum_geo_entropy:
            seed_string += quantum_geo_entropy.hex()

        if use_weather and not quantum_geo_entropy:
            weather_seed = get_weather_entropy()
            seed_string += weather_seed

        for geometry in geometries:
            if geometry not in valid_geometries:
                continue
            if geometry == "cubes":
                entropy = get_cubes_entropy()
                if entropy:
                    seed_string += entropy.hex()
            elif geometry == "icosahedron":
                frames = get_icosahedron_animate(steps=10)
                seed_string += json.dumps({"frames": frames}, sort_keys=True)
            elif geometry == "pyramids":
                entropy = get_pyramids_entropy()
                if entropy:
                    seed_string += entropy.hex()

        if use_quantum and not quantum_geo_entropy:
            quantum_entropy_value = get_quantum_entropy()
            if quantum_entropy_value is not None:
                seed_string += str(quantum_entropy_value)

        if use_timestamps and not quantum_geo_entropy:
            timestamps_list = get_world_timestamps()
            mixed_timestamps_string = mix_timestamps(timestamps_list, mode='hybrid')
            if mixed_timestamps_string:
                seed_string += mixed_timestamps_string
            else:
                log_warning("Aucune entropie temporelle mondiale générée.")

        if use_local_noise and not quantum_geo_entropy:
            seed_string += os.urandom(16).hex()

        if not seed_string or seed_string == str(time.time_ns()):
            log_error("Aucune source d'entropie n'a contribué")
            return None

        blake_hash = blake3(seed_string.encode()).digest(length=32)
        hashed_entropy = sha3_256(blake_hash).digest()
        log_info("Entropie finale générée avec succès.")
        return hashed_entropy
    except Exception as e:
        log_error(f"Erreur inattendue dans get_final_entropy : {e}")
        return None

# -------------------- ROUTES PRINCIPALES --------------------
@app.route('/generate_random')
def generate_random():
    try:
        entropy_seed_bytes = get_final_entropy(
            geometries=["cubes", "icosahedron", "pyramids"],
            use_weather=True,
            use_quantum=True,
            use_timestamps=True,
            use_local_noise=True
        )
        if not entropy_seed_bytes:
            return jsonify({"error": "Failed to generate final entropy"}), 500
        generator = TokenStreamGenerator(hash_algo="blake3", seed=entropy_seed_bytes)
        token = generator.generate_token(32)
        return jsonify({"random_number": token, "entropy_seed": entropy_seed_bytes.hex()})
    except Exception as e:
        log_error(f"Erreur lors de la génération du nombre aléatoire : {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/entropy', methods=['GET'])
def entropy_route():
    try:
        weather_seed = get_weather_entropy()
        return jsonify({"weather_entropy": weather_seed}), 200
    except Exception as e:
        log_error(f"Erreur lors de la récupération de l'entropie météo : {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/final_entropy', methods=['GET'])
def final_entropy():
    try:
        final_entropy_bytes = get_final_entropy(
            geometries=["cubes", "icosahedron", "pyramids"],
            use_weather=True,
            use_quantum=True,
            use_timestamps=True,
            use_local_noise=True
        )
        if final_entropy_bytes:
            return jsonify({"final_entropy": final_entropy_bytes.hex()})
        else:
            return jsonify({"error": "Failed to generate final entropy"}), 500
    except Exception as e:
        log_error(f"Erreur lors de la génération de l'entropie finale : {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/generate_token", methods=['POST'])
def generate_token():
    try:
        data = request.get_json (silent=True) or {}
        length = data.get("length", 32)
        char_options = data.get('char_options', {
            "lowercase": True,
            "uppercase": True,
            "numbers": True,
            "symbols": True
        })
        weather_enabled = data.get('weather_enabled', True)
        entropy_bytes = get_final_entropy(
            geometries=["cubes", "icosahedron", "pyramids"],
            use_weather=weather_enabled,
            use_quantum=True,
            use_timestamps=True,
            use_local_noise=True
        )
        if not entropy_bytes:
            return jsonify({"token": "your_generated_token"}), 500
        generator = TokenStreamGenerator(hash_algo="blake3", seed=entropy_bytes, char_options=char_options)
        token = generator.generate_token(length)
        if token:
            return jsonify({"token": token, "entropy_seed": entropy_bytes.hex()})
        else:
            return jsonify({"error": "Failed to generate token"}), 500
    except Exception as e:
        log_error(f"Error generating token: {e}")
        return jsonify({"error": str(e)}), 400

@app.route("/stream_tokens", methods=["POST"])
def stream_tokens():
    try:
        data = request.get_json()
        num_tokens = data.get("num_tokens", 10)
        length = data.get("length", 32)
        char_options = data.get("char_options", {
            "lowercase": True,
            "uppercase": True,
            "numbers": True,
            "symbols": True
        })
        weather_enabled = data.get("weather_enabled", True)
        entropy_bytes = get_final_entropy(
            geometries=["cubes", "icosahedron", "pyramids"],
            use_weather=weather_enabled,
            use_quantum=True,
            use_timestamps=True,
            use_local_noise=True
        )
        if not entropy_bytes:
            return jsonify({"error": "Failed to generate entropy"}), 500
        generator = TokenStreamGenerator(hash_algo="blake3", seed=entropy_bytes, char_options=char_options)
        tokens = generator.generate_token_stream(num_tokens, length)
        if not tokens:
            return jsonify({"error": "Échec de génération des tokens"}), 400
        return jsonify({"tokens": tokens, "entropy_seed": entropy_bytes.hex()}), 200
    except ValueError as e:
        log_error(f"Error generating token stream: {e}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        log_error(f"Error generating token stream: {e}")
        return jsonify({"error": str(e)}), 400

@app.route('/')
def index():
    try:
        chemin_index = os.path.join(frontend_build_folder, 'index.html')
        print("Chemin utilisé pour index.html :", chemin_index)
        return send_from_directory(frontend_build_folder, 'index.html')
    except Exception as e:
        print(f"Error serving index.html: {e}")
        return jsonify({"error": "Failed to serve index.html"}), 404

# (optionnel) Pour servir les fichiers statiques du build
@app.route('/<path:path>')
def static_proxy(path):
    try:
        return send_from_directory(frontend_build_folder, path)
    except Exception as e:
        print(f"Error serving static file {path}: {e}")
        return jsonify({"error": f"File {path} not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)


@app.route('/test-sentry')
def test_sentry():
    if app.config.get('ENV') == 'development' or app.config.get('TESTING', False):
        return 1 / 0
    else:
        return "Sentry test endpoint is disabled in production", 403

if __name__ == '__main__':
    try:
        print(f"Appel Open-Meteo pour latitude={config['latitude']}, longitude={config['longitude']}")
        print(f"Coordonnées utilisées: {config['coordinates']}")
        app.run(host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        log_error(f"Erreur lors du démarrage de l'application Flask : {e}")