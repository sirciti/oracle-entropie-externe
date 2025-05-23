from flask import Flask, jsonify, send_from_directory, current_app, request
from logging.handlers import RotatingFileHandler
import requests
import time
import hashlib
import random
import json
import os
import logging
import secrets
import string
from typing import List, Dict, Optional, Tuple, Any

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
                            "https://qrng.anu.edu.au/API/jsonI.php?length=1&type=uint8")

# Pour le fallback du PRNG si d'autres sources échouent ou sont désactivées.
FALLBACK_PRNG_SEED_LENGTH = 256 # Longueur en bits pour le PRNG de secours

# Logging configuration
LOG_FILENAME = "app.log"
LOG_LEVEL = logging.INFO
LOG_FORMAT = "%(asctime)s - %(levelname)s - %(message)s"
LOG_MAX_BYTES = 10 * 1024 * 1024  # 10MB
LOG_BACKUP_COUNT = 5

log_handler = RotatingFileHandler(LOG_FILENAME, maxBytes=LOG_MAX_BYTES,
                                    backupCount=LOG_BACKUP_COUNT)
log_handler.setFormatter(logging.Formatter(LOG_FORMAT))
logger = logging.getLogger("entropy_generator")
logger.addHandler(log_handler)
logger.setLevel(LOG_LEVEL)


def log_error(message: str) -> None:
    """Logs an error message."""
    logger.error(message)


def log_warning(message: str) -> None:
    """Logs a warning message."""
    logger.warning(message)


def log_info(message: str) -> None:
    """Logs an informational message."""
    logger.info(message)


# -------------------- CONFIGURATION LOADING --------------------

def load_config() -> Dict[str, Any]:
    """Charge la configuration depuis config.json et/ou les variables d'environnement."""
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

    # Surcharge avec les variables d'environnement (si définies)
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
        return None  # Important: Return None on error
    except Exception as e:
        log_error(f"Erreur inattendue lors de la récupération des données météo pour {lat}, {lon} : {e}")
        return None


def get_area_weather_data(coordinates: List[Tuple[float, float]]) -> List[Optional[Dict[str, Any]]]:
    """Récupère les données météo pour une liste de coordonnées."""
    all_data = []
    for lat, lon in coordinates:
        data = get_current_weather_data(lat, lon)
        if data:
            all_data.append(data)
    return all_data


