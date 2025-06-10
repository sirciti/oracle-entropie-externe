from flask import Flask, jsonify
from dotenv import load_dotenv
import os
from utils import get_area_weather_data, combine_weather_data
import requests

app = Flask(__name__)

load_dotenv()
WEATHER_API_URL = os.getenv("WEATHER_API_URL")
COORDINATES = [
    (49.1, 2.0),
    (48.7, 2.7),
    (48.4, 2.0),
    (48.8, 1.7)
]

previous_weather_data = None

def get_current_weather_data():
    try:
        url = f"{WEATHER_API_URL}?latitude={LATITUDE}&longitude={LONGITUDE}&current_weather=true"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()["current_weather"]
        return {
            "temperature": data["temperature"],
            "humidity": data.get("relativehumidity", 0),  # si absent, 0 par défaut
            "pressure": data.get("pressure_msl", 0),      # idem
            "wind_speed": data["windspeed"]
        }
    except Exception as e:
        print(f"Erreur lors de la récupération des données météo : {e}")
        return None

def get_entropy_data():
    global previous_weather_data
    all_weather_data = get_area_weather_data(COORDINATES)
    current_weather_data = combine_weather_data(all_weather_data)

    if current_weather_data:
        entropy_data = {}
        if previous_weather_data:
            temperature_change = current_weather_data["avg_temperature"] - previous_weather_data["avg_temperature"]
            wind_speed_change = current_weather_data["max_wind_speed"] - previous_weather_data["max_wind_speed"]
            entropy_data["temperature_change"] = temperature_change - int(temperature_change)
            entropy_data["wind_speed_change"] = wind_speed_change - int(wind_speed_change)
            entropy_data["current_humidity_decimal"] = current_weather_data["avg_humidity"] % 10 / 10.0
            entropy_data["current_pressure_decimal"] = current_weather_data["avg_pressure"] % 10 / 10.0
        else:
            entropy_data["current_temperature_decimal"] = current_weather_data["avg_temperature"] - int(current_weather_data["avg_temperature"])
            entropy_data["current_wind_speed_decimal"] = current_weather_data["max_wind_speed"] - int(current_weather_data["max_wind_speed"])
            entropy_data["current_humidity_decimal"] = current_weather_data["avg_humidity"] % 10 / 10.0
            entropy_data["current_pressure_decimal"] = current_weather_data["avg_pressure"] % 10 / 10.0

        previous_weather_data = current_weather_data
        return jsonify(entropy_data)
    else:
        return jsonify({"error": "Failed to retrieve weather data"}), 500

@app.route("/entropy", methods=["GET"])
def entropy():
    return get_entropy_data()