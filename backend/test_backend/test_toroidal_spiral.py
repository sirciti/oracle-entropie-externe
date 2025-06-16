import pytest
from core.app import app

app.config['TESTING'] = True
client = app.test_client()

def test_toroidal_spiral_structure():
    response = client.get("/api/geometry/toroidal_spiral/animate?steps=80&R=8&r=2&n_turns=3&n_points=24")
    assert response.status_code == 200
    data = response.get_json()

    # Vérifie la présence de "frames"
    assert "frames" in data
    assert isinstance(data["frames"], list)
    assert len(data["frames"]) > 0

    # Vérifie la structure d'un frame
    frame = data["frames"][0]
    assert "spiral" in frame
    assert isinstance(frame["spiral"], dict)
    assert "points" in frame["spiral"]

    # Vérifie la structure des points (billes/cubes)
    points = frame["spiral"]["points"]
    assert isinstance(points, list)
    for point in points:
        assert "position" in point
        assert isinstance(point["position"], list)
        assert len(point["position"]) == 3  # Chaque position est un triplet (x, y, z)
        assert "type" in point
        assert point["type"] in ["sphere", "cube"]
        assert "size" in point
        assert "color" in point
        assert isinstance(point["color"], list)
        assert len(point["color"]) == 3  # Couleur RGB