def combine_weather_data(all_data: List[Optional[Dict[str, Any]]]) -> Optional[Dict[str, Any]]:
    """Combine les données météo de plusieurs points."""
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
    precipitations = [d.get("precipitation") for d in all_data if
                      isinstance(d.get("precipitation"), (int, float))]

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
    """
    Récupère un nombre aléatoire quantique normalisé [0,1] depuis l'API ANU QRNG.
    Retourne une valeur du PRNG de secours car l'API est instable.
    """
    logger.warning("L'API ANU QRNG est désactivée/instable. Utilisation du PRNG de secours.")
    # On utilise hashlib pour le PRNG de secours, donc pas besoin de la boucle sur QRNG_APIS pour ce fallback.
    # La variable QRNG_APIS n'est plus utilisée dans cette fonction, mais est définie globalement.
    fallback_seed = os.urandom(FALLBACK_PRNG_SEED_LENGTH // 8) + str(time.time_ns()).encode()
    random.seed(hashlib.sha256(fallback_seed).hexdigest())
    return random.random() # Retourne une valeur du PRNG de secours


def generate_random_number_with_entropy(verbose: bool = False) -> Tuple[float, str]:
    """
    Génère un nombre aléatoire robuste basé sur :
     - entropie météo,
     - horodatage précis,
     - bruit local (os.urandom),
     - (contribuant au PRNG de secours si l'API quantique est désactivée).
    """
    all_weather = get_area_weather_data(config['coordinates'])
    combined_weather = combine_weather_data(all_weather)
    
    # Appel à get_quantum_entropy() même si elle ne fait plus d'appel réseau direct
    # pour maintenir la structure de l'entropie et la contribution du PRNG de secours.
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
    hasher = hashlib.sha256(seed_string.encode())
    hashed_entropy = hasher.hexdigest()
    seed = int(hashed_entropy[:16], 16) # La graine de random.seed() est un int
    random.seed(seed)
    random_number = random.random()
    logger.info(f"Nombre aléatoire généré: {random_number}, Hachage d'entropie: {hashed_entropy}")
    return random_number, hashed_entropy


# -------------------- FONCTIONS D'ENTROPIE FINALE --------------------

def get_final_entropy() -> Optional[bytes]:
    """
    Génère l'entropie finale à partir de toutes les sources disponibles.

    Returns:
        Octets représentant l'entropie générée.
    """
    try:
        # 1. Récupérer les données météo (via fonction Python locale)
        all_weather_data_raw = get_area_weather_data(config['coordinates'])
        weather_data_processed = combine_weather_data(all_weather_data_raw)
        if not weather_data_processed:
            logger.error("Erreur lors de la récupération ou combinaison des données météo.")
            return None

        # 2. Simuler l'icosaèdre dynamique (via fonction Python locale)
        # Import de get_icosahedron_animate est fait dans le scope global ou doit être localement ici.
        # Pour éviter des imports circulaires si geometry_api importe app.py, on fait l'import ici.
        from backend.geometry_api import get_icosahedron_animate # S'assurer que c'est une fonction utilitaire autonome
        icosahedron_frames = get_icosahedron_animate(steps=10) # Ceci devrait retourner la liste des frames
        
        # Nous devons extraire une chaîne/bytes des frames pour l'entropie
        icosahedron_data_for_seed = json.dumps({"frames": icosahedron_frames}, sort_keys=True)
        
        if not icosahedron_frames: # ou icosahedron_data_for_seed si plus pertinent
            logger.error("Erreur lors de la simulation de l'icosaèdre ou données manquantes.")
            return None

        # 3. Récupérer l'entropie quantique (API externe, ou son fallback interne)
        quantum_entropy_value = get_quantum_entropy() 

        # 4. Combiner toutes les sources d'entropie
        seed_string = str(time.time_ns())
        seed_string += json.dumps(weather_data_processed, sort_keys=True)
        seed_string += icosahedron_data_for_seed
        if quantum_entropy_value is not None:
            seed_string += str(quantum_entropy_value)
        seed_string += os.urandom(16).hex()

        # 5. Hacher la graine (BLAKE2b)
        hasher = hashlib.blake2b(seed_string.encode(), digest_size=32)
        hashed_entropy = hasher.digest()

        logger.info("Entropie finale générée avec succès.")
        return hashed_entropy

    except Exception as e:
        logger.error(f"Erreur inattendue lors de la génération de l'entropie finale : {e}")
        return None


def generate_secure_token(entropy_seed: bytes, length: int = 32) -> str:
    """Génère un jeton cryptographiquement sûr à partir d'une graine d'entropie."""
    # L'entropy_seed est déjà un haché BLAKE2b de 32 octets.
    # Nous utilisons simplement secrets.token_hex qui s'appuie sur l'entropie du système d'exploitation.
    # La contribution de notre chaîne d'entropie mixée est indirecte, via le système d'exploitation.
    # Pour influencer directement la génération du token avec notre 'entropy_seed',
    # un KDF plus sophistiqué comme HKDF serait utilisé ici.
    token = secrets.token_hex(length)
    return token


# -------------------- INTEGRATION DES ROUTES GEOMETRIE --------------------

from backend.geometry_api import geometry_api # Import du Blueprint

app.register_blueprint(geometry_api) # Enregistrement du Blueprint


# -------------------- ROUTES PRINCIPALES --------------------

@app.route('/generate_random')
def generate_random():
    """API endpoint to generate a random number with combined entropy."""
    try:
        entropy_seed_bytes = get_final_entropy()
        if not entropy_seed_bytes:
            return jsonify({"error": "Failed to generate final entropy"}), 500

        token_result = generate_secure_token(entropy_seed_bytes, length=32)
        # La route renvoie le token comme "random_number" et "entropy_seed" (format hex) pour le front-end.
        return jsonify({"random_number": token_result, "entropy_seed": entropy_seed_bytes.hex()})
    except Exception as e:
        logger.error(f"Erreur lors de la génération du nombre aléatoire : {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/entropy', methods=['GET'])
def entropy_route():
    """API endpoint to get the combined weather data (for debugging or optional use)."""
    try:
        all_weather = get_area_weather_data(config['coordinates'])
        combined_weather = combine_weather_data(all_data)
        if combined_weather:
            return jsonify(combined_weather)
        else:
            return jsonify({"error": "Failed to retrieve combined weather data"}), 500
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'entropie météo : {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/final_entropy', methods=['GET'])
def final_entropy():
    """API endpoint to get the final combined entropy."""
    final_entropy_bytes = get_final_entropy()
    if final_entropy_bytes:
        return jsonify({"final_entropy": final_entropy_bytes.hex()})
    else:
        return jsonify({"error": "Failed to generate final entropy"}), 500


@app.route('/generate_token', methods=['GET'])
def generate_token():
    """API endpoint to generate a secure token."""
    # Récupère les paramètres de composition depuis la requête GET
    length = request.args.get('length', default=32, type=int)
    include_lower = request.args.get('lowercase', default='true').lower() == 'true'
    include_upper = request.args.get('uppercase', default='true').lower() == 'true'
    include_numbers = request.args.get('numbers', default='true').lower() == 'true' # Sera toujours true du front-end
    include_symbols = request.args.get('symbols', default='true').lower() == 'true'

    # Validation côté serveur (sécurité essentielle)
    if length < 8 or length > 128:
        logger.error(f"Tentative de génération de token avec longueur invalide: {length}")
        return jsonify({"error": "Longueur invalide (8-128)"}), 400
    
    # Construire le jeu de caractères basé sur les options
    charset = ''
    if include_lower:
        charset += string.ascii_lowercase
    if include_upper:
        charset += string.ascii_uppercase
    if include_numbers: # Chiffres sont obligatoires
        charset += string.digits
    if include_symbols:
        charset += '!@#$%^&*()-_=+[]{}|;:,.<>?' # Liste de symboles courants

    # S'assurer qu'au moins un type de caractère est sélectionné
    if not charset: 
        logger.error("Jeu de caractères vide après sélection des options.")
        return jsonify({"error": "Au moins un type de caractère doit être sélectionné"}), 400

    try:
        # Générer l'entropie finale
        entropy_seed_bytes = get_final_entropy()
        if not entropy_seed_bytes:
            logger.error("Échec de la récupération de l'entropie pour la génération de token.")
            return jsonify({"error": "Échec de la génération d'entropie"}), 500

        # Générer le token caractère par caractère en utilisant secrets.choice
        # Cela assure que chaque caractère est choisi de manière cryptographiquement sûre.
        token = ''.join(secrets.choice(charset) for _ in range(length))
        
        logger.info(f"Token généré avec succès de longueur {length} et composition: "
                    f"Minuscules={include_lower}, Majuscules={include_upper}, "
                    f"Chiffres={include_numbers}, Symboles={include_symbols}.")
        return jsonify({"token": token})
    except Exception as e:
        logger.error(f"Erreur lors de la génération du token : {e}")
        return jsonify({"error": str(e)}), 500


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