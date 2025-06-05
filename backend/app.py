import os
from flask import Flask, jsonify, request, send_from_directory
from logging.handlers import RotatingFileHandler
import logging
import sentry_sdk
from typing import List, Optional
from flask_cors import CORS
from sentry_sdk.integrations.flask import FlaskIntegration
from token_stream import TokenStreamGenerator
from entropy_oracle import generate_quantum_geometric_entropy, get_cubes_entropy, get_pyramids_entropy
from geometry_api import geometry_api, get_icosahedron_animate
from utils import load_config, get_area_weather_data, combine_weather_data, get_quantum_entropy

# -------------------- INITIALISATION SENTRY --------------------
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

# -------------------- FONCTIONS D'ENTROPIE FINALE --------------------
def get_final_entropy(
    geometries: List[str],
    use_weather: bool = False,
    use_quantum: bool = True,
    use_timestamps: bool = True,
    use_local_noise: bool = True
) -> Optional[bytes]:
    try:
        from temporal_entropy import get_world_timestamps, mix_timestamps
        import json
        import time
        import os
        import hashlib
        seed_string = str(time.time_ns())
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
        if quantum_geo_entropy:
            seed_string += quantum_geo_entropy.hex()

        if use_weather and not quantum_geo_entropy:
            all_weather_data_raw = get_area_weather_data(config['coordinates'])
            weather_data_processed = combine_weather_data(all_weather_data_raw)
            if weather_data_processed:
                seed_string += json.dumps(weather_data_processed, sort_keys=True)
            else:
                log_warning("API météo indisponible, utilisation des géométries comme fallback")
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

        for geometry in geometries:
            if geometry not in valid_geometries:
                continue
            if geometry == "cubes" and not use_weather and not quantum_geo_entropy:
                entropy = get_cubes_entropy()
                if entropy:
                    seed_string += entropy.hex()
            elif geometry == "icosahedron" and not use_weather and not quantum_geo_entropy:
                frames = get_icosahedron_animate(steps=10)
                seed_string += json.dumps({"frames": frames}, sort_keys=True)
            elif geometry == "pyramids" and not use_weather and not quantum_geo_entropy:
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

        hasher = hashlib.blake2b(seed_string.encode(), digest_size=32)
        hashed_entropy = hasher.digest()
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
        all_weather_data = get_area_weather_data(config['coordinates'])
        combined_weather = combine_weather_data(all_weather_data)
        if combined_weather:
            return jsonify(combined_weather)
        else:
            return jsonify({"error": "Failed to retrieve combined weather data"}), 500
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

@app.route("/generate_token", methods=["POST"])
def generate_token():
    try:
        data = request.get_json()
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
            use_local_noise=True,
        )
        generator = TokenStreamGenerator(hash_algo="blake3", seed=entropy_bytes, char_options=char_options)
        token = generator.generate_token(length)
        if token:
            return jsonify({"token": token, "entropy_seed": entropy_bytes.hex() if entropy_bytes else None})
        else:
            return jsonify({"error": "Failed to generate token"})
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
        generator = TokenStreamGenerator(hash_algo="blake3", seed=entropy_bytes, char_options=char_options)
        tokens = generator.generate_token_stream(num_tokens, length)
        if tokens:
            return jsonify({"tokens": tokens, "entropy_seed": entropy_bytes.hex() if entropy_bytes else None})
        else:
            return jsonify({"error": "Failed to generate token stream"})
    except Exception as e:
        log_error(f"Error generating token stream: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/")
def serve_index():
    try:
        return send_from_directory('frontend', 'index.html')
    except Exception as e:
        logger.error(f"Error serving index.html: {e}")
        return jsonify({"error": "Failed to serve index.html"}), 404

@app.route('/<path:filename>')
def serve_static(filename):
    try:
        return send_from_directory('frontend', filename)
    except Exception as e:
        logger.error(f"Erreur lors du service du fichier statique {filename}: {e}")
        return jsonify({"error": f"File {filename} not found"}), 404

if __name__ == '__main__':
    try:
        print(f"Appel Open-Meteo pour latitude={config['latitude']}, longitude={config['longitude']}")
        print(f"Coordonnées utilisées: {config['coordinates']}")
        app.run(host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        log_error(f"Erreur lors du démarrage de l'application Flask : {e}")