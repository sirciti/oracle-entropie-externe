from flask import Flask, jsonify, send_from_directory, request
from logging.handlers import RotatingFileHandler
import requests  # Import corrigé : requests bien importé
import time
import hashlib
import random
import json
import os
import logging
import secrets
import string
import sentry_sdk
from typing import List, Dict, Optional, Tuple, Any
from flask_cors import CORS
from sentry_sdk.integrations.flask import FlaskIntegration

# -------------------- INITIALISATION SENTRY --------------------
sentry_sdk.init(
    dsn="https://29f8b7efc9e08f8ab4f63a42a7947b7e@o4509440127008768.ingest.de.sentry.io/4509440193396816",
    integrations=[FlaskIntegration()],
    traces_sample_rate=1.0,
    environment="production"  # ou "development"
)

# --- IMPORTS DES MODULES ORGANISÉS ---
from backend.geometry_api import geometry_api, get_icosahedron_animate
from backend.temporal_entropy import get_world_timestamps, mix_timestamps
from backend.entropy_oracle import generate_quantum_geometric_entropy, get_cubes_entropy, get_pyramids_entropy

app = Flask(__name__)
CORS(app)

# -------------------- CONFIGURATION --------------------

DEFAULT_LAT = 48.85
DEFAULT_LON = 2.35
DEFAULT_COORDINATES = [
    [49.1, 2.0],
    [48.7, 2.7],
    [48.4, 2.0],
    [48.8, 1.7]
]

ANU_QRNG_API_URL = os.getenv("ANU_QRNG_API_URL",
                            "https://qrng.anu.edu.au/API/jsonI.php?length=1&type=uint8")

FALLBACK_PRNG_SEED_LENGTH = 256

LOG_FILENAME = "app.log"
LOG_LEVEL = logging.INFO
LOG_FORMAT = "%(asctime)s - %(levelname)s - %(message)s"
LOG_MAX_BYTES = 10 * 1024 * 1024
LOG_BACKUP_COUNT = 5

log_handler = RotatingFileHandler(LOG_FILENAME, maxBytes=LOG_MAX_BYTES,
                                    backupCount=LOG_BACKUP_COUNT)
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

# -------------------- CONFIGURATION LOADING --------------------

def load_config() -> Dict[str, Any]:
    config = {}
    try:
        with open('config.json', 'r') as f:
            config = json.load(f)
        logger.info("Configuration chargée depuis config.json")
    except FileNotFoundError:
        logger.warning("Fichier config.json non trouvé. Utilisation des valeurs par défaut.")
    except json.JSONDecodeError as e:
        logger.error(f"Erreur de décodage JSON dans config.json : {e}")
    except Exception as e:
        logger.error(f"Erreur inattendue lors du chargement de config.json : {e}")

    try:
        config['latitude'] = float(os.getenv('OPEN_METEO_LAT', config.get('latitude', DEFAULT_LAT)))
        config['longitude'] = float(os.getenv('OPEN_METEO_LON', config.get('longitude', DEFAULT_LON)))
        coords_env = os.getenv('OPEN_METEO_COORDINATES', json.dumps(config.get('coordinates', DEFAULT_COORDINATES)))
        if isinstance(coords_env, str):
            config['coordinates'] = json.loads(coords_env)
        else:
            config['coordinates'] = coords_env
        logger.info("Configuration surchargée par les variables d'environnement (si présentes).")
    except (ValueError, json.JSONDecodeError) as e:
        logger.error(f"Erreur : Variables d'environnement de coordonnées invalides : {e}")
        config['coordinates'] = DEFAULT_COORDINATES
    except Exception as e:
        logger.error(f"Erreur inattendue lors de la surcharge de la configuration par les variables d'environnement : {e}")

    return config

config = load_config()

# -------------------- API CALLS (FONCTIONS UTILITAIRES) --------------------

def get_current_weather_data(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}"
            "&current_weather=true"  # Correction ici : &current_weather=true
            "&hourly=temperature_2m,relative_humidity_2m,pressure_msl,cloudcover,precipitation,windgusts_10m"
            "&forecast_days=1"
            "&timezone=auto"
        )
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        weather = data.get("current_weather", {})
        hourly = data.get("hourly", {})
        idx = 0
        return {
            "temperature": weather.get("temperature"),
            "humidity": hourly.get("relative_humidity_2m", [None])[idx],
            "pressure": hourly.get("pressure_msl", [None])[idx],
            "wind_speed": weather.get("windspeed"),
            "wind_gust": hourly.get("windgusts_10m", [None])[idx],
            "clouds": hourly.get("cloudcover", [None])[idx],
            "precipitation": hourly.get("precipitation", [None])[idx]
        }
    except requests.exceptions.RequestException as e:
        log_error(f"Erreur lors de la récupération des données météo pour {lat}, {lon} : {e}")
        return None
    except Exception as e:
        log_error(f"Erreur inattendue lors de la récupération des données météo pour {lat}, {lon} : {e}")
        return None

