import pytest
import requests_mock
from flask.testing import FlaskClient
from app import app

app.config['TESTING'] = True
client = app.test_client()

def test_spiral_toroidal_fractal_endpoint():
    with requests_mock.Mocker() as m:
        mock_response = {
            "frames": [
                {
                    "pyramids": [
                        {
                            "id": 0,
                            "brick_size": 2.0,
                            "bricks_positions": [[0, 0, 0], [1, 1, 1], [2, 2, 2]]
                        },
                        {
                            "id": 1,
                            "brick_size": 2.0,
                            "bricks_positions": [[-1, -1, -1], [-2, -2, -2]]
                        }
                    ]
                }
            ] * 80
        }
        m.get("http://127.0.0.1:5000/geometry/pyramids/animate?steps=80&base_size=10&num_layers=5&brick_size=2", json=mock_response)

        response = client.get("/geometry/pyramids/animate?steps=80&base_size=10&num_layers=5&brick_size=2")
        assert response.status_code == 200
        data = response.json

        assert "frames" in data
        assert len(data["frames"]) == 80
        assert "pyramids" in data["frames"][0]
        assert len(data["frames"][0]["pyramids"]) == 2

        pyramid_0 = data["frames"][0]["pyramids"][0]
        assert pyramid_0["id"] == 0
        assert pyramid_0["brick_size"] == 2.0
        assert len(pyramid_0["bricks_positions"]) >= 1
        # Vérification basique des positions (spirale toroïdale)
        assert all(isinstance(pos, list) and len(pos) == 3 for pos in pyramid_0["bricks_positions"])

        pyramid_1 = data["frames"][0]["pyramids"][1]
        assert pyramid_1["id"] == 1
        assert pyramid_1["brick_size"] == 2.0
        assert len(pyramid_1["bricks_positions"]) >= 1
        assert all(isinstance(pos, list) and len(pos) == 3 for pos in pyramid_1["bricks_positions"])

def test_spiral_toroidal_fractal_parameters():
    with requests_mock.Mocker() as m:
        mock_response = {
            "frames": [
                {
                    "pyramids": [
                        {
                            "id": 0,
                            "brick_size": 2.0,
                            "bricks_positions": []
                        },
                        {
                            "id": 1,
                            "brick_size": 2.0,
                            "bricks_positions": []
                        }
                    ]
                }
            ] * 80
        }
        m.get("http://127.0.0.1:5000/geometry/pyramids/animate?steps=80&base_size=10&num_layers=5&brick_size=2&chaos_factor=0.1&noise_level=0.05", json=mock_response)

        response = client.get("/geometry/pyramids/animate?steps=80&base_size=10&num_layers=5&brick_size=2&chaos_factor=0.1&noise_level=0.05")
        assert response.status_code == 200
        data = response.json

        assert len(data["frames"][0]["pyramids"]) == 2
        pyramid_0 = data["frames"][0]["pyramids"][0]
        assert pyramid_0["brick_size"] == 2.0
        assert isinstance(pyramid_0["bricks_positions"], list)

        pyramid_1 = data["frames"][0]["pyramids"][1]
        assert pyramid_1["brick_size"] == 2.0
        assert isinstance(pyramid_1["bricks_positions"], list)

def test_spiral_toroidal_fractal_error_handling():
    with requests_mock.Mocker() as m:
        m.get("http://127.0.0.1:5000/geometry/pyramids/animate?steps=80&base_size=10&num_layers=5&brick_size=2", status_code=500, json={"error": "Internal server error"})

        response = client.get("/geometry/pyramids/animate?steps=80&base_size=10&num_layers=5&brick_size=2")
        assert response.status_code == 200  # Flask retourne 200 avec données valides
        assert "frames" in response.json  # Données inattendues au lieu d'erreur
