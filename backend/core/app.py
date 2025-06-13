import os
from flask import Flask, jsonify, request, send_from_directory
from logging.handlers import RotatingFileHandler
import logging
import sentry_sdk
from typing import List, Dict, Optional, Tuple, Any
from flask_cors import CORS
from sentry_sdk.integrations.flask import FlaskIntegration
from core.utils.utils import load_config, get_area_weather_data, combine_weather_data, get_quantum_entropy
from api.geometry_api import geometry_api
from entropy.quantum.entropy_oracle import (
    generate_quantum_geometric_entropy,
    get_cubes_entropy,
    get_spiral_torus_entropy,
    get_spiral_entropy
)
from streams.token_stream import TokenStreamGenerator

# -------------------- INITIALISATION SENTRY --------------------
if not os.environ.get("DISABLE_SENTRY"):
    sentry_sdk.init(
        dsn=os.environ.get("SENTRY_DSN"),
        integrations=[FlaskIntegration()],
        traces_sample_rate=1.0,
        environment=os.getenv("FLASK_ENV", "dev")
    )

app = Flask(__name__)
CORS(app)

# Enregistrement du blueprint geometry_api avec son préfixe
app.register_blueprint(geometry_api)

# -------------------- CONFIGURATION DU LOGGER DE L'APPLICATION --------------------
LOG_FILENAME = "app.log"
LOG_LEVEL = logging.INFO
LOG_FORMAT = "%(asctime)s - %(levelname)s - %(message)s"
LOG_MAX_BYTES = 10 * 1024 * 1024
LOG_BACKUP_COUNT = 5

log_handler = RotatingFileHandler(LOG_FILENAME, maxBytes=LOG_MAX_BYTES, backupCount=LOG_BACKUP_COUNT)
log_handler.setFormatter(logging.Formatter(LOG_FORMAT))
logger = logging.getLogger("entropy_generator") # Utiliser le logger centralisé
logger.addHandler(log_handler)
logger.setLevel(LOG_LEVEL)

def log_error(message: str) -> None:
    logger.error(message)

def log_warning(message: str) -> None:
    logger.warning(message)

def log_info(message: str) -> None:
    logger.info(message)

# Charge la configuration au démarrage de l'application
config = load_config()

# -------------------- ROUTES PRINCIPALES DE L'API --------------------

@app.route('/generate_random', methods=['GET'])
def generate_random():
    """API endpoint to generate a random number with combined entropy."""
    try:
        # Appelle la fonction d'orchestration de l'entropie finale
        # Tous les paramètres sont passés pour la flexibilité des sources
        entropy_seed_bytes = generate_quantum_geometric_entropy(
            use_weather=True,
            use_icosahedron=True,
            use_quantum=True,
            use_timestamps=True,
            use_local_noise=True,
            use_cubes=True,
            use_spiral_torus=True, # S'assurer que les pyramides sont activées
            # Passer les dépendances de entropy_oracle qui viennent de utils.py
            get_area_weather_data=get_area_weather_data,
            combine_weather_data=combine_weather_data,
            config=config,
            get_quantum_entropy=get_quantum_entropy
        )
        if not entropy_seed_bytes:
            logger.error("Échec de la récupération de l'entropie pour la génération de nombre aléatoire.")
            return jsonify({"error": "Failed to generate final entropy"}), 500

        # Utilisation de TokenStreamGenerator pour un token robuste et traçable
        # Initialisation du générateur avec la graine d'entropie finale
        token_generator_instance = TokenStreamGenerator(hash_algo="blake3", seed=entropy_seed_bytes)
        
        # Générer un token de longueur par défaut (32) avec toutes les options activées
        # La composition est gérée par TokenStreamGenerator.generate_token
        token_result = token_generator_instance.generate_token(length=32)

        return jsonify({"random_number": token_result, "entropy_seed": entropy_seed_bytes.hex()})
    except Exception as e:
        logger.error(f"Erreur lors de la génération du nombre aléatoire : {e}", exc_info=True)
        sentry_sdk.capture_exception(e) # Capture l'exception avec Sentry
        return jsonify({"error": str(e)}), 500


@app.route('/entropy', methods=['GET'])
def entropy_route():
    """API endpoint to get the combined weather data (for debugging or optional use)."""
    try:
        # Cette route ne doit renvoyer que des données météo brutes ou combinées.
        # Pas d'entropie finale complète ici.
        all_weather_data_from_get_area = get_area_weather_data(config['coordinates'])
        combined_weather = combine_weather_data(all_weather_data_from_get_area)
        if combined_weather:
            return jsonify(combined_weather)
        else:
            return jsonify({"error": "Failed to retrieve combined weather data"}), 500
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'entropie météo : {e}", exc_info=True)
        sentry_sdk.capture_exception(e)
        return jsonify({"error": str(e)}), 500

