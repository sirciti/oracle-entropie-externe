from flask import Flask, jsonify, send_from_directory
import requests
import time
import hashlib
import random
import json
import os
import logging
from logging.handlers import RotatingFileHandler

app = Flask(__name__)

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
    "https://qrng.anu.edu.au/API/jsonI.php?length=1&type=uint8"
)

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

def log_error(message):
    logger.error(message)

def log_warning(message):
    logger.warning(message)

def log_info(message):
    logger.info(message)

# -------------------- CONFIGURATION LOADING --------------------

def load_config():
    """Charge la configuration depuis config.json et/ou les variables d'environnement."""
    config = {}
    try:
        with open('config.json', 'r') as f:
            config = json.load(f)
        log_info("Configuration chargée depuis config.json")
    except FileNotFoundError:
        log_warning("Fichier config.json non trouvé. Utilisation des valeurs par défaut.")
    except json.JSONDecodeError as e:
        log_error(f"Erreur de décodage JSON dans config.json : {e}")
    except Exception as e:
        log_error(f"Erreur inattendue lors du chargement de config.json : {e}")

    # Surcharge avec les variables d'environnement (si définies)
    try:
        config['latitude'] = float(os.getenv('OPEN_METEO_LAT', config.get('latitude', DEFAULT_LAT)))
        config['longitude'] = float(os.getenv('OPEN_METEO_LON', config.get('longitude', DEFAULT_LON)))
        config['coordinates'] = json.loads(
            os.getenv('OPEN_METEO_COORDINATES', json.dumps(config.get('coordinates', DEFAULT_COORDINATES)))
        )
        log_info("Configuration surchargée par les variables d'environnement (si présentes).")
    except ValueError:
        log_error("Erreur : Les variables d'environnement OPEN_METEO_LAT, OPEN_METEO_LON ou OPEN_METEO_COORDINATES ne sont pas valides.")
    except json.JSONDecodeError as e:
        log_error(f"Erreur de décodage JSON pour OPEN_METEO_COORDINATES : {e}")
    except Exception as e:
        log_error(f"Erreur inattendue lors de la surcharge de la configuration par les variables d'environnement : {e}")

    return config

config = load_config()

# -------------------- API CALLS --------------------

def get_current_weather_data(lat, lon):
    """Récupère les données météo actuelles pour une paire de coordonnées."""
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
        idx = 0  # premier index horaire (heure courante)
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

def get_area_weather_data(coordinates):
    """Récupère les données météo pour une liste de coordonnées."""
    all_data = []
    for lat, lon in coordinates:
        data = get_current_weather_data(lat, lon)
        if data:
            all_data.append(data)
    return all_data

def combine_weather_data(all_data):
    """Combine les données météo de plusieurs points."""
    if not all_data:
        log_error("Aucune donnée météo à combiner.")
        return None
    combined_data = {}
    # Initialise des listes pour stocker les valeurs de chaque paramètre. Gère les données manquantes.
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

def get_quantum_entropy(max_retries=3, initial_delay=1):
    """Récupère un nombre aléatoire quantique normalisé [0,1] depuis l'API ANU QRNG."""
    retries = 0
    delay = initial_delay
    last_error = None
    while retries < max_retries:
        try:
            response = requests.get(ANU_QRNG_API_URL, timeout=5)
            response.raise_for_status()
            data = response.json()
            if data and data.get('data'):
                log_info("QRNG source: ANU")
                return data['data'][0] / 255.0
            else:
                log_warning("Données QRNG non valides.")
                return None
        except requests.exceptions.RequestException as e:
            last_error = e
            log_warning(f"Erreur lors de la récupération de l'entropie quantique (tentative {retries + 1}/{max_retries}) : {e}")
            retries += 1
            time.sleep(delay)
            delay *= 2
    log_warning("Échec de la récupération de l'entropie quantique après plusieurs tentatives.")
    if last_error:
        log_warning(f"Dernière erreur QRNG : {last_error}")
    # Fallback : bruit local
    fallback_seed = os.urandom(16) + str(time.time_ns()).encode()
    random.seed(hashlib.sha256(fallback_seed).hexdigest())
    return random.random()

def generate_random_number_with_entropy(verbose=False):
    """
    Génère un nombre aléatoire robuste basé sur :
      - entropie météo (API locale /entropy),
      - entropie quantique (ANU QRNG),
      - horodatage précis
      - bruit local (os.urandom)
    """
    all_weather = get_area_weather_data(config['coordinates'])
    combined_weather = combine_weather_data(all_weather)
    quantum_entropy_value = get_quantum_entropy()
    timestamp = time.time_ns()  # Horodatage très précis (nanosecondes)
    local_noise = os.urandom(16)  # 16 octets de bruit système

    # Construction de la graine
    seed_string = str(timestamp)
    if combined_weather:
        seed_string += json.dumps(combined_weather, sort_keys=True)
    if quantum_entropy_value is not None:
        seed_string += str(quantum_entropy_value)
    seed_string += local_noise.hex()

    # Hash robuste (SHA-256)
    hashed_entropy = hashlib.sha256(seed_string.encode()).hexdigest()
    seed = int(hashed_entropy[:16], 16)
    random.seed(seed)
    result = random.random()

    if verbose:
        print("----- ENTROPIE UTILISÉE -----")
        print("Horodatage :", timestamp)
        print("Entropie météo :", combined_weather)
        print("Entropie quantique :", quantum_entropy_value)
        print("Bruit local (hex) :", local_noise.hex())
        print("Haché SHA-256 :", hashed_entropy)
        print("Graine PRNG :", seed)
        print("-----------------------------")

    return result, hashed_entropy

@app.route('/generate_random')
def generate_random():
    """API endpoint to generate a random number with combined entropy."""
    try:
        random_number, entropy_used = generate_random_number_with_entropy()
        return jsonify({"random_number": random_number, "entropy_seed": entropy_used})
    except Exception as e:
        log_error(f"Erreur lors de la génération du nombre aléatoire : {e}")
        return jsonify({"error": "Failed to generate random number"}), 500

@app.route('/entropy')
def entropy():
    """API endpoint to get the combined weather data (for debugging or optional use)."""
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

@app.route('/')
def serve_index():
    """Serves the main page (frontend)."""
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serves static files (CSS, JS, etc.) from the frontend."""
    return send_from_directory('../frontend', filename)

if __name__ == '__main__':
    try:
        print(f"Appel Open-Meteo pour latitude={config['latitude']}, longitude={config['longitude']}")
        print(f"Coordonnées utilisées: {config['coordinates']}")
        app.run(debug=True)
    except Exception as e:
        print(f"Erreur inattendue au démarrage de l'application : {e}")