def get_area_weather_data(coordinates: List[Tuple[float, float]]) -> List[Optional[Dict[str, Any]]]:
    all_data = []
    for lat, lon in coordinates:
        data = get_current_weather_data(lat, lon)
        if data:
            all_data.append(data)
    return all_data

def combine_weather_data(all_data: List[Optional[Dict[str, Any]]]) -> Optional[Dict[str, Any]]:
    if not all_data:
        log_error("Aucune donnée météo à combiner.")
        return None
    combined_data = {}
    temperatures = [d.get("temperature") for d in all_data if isinstance(d.get("temperature"), (int, float))]
    humidities = [d.get("humidity") for d in all_data if isinstance(d.get("humidity"), (int, float))]
    pressures = [d.get("pressure") for d in all_data if isinstance(d.get("pressure"), (int, float))]
    wind_speeds = [d.get("wind_speed") for d in all_data if isinstance(d.get("wind_speed"), (int, float))]
    wind_gusts = [d.get("wind_gust") for d in all_data if isinstance(d.get("wind_gust"), (int, float))]
    clouds = [d.get("clouds") for d in all_data if isinstance(d.get("clouds"), (int, float))]
    precipitations = [d.get("precipitation") for d in all_data if isinstance(d.get("precipitation"), (int, float))]

    try:
        if temperatures:
            combined_data["avg_temperature"] = sum(temperatures) / len(temperatures)
        if wind_speeds:
            combined_data["max_wind_speed"] = max(wind_speeds)
        if wind_gusts:
            combined_data["max_wind_gust"] = max(wind_gusts)
        if humidities:
            combined_data["avg_humidity"] = sum(humidities) / len(humidities)
        if pressures:
            combined_data["avg_pressure"] = sum(pressures) / len(pressures)
        if clouds:
            combined_data["avg_clouds"] = sum(clouds) / len(clouds)
        if precipitations:
            combined_data["avg_precipitation"] = sum(precipitations) / len(precipitations)
        return combined_data
    except Exception as e:
        log_error(f"Erreur lors de la combinaison des données météo : {e}")
        return None

