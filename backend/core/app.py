import os
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from sentry_sdk.integrations.flask import FlaskIntegration
import sentry_sdk
import psycopg2
import time
from datetime import datetime
from api.geometry_api import geometry_api
from core.utils import load_config, generate_quantum_geometric_entropy, get_area_weather_data, combine_weather_data, get_quantum_entropy, TokenStreamGenerator

# Configuration du logger
logger = logging.getLogger(__name__)
LOG_FILENAME = "app.log"
LOG_LEVEL = logging.INFO
LOG_FORMAT = "%(asctime)s - %(levelname)s - %(message)s"
LOG_MAX_BYTES = 10 * 1024 * 1024
LOG_BACKUP_COUNT = 5

log_handler = RotatingFileHandler(LOG_FILENAME, maxBytes=LOG_MAX_BYTES, backupCount=LOG_BACKUP_COUNT)
log_handler.setFormatter(logging.Formatter(LOG_FORMAT))
logger.addHandler(log_handler)
logger.setLevel(LOG_LEVEL)

# Initialisation de Sentry
sentry_sdk.init(
    dsn=os.environ.get("SENTRY_DSN"),
    integrations=[FlaskIntegration()],
    traces_sample_rate=1.0,
    environment=os.getenv("FLASK_ENV", "dev")
)
logger.info("Sentry initialized with DSN: %s", os.environ.get("SENTRY_DSN"))

# Initialisation de l'application Flask
app = Flask(__name__)
CORS(app)

# Enregistrement du blueprint geometry_api
app.register_blueprint(geometry_api, url_prefix="/api/geometry")

# Fonctions utilitaires pour le logging
def log_error(message: str) -> None:
    logger.error(message)

def log_warning(message: str) -> None:
    logger.warning(message)

def log_info(message: str) -> None:
    logger.info(message)

# Charge la configuration
config = load_config()

# Dictionnaire pour stocker les temps de début des visites par IP et page
visit_start_times = {}

# Middleware pour enregistrer les visites et le temps passé
@app.before_request
def log_visit_start():
    try:
        client_ip = request.remote_addr
        page_path = request.path
        start_time = time.time()
        visit_key = f"{client_ip}:{page_path}"
        visit_start_times[visit_key] = start_time
        
        # Récupérer un identifiant de vue si disponible (par exemple, via un paramètre URL ou un en-tête)
        view_id = request.args.get('view_id', request.headers.get('X-View-ID', 'default'))
        
        # Enregistrer la visite initiale dans la base de données
        conn = psycopg2.connect(
            database=os.getenv("DB_NAME", "oracle_visits"),
            user=os.getenv("DB_USER", "oracle_user"),
            password=os.getenv("DB_PASSWORD", "oracle_pass"),
            host=os.getenv("DB_HOST", "db"),
            port=os.getenv("DB_PORT", "5432")
        )
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO visites (page, ip_address, view_id) VALUES (%s, %s, %s) RETURNING id",
            (page_path, client_ip, view_id)
        )
        visit_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        # Stocker l'ID de la visite pour mise à jour ultérieure
        request.visit_id = visit_id
        request.visit_key = visit_key
    except Exception as e:
        logger.error(f"Erreur lors de l'enregistrement de la visite : {e}")

@app.after_request
def log_visit_end(response):
    try:
        if hasattr(request, 'visit_key') and request.visit_key in visit_start_times:
            logger.info(f"Calcul du temps passé pour {request.visit_key}")
            client_ip = request.remote_addr
            page_path = request.path
            end_time = time.time()
            start_time = visit_start_times.pop(request.visit_key)
            time_spent = int(end_time - start_time)
            
            conn = psycopg2.connect(
                database=os.getenv("DB_NAME", "oracle_visits"),
                user=os.getenv("DB_USER", "oracle_user"),
                password=os.getenv("DB_PASSWORD", "oracle_pass"),
                host=os.getenv("DB_HOST", "db"),
                port=os.getenv("DB_PORT", "5432")
            )
            cur = conn.cursor()
            cur.execute(
                "UPDATE visites SET time_spent = %s WHERE id = %s",
                (time_spent, request.visit_id)
            )
            conn.commit()
            cur.close()
            conn.close()
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du temps passé : {e}")
    return response

