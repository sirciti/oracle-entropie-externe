# backend/test_backend/test_icosahedron.py

import pytest
from backend.app import app
from flask import Flask # Import Flask for app.app_context() in fixture
import json

@pytest.fixture
def test_client():
    """Fixture pour créer un client de test Flask avec un contexte d'application."""
    app.config['TESTING'] = True
    with app.app_context(): # Crée le contexte d'application
        with app.test_client() as client:
            yield client

def test_generate_random(test_client):
    """Test de la route /generate_random (génération de nombre aléatoire / token)."""
    response = test_client.get('/generate_random')
    assert response.status_code == 200
    data = response.get_json()
    assert 'random_number' in data
    assert 'entropy_seed' in data
    assert isinstance(data['random_number'], str)
    assert isinstance(data['entropy_seed'], str)
    assert len(data['random_number']) > 0

def test_entropy_route(test_client):
    """Test de la route /entropy (données météo combinées)."""
    response = test_client.get('/entropy')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, dict)
    # On peut s'attendre à avg_temperature, etc., ou à une erreur si les données météo ne sont pas disponibles
    assert 'avg_temperature' in data or 'error' in data 

def test_icosahedron_initial(test_client):
    """Test de la route /icosahedron/initial (génération d'icosaèdre)."""
    response = test_client.get('/icosahedron/initial')
    assert response.status_code == 200
    data = response.get_json()
    assert 'vertices' in data and 'faces' in data
    assert isinstance(data['vertices'], list)
    assert isinstance(data['faces'], list)
    assert len(data['vertices']) > 0
    assert len(data['faces']) > 0

def test_icosahedron_subdivide(test_client):
    """Test de la route /icosahedron/subdivide (subdivision d'icosaèdre)."""
    response = test_client.get('/icosahedron/subdivide')
    assert response.status_code == 200
    data = response.get_json()
    assert 'vertices' in data and 'faces' in data
    assert isinstance(data['vertices'], list)
    assert isinstance(data['faces'], list)
    # S'assure que la subdivision a ajouté des sommets
    initial_vertices_count = len(test_client.get('/icosahedron/initial').get_json()['vertices'])
    assert len(data['vertices']) > initial_vertices_count

def test_icosahedron_animate(test_client):
    """Test de la route /icosahedron/animate (animation de l'icosaèdre)."""
    response = test_client.get('/icosahedron/animate?steps=2')
    assert response.status_code == 200
    data = response.get_json()
    assert 'frames' in data
    assert isinstance(data['frames'], list)
    assert len(data['frames']) == 2 # Vérifie le nombre de frames

def test_icosahedron_animate_params(test_client):
    """Test de la route /icosahedron/animate avec paramètres."""
    response = test_client.get('/icosahedron/animate?radius=2&rotation_angle=0.785&steps=5')
    assert response.status_code == 200
    data = response.get_json()
    assert 'frames' in data
    assert len(data['frames']) == 5

def test_icosahedron_animate_invalid_params(test_client):
    """Test de la route /icosahedron/animate avec paramètres invalides."""
    response = test_client.get('/icosahedron/animate?position=invalid')
    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data

def test_final_entropy(test_client):
    """Test de la route /final_entropy (entropie finale combinée)."""
    response = test_client.get('/final_entropy')
    assert response.status_code == 200
    data = response.get_json()
    assert 'final_entropy' in data
    assert isinstance(data['final_entropy'], str)
    assert len(data['final_entropy']) == 64 # BLAKE2b digest_size=32 -> 64 hex chars

def test_generate_token(test_client):
    """Test de la route /generate_token (génération de token sécurisé avec options)."""
    response = test_client.get('/generate_token?length=16&lowercase=true&numbers=true')
    assert response.status_code == 200
    data = response.get_json()
    assert 'token' in data
    assert isinstance(data['token'], str)
    assert len(data['token']) == 16 # Vérifie la longueur demandée
    assert any(char.islower() for char in data['token']) # Vérifie la composition
    assert any(char.isdigit() for char in data['token'])

    response_all_types = test_client.get('/generate_token?length=64&lowercase=true&uppercase=true&numbers=true&symbols=true')
    assert response_all_types.status_code == 200
    data_all_types = response_all_types.get_json()
    assert len(data_all_types['token']) == 64
    assert any(char.islower() for char in data_all_types['token'])
    assert any(char.isupper() for char in data_all_types['token'])
    assert any(char.isdigit() for char in data_all_types['token'])
    assert any(char in '!@#$%^&*()-_=+[]{}|;:,.<>?' for char in data_all_types['token'])

    response_invalid_length = test_client.get('/generate_token?length=5')
    assert response_invalid_length.status_code == 400
    assert 'error' in response_invalid_length.get_json()

    response_no_charset = test_client.get('/generate_token?lowercase=false&uppercase=false&numbers=false&symbols=false')
    assert response_no_charset.status_code == 400
    assert 'error' in response_no_charset.get_json()