def get_quantum_entropy(max_retries: int = 3, initial_delay: int = 1) -> Optional[float]:
    logger.warning("L'API ANU QRNG est désactivée/instable. Utilisation du PRNG de secours.")
    fallback_seed = os.urandom(FALLBACK_PRNG_SEED_LENGTH // 8) + str(time.time_ns()).encode()
    random.seed(hashlib.sha256(fallback_seed).hexdigest())
    return random.random()

def generate_random_number_with_entropy(verbose: bool = False) -> Tuple[float, str]:
    all_weather = get_area_weather_data(config['coordinates'])
    combined_weather = combine_weather_data(all_weather)
    quantum_entropy_value = get_quantum_entropy()
    timestamp = time.time_ns()
    local_noise = os.urandom(16)
    seed_string = str(timestamp)
    if combined_weather:
        seed_string += json.dumps(combined_weather, sort_keys=True)
    if quantum_entropy_value is not None:
        seed_string += str(quantum_entropy_value)
    seed_string += local_noise.hex()
    hasher = hashlib.sha256(seed_string.encode())
    hashed_entropy = hasher.hexdigest()
    seed = int(hashed_entropy[:16], 16)
    random.seed(seed)
    random_number = random.random()
    logger.info(f"Nombre aléatoire généré: {random_number}, Hachage d'entropie: {hashed_entropy}")
    return random_number, hashed_entropy

# -------------------- FONCTIONS D'ENTROPIE FINALE --------------------

def get_final_entropy(
    geometries: List[str],
    use_weather: bool = False,
    use_quantum: bool = True,
    use_timestamps: bool = True,
    use_local_noise: bool = True
) -> Optional[bytes]:
    """
    Génère l'entropie finale à partir des géométries sélectionnées et autres sources.

    Args:
        geometries (List[str]): Liste des géométries actives ('cubes', 'icosahedron', 'pyramids').
        use_weather (bool): Utiliser les données météo.
        use_quantum (bool): Utiliser l'entropie quantique.
        use_timestamps (bool): Utiliser les horodatages mondiaux.
        use_local_noise (bool): Ajouter un bruit local aléatoire.

    Returns:
        Optional[bytes]: Octets représentant l'entropie générée, ou None en cas d'erreur.
    """
    try:
        seed_string = str(time.time_ns())
        valid_geometries = {"cubes", "icosahedron", "pyramids"}

        if use_weather:
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
            if geometry == "cubes" and not use_weather:  # Éviter duplication si déjà inclus
                entropy = get_cubes_entropy()
                if entropy:
                    seed_string += entropy.hex()
            elif geometry == "icosahedron" and not use_weather:
                frames = get_icosahedron_animate(steps=10)
                seed_string += json.dumps({"frames": frames}, sort_keys=True)
            elif geometry == "pyramids" and not use_weather:
                entropy = get_pyramids_entropy()
                if entropy:
                    seed_string += entropy.hex()

        if use_quantum:
            quantum_entropy_value = get_quantum_entropy()
            if quantum_entropy_value is not None:
                seed_string += str(quantum_entropy_value)

        if use_timestamps:
            timestamps_list = get_world_timestamps()
            mixed_timestamps_string = mix_timestamps(timestamps_list, mode='hybrid')
            if mixed_timestamps_string:
                seed_string += mixed_timestamps_string
            else:
                log_warning("Aucune entropie temporelle mondiale générée.")

        if use_local_noise:
            seed_string += os.urandom(16).hex()

        if not seed_string or seed_string == str(time.time_ns()):
            log_error("Aucune source d'entropie n'a contribué")
            return None

        hasher = hashlib.blake2b(seed_string.encode(), digest_size=32)
        hashed_entropy = hasher.digest()
        log_info("Entropie finale générée avec succès.")
        return hashed_entropy

    except Exception as e:
        log_error(f"Erreur inattendue lors de la génération de l'entropie finale : {e}")
        return None

def generate_secure_token(length=32, char_options=None):
    if char_options is None:
        char_options = {
            "lowercase": True,
            "uppercase": True,
            "numbers": True,
            "symbols": True
        }
    alphabet = ""
    if char_options.get("lowercase"):
        alphabet += string.ascii_lowercase
    if char_options.get("uppercase"):
        alphabet += string.ascii_uppercase
    if char_options.get("numbers"):
        alphabet += string.digits
    if char_options.get("symbols"):
        alphabet += "!@#$%^&*()-_=+[]{}|;:,.<>/?"
    if not alphabet:
        raise ValueError("Aucun type de caractère sélectionné.")
    return ''.join(secrets.choice(alphabet) for _ in range(length))

# -------------------- INTEGRATION DES ROUTES GEOMETRIE --------------------

app.register_blueprint(geometry_api, url_prefix='/geometry')

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
        token_result = generate_secure_token(entropy_seed_bytes, length=32)
        return jsonify({"random_number": token_result, "entropy_seed": entropy_seed_bytes.hex()})
    except Exception as e:
        log_error(f"Erreur lors de la génération du nombre aléatoire : {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/entropy', methods=['GET'])
def entropy_route():
    try:
        all_weather_data_from_get_area = get_area_weather_data(config['coordinates'])
        combined_weather = combine_weather_data(all_weather_data_from_get_area)
        if combined_weather:
            return jsonify(combined_weather)
        else:
            return jsonify({"error": "Failed to retrieve combined weather data"}), 500
    except Exception as e:
        log_error(f"Erreur lors de la récupération de l'entropie météo : {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/final_entropy', methods=['GET'])
def final_entropy():
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

@app.route("/generate_token", methods=["POST"])
def generate_token():
    data = request.get_json()
    length = data.get("length", 32)
    char_options = data.get("char_options", {})
    weather_enabled = data.get("weather_enabled", True)
    entropy_bytes = get_final_entropy(
        geometries=["cubes", "icosahedron", "pyramids"],
        use_weather=weather_enabled,
        use_quantum=True,
        use_timestamps=True,
        use_local_noise=True
    )
    try:
        # Utiliser l'entropie comme seed pour secrets si disponible
        if entropy_bytes:
            secrets_generator = secrets.SystemRandom(int.from_bytes(entropy_bytes, "big"))
            alphabet = ""
            if char_options.get("lowercase"):
                alphabet += string.ascii_lowercase
            if char_options.get("uppercase"):
                alphabet += string.ascii_uppercase
            if char_options.get("numbers"):
                alphabet += string.digits
            if char_options.get("symbols"):
                alphabet += "!@#$%^&*()-_=+[]{}|;:,.<>/?"
            if not alphabet:
                raise ValueError("Aucun type de caractère sélectionné.")
            token = ''.join(secrets_generator.choice(alphabet) for _ in range(length))
        else:
            token = generate_secure_token(length, char_options)
        return jsonify({"token": token, "entropy_seed": entropy_bytes.hex() if entropy_bytes else None})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/')
def serve_index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('../frontend', filename)

if __name__ == '__main__':
    try:
        print(f"Appel Open-Meteo pour latitude={config['latitude']}, longitude={config['longitude']}")
        print(f"Coordonnées utilisées: {config['coordinates']}")
        app.run(host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        log_error(f"Erreur lors du démarrage de l'application Flask : {e}")