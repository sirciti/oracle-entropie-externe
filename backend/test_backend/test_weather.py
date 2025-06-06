import pytest
import requests_mock

def test_entropy_endpoint(test_client):
    """Teste l'endpoint /entropy avec des données météo simulées."""
    mock_weather_data = {
        "current_weather": {
            "temperature": 15.7,
            "windspeed": 3.5
        },
        "hourly": {
            "time": ["2025-06-06T12:00"],
            "temperature_2m": [15.7],
            "relative_humidity_2m": [65],
            "pressure_msl": [1013.2],
            "cloudcover": [20],
            "precipitation": [0.0],
            "windgusts_10m": [10.0]
        }
    }
    coordinates = [
        (49.1, 2.0),
        (48.7, 2.7),
        (48.4, 2.0),
        (48.8, 1.7)
    ]
    with requests_mock.Mocker() as m:
        for lat, lon in coordinates:
            m.get(
                f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,pressure_msl,cloudcover,precipitation,windgusts_10m&forecast_days=1&timezone=auto",
                json=mock_weather_data
            )
        response = test_client.get("/entropy")
        assert response.status_code == 200
        data = response.get_json()
        # Adapte ici selon ce que ton endpoint retourne réellement
        assert "avg_humidity" in data
        assert data["avg_humidity"] == pytest.approx(65.0)
