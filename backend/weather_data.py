import pyowm
import json

# Remplacez par votre clé API OpenWeatherMap
API_KEY = "f9ecb24e337d6246cee5d264b813d029"  # Assurez-vous que votre clé correcte est ici

# Initialisation du gestionnaire d'API
owm = pyowm.OWM(API_KEY)
mgr = owm.weather_manager()

# Définition de la localisation pour l'Île-de-France
region_name = "Île-de-France, FR"

try:
    # Récupération des données météorologiques actuelles
    observation = mgr.weather_at_place(region_name)
    weather = observation.weather

    raw_data = {
        "temperature": weather.temperature('celsius')['temp'],
        "humidity": weather.humidity,
        "pressure": weather.pressure['press'],
        "wind_speed": weather.wind()['speed']
    }

    # Extraction de l'entropie (parties décimales)
    entropy_data = {}
    for key, value in raw_data.items():
        if isinstance(value, float):
            decimal_part = value - int(value)
            entropy_data[key] = decimal_part
        elif isinstance(value, int):
            entropy_data[key] = value % 10 / 10.0
        else:
            entropy_data[key] = value

    # Formatage en JSON
    entropy_json = json.dumps(entropy_data)
    print("\nDonnées d'entropie en JSON :")
    print(entropy_json)

except Exception as e:
    print(f"Erreur lors de la récupération des données météorologiques : {e}")