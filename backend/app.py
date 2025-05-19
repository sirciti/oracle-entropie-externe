from flask import Flask, jsonify, send_from_directory
from logging.handlers import RotatingFileHandler
import requests
import time
import hashlib
import random
import json
import os
import logging
import secrets
from typing import List, Dict, Optional, Tuple, Any

from backend.geometry_api import geometry_api, get_icosahedron_animate

app = Flask(__name__)
app.register_blueprint(geometry_api)

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

# Logging configuration
LOG_FILENAME = "app.log"
LOG_LEVEL = logging.INFO
LOG_FORMAT = "%(asctime)s - %(levelname)s - %(message)s"
LOG_MAX_BYTES = 10 * 1024 * 1024  # 10MB
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
        config['coordinates'] = json.loads(
            os.getenv('OPEN_METEO_COORDINATES', json.dumps(config.get('coordinates', DEFAULT_COORDINATES)))
        )
        logger.info("Configuration surchargée par les variables d'environnement (si présentes).")
    except ValueError:
        logger.error("Erreur : Les variables d'environnement OPEN_METEO_LAT, OPEN_METEO_LON ou OPEN_METEO_COORDINATES ne sont pas valides.")
    except json.JSONDecodeError as e:
        logger.error(f"Erreur de décodage JSON pour OPEN_METEO_COORDINATES : {e}")
    except Exception as e:
        logger.error(f"Erreur inattendue lors de la surcharge de la configuration par les variables d'environnement : {e}")

    return config

config = load_config()

# -------------------- API CALLS --------------------

def get_current_weather_data(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}"
            "&current_weather=true"
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
        current_data = {
            "temperature": weather.get("temperature"),
            "humidity": hourly.get("relative_humidity_2m", [None])[idx],
            "pressure": hourly.get("pressure_msl", [None])[idx],
            "wind_speed": weather.get("windspeed"),
            "wind_gust": hourly.get("windgusts_10m", [None])[idx],
            "clouds": hourly.get("cloudcover", [None])[idx],
            "precipitation": hourly.get("precipitation", [None])[idx]
        }
        return current_data
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
    retries = 0
    delay = initial_delay
    last_error = None
    while retries < max_retries:
        try:
            response = requests.get(ANU_QRNG_API_URL, timeout=5)
            response.raise_for_status()
            data = response.json()
            if data and data.get('data'):
                log_info(f"QRNG source: ANU")
                return data['data'][0] / 255.0
            else:
                log_warning(f"Données QRNG non valides.")
                return None
        except requests.exceptions.RequestException as e:
            last_error = e
            log_warning(f"Erreur lors de la récupération de l'entropie quantique (tentative {retries + 1}/{max_retries}) : {e}")
            retries += 1
            time.sleep(delay)
            delay *= 2
        except Exception as e:
            log_error(f"Erreur inattendue lors de la récupération de l'entropie quantique: {e}")
            return None
    log_warning(f"Échec de la récupération de l'entropie quantique après plusieurs tentatives.")
    if last_error:
        log_warning(f"Dernière erreur QRNG : {last_error}")
    log_warning("Tous les QRNGs ont échoué. Utilisation du PRNG de secours.")
    fallback_seed = os.urandom(16) + str(time.time_ns()).encode()
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
    seed_string += os.urandom(16).hex()
    hashed_entropy = hashlib.sha256(seed_string.encode()).hexdigest()
    seed = int(hashed_entropy[:16], 16)
    random.seed(seed)
    random_number = random.random()
    log_info(f"Nombre aléatoire généré: {random_number}, Hachage d'entropie: {hashed_entropy}")
    return random_number, hashed_entropy

# -------------------- FONCTIONS D'ENTROPIE FINALE --------------------

def get_final_entropy() -> Optional[bytes]:
    try:
        # 1. Récupérer les données météo (via fonction Python locale)
        all_weather = get_area_weather_data(config['coordinates'])
        weather_data = combine_weather_data(all_weather)
        if not weather_data:
            log_error("Erreur lors de la récupération des données météo.")
            return None
        # 2. Simuler l'icosaèdre dynamique (via fonction Python locale)
        icosahedron_data = {"frames": get_icosahedron_animate(steps=10)}
        if not icosahedron_data:
            log_error("Erreur lors de la simulation de l'icosaèdre.")
            return None
        # 3. Récupérer l'entropie quantique (API externe)
        quantum_entropy_value = get_quantum_entropy()
        # 4. Combiner toutes les sources d'entropie
        seed_string = str(time.time_ns())
        seed_string += json.dumps(weather_data, sort_keys=True)
        seed_string += json.dumps(icosahedron_data, sort_keys=True)
        if quantum_entropy_value is not None:
            seed_string += str(quantum_entropy_value)
        seed_string += os.urandom(16).hex()
        hashed_entropy = hashlib.blake2b(seed_string.encode(), 
        digest_size=32).digest()
        log_info("Entropie finale générée avec succès.")
        return hashed_entropy
    except Exception as e:
        log_error(f"Erreur lors de la génération de l'entropie finale : {e}")
        return None

def generate_secure_token(entropy_seed: bytes, length: int = 32) -> str:
    hasher = hashlib.blake2b(key=entropy_seed, digest_size=32)
    seed = hasher.digest()
    token = secrets.token_hex(length)
    return token

# -------------------- ROUTES PRINCIPALES --------------------

@app.route('/generate_random')
def generate_random():
    try:
        random_number, entropy_seed = generate_random_number_with_entropy()
        return jsonify({"random_number": random_number, "entropy_seed": entropy_seed})
    except Exception as e:
        log_error(f"Erreur lors de la génération du nombre aléatoire : {e}")
        return jsonify({"error": "Failed to generate random number"}), 500

@app.route('/entropy', methods=['GET'])
def entropy():
    try:
        all_weather = get_area_weather_data(config['coordinates'])
        combined_weather = combine_weather_data(all_weather)
        if combined_weather:
            return jsonify(combined_weather)
        else:
            return jsonify({"error": "Failed to retrieve combined weather data"}), 500
    except Exception as e:
        log_error(f"Erreur lors de la récupération de l'entropie météo : {e}")
        return jsonify({"error": "Failed to retrieve weather data"}), 500

@app.route('/final_entropy', methods=['GET'])
def final_entropy():
    final_entropy = get_final_entropy()
    if final_entropy:
        return jsonify({"final_entropy": final_entropy.hex()})
    else:
        return jsonify({"error": "Failed to generate final entropy"}), 500

@app.route('/generate_token', methods=['GET'])
def generate_token():
    entropy_seed = get_final_entropy()
    if entropy_seed:
        token = generate_secure_token(entropy_seed)
        return jsonify({"token": token})
    else:
        return jsonify({"error": "Failed to generate secure token"}), 500

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
        app.run(debug=True)
    except Exception as e:
        print(f"Erreur inattendue au démarrage de l'application : {e}")
