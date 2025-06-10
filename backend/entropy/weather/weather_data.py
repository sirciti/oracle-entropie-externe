import requests
import json
import logging
from typing import List, Dict, Optional, Tuple, Any

# Les fonctions de logging seront gérées par le logger principal via app.py
# et passées en paramètre ou définies localement si nécessaire.
# Pour l'instant, on n'importe pas logger directement ici.

# Le logger pour ce module
logger = logging.getLogger("weather_data_collector")

def get_current_weather_data(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    """Récupère les données météo actuelles pour une paire de coordonnées."""
    try:
        # Assurez-vous que l'URL est correctement formée
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}"
            "&current_weather=true"  # Correction ici : &current_weather=true
            "&hourly=temperature_2m,relative_humidity_2m,pressure_msl,cloudcover,precipitation,windgusts_10m"
            "&forecast_days=1"
            "&timezone=auto"
        )
        response = requests.get(url, timeout=5)
        response.raise_for_status() # Lève une exception pour les codes d'erreur HTTP (4xx, 5xx)
        data = response.json()
        
        weather = data.get("current_weather", {})
        hourly = data.get("hourly", {})
        idx = 0  # premier index horaire (heure courante)
        
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

# Pour le test direct du module
if __name__ == "__main__":
    # Importation du module utils depuis la racine du package backend pour le test direct
    # Cela simule l'environnement de Flask
    import sys
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
    from backend.core.utils.utils import load_config as load_app_config
    
    # Configure un logger de base pour voir les sorties de test
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

    print("--- Test de collecte et combinaison des données météo ---")
    
    # Simule une configuration minimale pour le test
    test_config = load_app_config() # Utilise la fonction load_config depuis utils.py
    
    test_coordinates = test_config.get('coordinates', [
        [48.85, 2.35], # Paris
        [34.05, -118.25] # Los Angeles
    ])

    area_data = get_area_weather_data(test_coordinates)
    print(f"\nDonnées météo par zone: {area_data}")

    combined = combine_weather_data(area_data)
    print(f"\nDonnées météo combinées: {combined}")

    if combined:
        print("\nTest météo réussi: Données combinées reçues.")
    else:
        print("\nTest météo échoué: Aucune donnée combinée reçue.")