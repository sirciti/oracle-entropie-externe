import requests
import json
import os
import logging
import hashlib
import time
import random
from typing import List, Dict, Optional, Any, Tuple
# from sentry_sdk.transport import Transport # Non utilisé ici directement
# from .quantum import generate_quantum_entropy # <-- Ligne à supprimer

# --- CORRECTION DE L'IMPORTATION ---
# Importer directement depuis backend.quantum_nodes
from .quantum_nodes import get_quantum_entropy # Assurez-vous que get_quantum_entropy est bien une fonction exportée par quantum_nodes.py

logger = logging.getLogger("entropy_generator")

# Ces constantes étaient déjà définies dans app.py ou config.json,
# mais si utils.py les utilise, elles peuvent être définies ici.
# Elles ne doivent pas être redondantes avec app.py si app.py importe utils.load_config().
DEFAULT_LAT = 48.85
DEFAULT_LON = 2.35
DEFAULT_COORDINATES = [
    [49.1, 2.0],
    [48.7, 2.7],
    [48.4, 2.0],
    [48.8, 1.7]
]

ANU_QRNG_API_URL = os.getenv("ANU_QRNG_API_URL", "https://qrng.anu.edu.au/API/jsonI.php?length=1&type=uint8")
FALLBACK_PRNG_SEED_LENGTH = 256


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
        logger.info("Configuration surchargée par les variables d'environnement.")
    except (ValueError, json.JSONDecodeError) as e:
        logger.error(f"Erreur : Variables d'environnement de coordonnées invalides : {e}")
        config['coordinates'] = DEFAULT_COORDINATES
    except Exception as e:
        logger.error(f"Erreur inattendue lors de la surcharge de la configuration : {e}")
    return config

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
        logger.error(f"Erreur lors de la récupération des données météo pour {lat}, {lon} : {e}")
        return None
    except Exception as e:
        logger.error(f"Erreur inattendue lors de la récupération des données météo : {e}")
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
        logger.error("Aucune donnée météo à combiner.")
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
        logger.error(f"Erreur lors de la combinaison des données météo : {e}")
        return None

def get_quantum_entropy(max_retries: int = 3, initial_delay: int = 1) -> Optional[float]:
    logger.warning("L'API ANU QRNG est désactivée/instable. Utilisation du PRNG de secours.")
    fallback_seed = os.urandom(FALLBACK_PRNG_SEED_LENGTH // 8) + str(time.time_ns()).encode()
    random.seed(hashlib.sha256(fallback_seed).hexdigest())
    return random.random()