# Routes principales de l'API
@app.route('/generate_random', methods=['GET'])
def generate_random():
    try:
        entropy_seed_bytes = generate_quantum_geometric_entropy(
            use_weather=True,
            use_icosahedron=True,
            use_quantum=True,
            use_timestamps=True,
            use_local_noise=True,
            use_cubes=True,
            use_spiral_torus=False,
            use_spiral_simple=False,
            get_area_weather_data=get_area_weather_data,
            combine_weather_data=combine_weather_data,
            config=config,
            get_quantum_entropy=get_quantum_entropy
        )
        if not entropy_seed_bytes:
            logger.error("Échec de la récupération de l'entropie pour la génération de nombre aléatoire.")
            return jsonify({"error": "Failed to generate final entropy"}), 500

        token_generator_instance = TokenStreamGenerator(hash_algo="blake3", seed=entropy_seed_bytes)
        token_result = token_generator_instance.generate_token(length=32)

        return jsonify({"random_number": token_result, "entropy_seed": entropy_seed_bytes.hex()})
    except Exception as e:
        logger.error(f"Erreur lors de la génération du nombre aléatoire : {e}", exc_info=True)
        sentry_sdk.capture_exception(e)
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
        logger.error(f"Erreur lors de la récupération de l'entropie météo : {e}", exc_info=True)
        sentry_sdk.capture_exception(e)
        return jsonify({"error": str(e)}), 500

@app.route('/final_entropy', methods=['GET'])
def final_entropy():
    try:
        final_entropy_bytes = generate_quantum_geometric_entropy(
            use_weather=True,
            use_icosahedron=True,
            use_quantum=True,
            use_timestamps=True,
            use_local_noise=True,
            use_cubes=True,
            use_spiral_torus=False,
            use_spiral_simple=False,
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

@app.route("/api/generate_token", methods=["POST"])
def generate_token():
    try:
        data = request.get_json()
        length = data.get("length", 32)
        char_options = data.get("char_options", {
            "lowercase": True, "uppercase": True, "numbers": True, "symbols": True
        })
        weather_enabled = data.get("weather_enabled", True)
        geometries = data.get("geometries", [])

        entropy_bytes = generate_quantum_geometric_entropy(
            geometries=geometries,
            use_weather=weather_enabled,
            use_icosahedron="icosahedron" in geometries,
            use_quantum=True,
            use_timestamps=True,
            use_local_noise=True,
            use_cubes="cubes" in geometries,
            use_spiral_torus="spiral_torus" in geometries,
            use_spiral_simple="spiral_simple" in geometries,
            get_area_weather_data=get_area_weather_data,
            combine_weather_data=combine_weather_data,
            config=config,
            get_quantum_entropy=get_quantum_entropy
        )
        if not entropy_bytes:
            logger.error("Échec de la récupération de l'entropie pour la génération de token.")
            return jsonify({"error": "Failed to generate entropy"}), 500

        token_generator_instance = TokenStreamGenerator(
            hash_algo="blake3",
            seed=entropy_bytes,
            char_options=char_options
        )
        token = token_generator_instance.generate_token(length)

        return jsonify({"token": token, "entropy_seed": entropy_bytes.hex() if entropy_bytes else None})
    except ValueError as e:
        logger.error(f"Erreur de validation lors de la génération du token : {e}", exc_info=True)
        sentry_sdk.capture_exception(e)
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Erreur lors de la génération du token : {e}", exc_info=True)
        sentry_sdk.capture_exception(e)
        return jsonify({"error": str(e)}), 500

@app.route("/stream_tokens", methods=["POST"])
def stream_tokens():
    try:
        data = request.get_json()
        num_tokens = data.get('num_tokens', 1)
        length = data.get('length', 32)
        char_options = data.get('char_options', {})

        if not (8 <= length <= 128):
            return jsonify({'error': 'Length must be between 8 and 128'}), 400

        try:
            generator = TokenStreamGenerator(char_options=char_options)
            tokens = []
            for _ in range(num_tokens):
                token = generator.generate_token(length)
                if token is None:
                    return jsonify({'error': 'No character set selected'}), 400
                tokens.append(token)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

        return jsonify({'tokens': tokens}), 200
    except Exception as e:
        logger.error(f"Erreur lors de la génération du flux de tokens : {e}", exc_info=True)
        sentry_sdk.capture_exception(e)
        return jsonify({"error": str(e)}), 500

@app.route("/api/token/stream", methods=["GET"])
def token_stream():
    from core.utils import TokenStreamGenerator
    generator = TokenStreamGenerator()
    token = generator.generate_token(32)
    return jsonify({"token": token})

# Routes pour servir le frontend (développement local sans Vite proxy)
@app.route('/')
def serve_index():
    return send_from_directory('/usr/src/app/frontend', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('/usr/src/app/frontend', filename)

@app.route('/test-sentry')
def test_sentry():
    try:
        return 1 / 0
    except ZeroDivisionError as e:
        sentry_sdk.capture_exception(e)
        return jsonify({"error": "Sentry test triggered"}), 500

if __name__ == '__main__':
    try:
        loaded_config = load_config()
        logger.info(f"Appel Open-Meteo pour latitude={loaded_config['latitude']}, longitude={loaded_config['longitude']}")
        logger.info(f"Coordonnées utilisées: {loaded_config['coordinates']}")
        app.run(host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        logger.error(f"Erreur lors du démarrage de l'application Flask : {e}", exc_info=True)
        sentry_sdk.capture_exception(e)
