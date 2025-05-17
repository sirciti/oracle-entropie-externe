from flask import Flask, jsonify
import pyowm
import time

# Remplacez par votre clé API OpenWeatherMap
API_KEY = "f9ecb24e337d6246cee5d264b813d029"  # <-- Mets ici ta clé valide

app = Flask(__name__)

# Initialisation du gestionnaire d'API
owm = pyowm.OWM(API_KEY)
mgr = owm.weather_manager()
region_name = "Île-de-France,FR"  # Pas d'espace après la virgule

previous_weather_data = None

def get_current_weather_data():
    try:
        observation = mgr.weather_at_place(region_name)
        weather = observation.weather
        return {
            "temperature": weather.temperature('celsius')['temp'],
            "humidity": weather.humidity,
            "pressure": weather.pressure['press'],
            "wind_speed": weather.wind()['speed']
        }
    except Exception as e:
        print(f"Erreur lors de la récupération des données météorologiques : {e}")
        return None

def get_entropy_data():
    global previous_weather_data
    current_weather_data = get_current_weather_data()

    if current_weather_data:
        entropy_data = {}
        if previous_weather_data:
            temperature_change = current_weather_data['temperature'] - previous_weather_data['temperature']
            wind_speed_change = current_weather_data['wind_speed'] - previous_weather_data['wind_speed']

            entropy_data['temperature_change'] = temperature_change - int(temperature_change)
            entropy_data['wind_speed_change'] = wind_speed_change - int(wind_speed_change)
            entropy_data['current_humidity_decimal'] = current_weather_data['humidity'] % 10 / 10.0
            entropy_data['current_pressure_decimal'] = current_weather_data['pressure'] % 10 / 10.0
        else:
            # Première requête, pas de changement à calculer
            entropy_data['current_temperature_decimal'] = current_weather_data['temperature'] - int(current_weather_data['temperature'])
            entropy_data['current_wind_speed_decimal'] = current_weather_data['wind_speed'] - int(current_weather_data['wind_speed'])
            entropy_data['current_humidity_decimal'] = current_weather_data['humidity'] % 10 / 10.0
            entropy_data['current_pressure_decimal'] = current_weather_data['pressure'] % 10 / 10.0

        previous_weather_data = current_weather_data
        return jsonify(entropy_data)
    else:
        return jsonify({"error": "Failed to retrieve weather data"}), 500

@app.route('/entropy', methods=['GET'])
def entropy():
    return get_entropy_data()

if __name__ == '__main__':
    app.run(debug=True)
