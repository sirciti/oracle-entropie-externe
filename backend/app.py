from flask import Flask, jsonify
import pyowm
import json

app = Flask(__name__)

# Remplacez par votre clé API OpenWeatherMap
API_KEY = "f9ecb24e337d6246cee5d264b813d029"  # Assurez-vous que votre clé correcte est ici
owm = pyowm.OWM(API_KEY)
mgr = owm.weather_manager()
region_name = "Île-de-France, FR"

def get_entropy_data():
    try:
        observation = mgr.weather_at_place(region_name)
        weather = observation.weather
        raw_data = {
            "temperature": weather.temperature('celsius')['temp'],
            "humidity": weather.humidity,
            "pressure": weather.pressure['press'],
            "wind_speed": weather.wind()['speed']
        }
        entropy_data = {}
        for key, value in raw_data.items():
            if isinstance(value, float):
                decimal_part = value - int(value)
                entropy_data[key] = decimal_part
            elif isinstance(value, int):
                entropy_data[key] = value % 10 / 10.0
            else:
                entropy_data[key] = value
        return jsonify(entropy_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/entropy', methods=['GET'])
def entropy():
    return get_entropy_data()

if __name__ == '__main__':
    app.run(debug=True)