# backend/test_backend/test_icosahedron.py

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
import pytest
from core.app import app
from flask import Flask

@pytest.fixture
def test_client():
    """Fixture pour créer un client de test Flask avec un contexte d'application."""
    app.config['TESTING'] = True
    with app.app_context():
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
    assert 'avg_temperature' in data or 'error' in data

def test_icosahedron_initial(test_client):
    """Test de la route /geometry/icosahedron/initial (génération d'icosaèdre)."""
    response = test_client.get('/geometry/icosahedron/initial?radius=1.0&position=[0,0,0]')
    assert response.status_code == 200
    data = response.get_json()
    assert 'vertices' in data and 'faces' in data
    assert isinstance(data['vertices'], list)
    assert isinstance(data['faces'], list)
    assert len(data['vertices']) > 0
    assert len(data['faces']) > 0

def test_icosahedron_subdivide(test_client):
    """Test de la route /geometry/icosahedron/subdivide (subdivision d'icosaèdre)."""
    response = test_client.get('/geometry/icosahedron/subdivide?radius=1.0&position=[0,0,0]')
    assert response.status_code == 200
    data = response.get_json()
    assert 'vertices' in data and 'faces' in data
    assert isinstance(data['vertices'], list)
    assert isinstance(data['faces'], list)
    initial_response = test_client.get('/geometry/icosahedron/initial?radius=1.0&position=[0,0,0]')
    initial_vertices_count = len(initial_response.get_json()['vertices'])
    assert len(data['vertices']) > initial_vertices_count

def test_icosahedron_animate(test_client):
    """Test de la route /geometry/icosahedron/animate (animation de l'icosaèdre)."""
    response = test_client.get('/geometry/icosahedron/animate?steps=2&position=[0,0,0]')
    assert response.status_code == 200
    data = response.get_json()
    assert 'frames' in data
    assert isinstance(data['frames'], list)
    assert len(data['frames']) == 2

def test_icosahedron_animate_params(test_client):
    """Test de la route /geometry/icosahedron/animate avec paramètres."""
    response = test_client.get('/geometry/icosahedron/animate?radius=2&rotation_angle=0.785&steps=5&position=[0,0,0]')
    assert response.status_code == 200
    data = response.get_json()
    assert 'frames' in data
    assert len(data['frames']) == 5

def test_icosahedron_animate_invalid_params(test_client):
    """Test de la route /geometry/icosahedron/animate avec paramètres invalides."""
    response = test_client.get('/geometry/icosahedron/animate?position=invalid')
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
    assert len(data['final_entropy']) == 64

def test_generate_token(test_client):
    """Test de la route /stream_tokens (génération de token sécurisé avec options)."""
    response = test_client.post('/stream_tokens', json={
        'num_tokens': 1, 'length': 16,
        'char_options': {'lowercase': True, 'uppercase': False, 'numbers': True, 'symbols': False}
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'tokens' in data
    assert isinstance(data['tokens'], list)
    assert len(data['tokens']) == 1
    token = data['tokens'][0]
    assert isinstance(token, str)
    assert len(token) == 16
    assert any(char.islower() for char in token)
    assert any(char.isdigit() for char in token)

    response_all_types = test_client.post('/stream_tokens', json={
        'num_tokens': 1, 'length': 64,
        'char_options': {'lowercase': True, 'uppercase': True, 'numbers': True, 'symbols': True}
    })
    assert response_all_types.status_code == 200
    data_all_types = response_all_types.get_json()
    assert len(data_all_types['tokens'][0]) == 64
    assert any(char.islower() for char in data_all_types['tokens'][0])
    assert any(char.isupper() for char in data_all_types['tokens'][0])
    assert any(char.isdigit() for char in data_all_types['tokens'][0])
    assert any(char in '!@#$%^&*()-_=+[]{}|;:,.<>?' for char in data_all_types['tokens'][0])

    response_invalid_length = test_client.post('/stream_tokens', json={
        'num_tokens': 1, 'length': 5,
        'char_options': {'lowercase': True, 'uppercase': True, 'numbers': True, 'symbols': False}
    })
    assert response_invalid_length.status_code == 400
    assert 'error' in response_invalid_length.get_json()

    response_no_charset = test_client.post('/stream_tokens', json={
        'num_tokens': 1, 'length': 16,
        'char_options': {'lowercase': False, 'uppercase': False, 'numbers': False, 'symbols': False}
    })
    assert response_no_charset.status_code == 400
    assert 'error' in response_no_charset.get_json()