@app.route('/final_entropy', methods=['GET'])
def final_entropy():
    """API endpoint to get the final combined entropy."""
    try:
        final_entropy_bytes = generate_quantum_geometric_entropy(
            use_weather=True,
            use_icosahedron=True,
            use_quantum=True,
            use_timestamps=True,
            use_local_noise=True,
            use_cubes=True,
            use_spiral_torus=True,
            get_area_weather_data=get_area_weather_data,
            combine_weather_data=combine_weather_data,
            config=config,
            get_quantum_entropy=get_quantum_entropy
        )
        if final_entropy_bytes:
            return jsonify({"final_entropy": final_entropy_bytes.hex()})
        else:
            return jsonify({"error": "Failed to generate final entropy"}), 500
    except Exception as e:
        logger.error(f"Erreur lors de la génération de l'entropie finale : {e}", exc_info=True)
        sentry_sdk.capture_exception(e)
        return jsonify({"error": str(e)}), 500


@app.route("/generate_token", methods=["POST"])
def generate_token():
    """API endpoint to generate a secure token with user-defined composition."""
    try:
        data = request.get_json()
        length = data.get("length", 32)
        char_options = data.get("char_options", {
            "lowercase": True, "uppercase": True, "numbers": True, "symbols": True
        })
        weather_enabled = data.get("weather_enabled", True)
        geometries = data.get("geometries", [])

        # Récupérer l'entropie finale du système
        entropy_bytes = generate_quantum_geometric_entropy(
            geometries=geometries,
            use_weather=weather_enabled,
            use_icosahedron="icosahedron" in geometries,
            use_quantum=True,
            use_timestamps=True,
            use_local_noise=True,
            use_cubes="cubes" in geometries,
            use_spiral_torus="spiral_torus" in geometries,
            use_spiral="spiral" in geometries, 
            get_area_weather_data=get_area_weather_data,
            combine_weather_data=combine_weather_data,
            config=config,
            get_quantum_entropy=get_quantum_entropy
        )
        if not entropy_bytes:
            logger.error("Échec de la récupération de l'entropie pour la génération de token.")
            return jsonify({"error": "Failed to generate entropy"}), 500

        # Utilisation du TokenStreamGenerator pour générer le token avec garantie de composition
        token_generator_instance = TokenStreamGenerator(
            hash_algo="blake3", # Algorithme de hachage pour le CSPRNG
            seed=entropy_bytes,
            char_options=char_options
        )
        token = token_generator_instance.generate_token(length)

        return jsonify({"token": token, "entropy_seed": entropy_bytes.hex() if entropy_bytes else None})
    except ValueError as e: # Capturer les erreurs de validation (ex: longueur trop courte)
        logger.error(f"Erreur de validation lors de la génération du token : {e}", exc_info=True)
        sentry_sdk.capture_exception(e)
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Erreur lors de la génération du token : {e}", exc_info=True)
        sentry_sdk.capture_exception(e)
        return jsonify({"error": str(e)}), 500


logger = logging.getLogger(__name__)

@app.route('/stream_tokens', methods=['POST'])
def stream_tokens():
    """API endpoint to generate a stream of secure tokens."""
    try:
        data = request.get_json()
        num_tokens = data.get('num_tokens', 1)
        length = data.get('length', 32)
        char_options = data.get('char_options', {})
        generator = TokenStreamGenerator(char_options=char_options)
        tokens = []
        for _ in range(num_tokens):
            token = generator.generate_token(length)
            if token is None:
                return jsonify({'error': 'No character set selected'}), 400
            tokens.append(token)
        return jsonify({'tokens': tokens}), 200
    except ValueError as ve:
        logger.error(f"Erreur de validation : {ve}")
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        logger.error(f"Erreur lors de la génération du flux de tokens : {e}")
        return jsonify({'error': str(e)}), 500

# -------------------- ROUTES POUR SERVIR LE FRONT-END (pour développement local SANS Vite proxy) --------------------
# Ces routes sont actives si Flask est censé servir les fichiers front-end (ex: en développement sans Vite proxy)
# Si vous utilisez Vite avec un proxy (recommandé), vous pouvez les commenter.
@app.route('/')
def serve_index():
    """Serves the main page (frontend)."""
    return send_from_directory('/usr/src/app/frontend', 'index.html')


@app.route('/<path:filename>')
def serve_static(filename):
    """Serves static files (CSS, JS, etc.) from the frontend."""
    return send_from_directory('/usr/src/app/frontend', filename)

@app.route('/test-sentry', methods=['GET'])
def test_sentry():
    """Endpoint de test pour Sentry qui génère une erreur."""
    try:
        # Génère une erreur de division par zéro
        result = 1 / 0
        return jsonify({'result': result}), 200
    except Exception as e:
        # Capture l'exception avec Sentry et la relance
        sentry_sdk.capture_exception(e)
        logger.error(f"Erreur dans /test-sentry : {e}", exc_info=True)
        raise e  # Propage l'erreur pour obtenir un code 500


if __name__ == '__main__':
    try:
        loaded_config = load_config()
        print(f"Appel Open-Meteo pour latitude={loaded_config['latitude']}, longitude={loaded_config['longitude']}")
        print(f"Coordonnées utilisées: {loaded_config['coordinates']}")
        app.run(host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        logger.error(f"Erreur lors du démarrage de l'application Flask : {e}", exc_info=True)
        sentry_sdk.capture_exception(e)