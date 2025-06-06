# backend/test_backend/test_pyramids.py

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
import pytest
from backend.app import app
from flask import Flask
import json

@pytest.fixture
def test_client():
    """Fixture pour créer un client de test Flask avec un contexte d'application."""
    app.config['TESTING'] = True
    with app.app_context():
        with app.test_client() as client:
            yield client

def test_pyramids_initial(test_client):
    """Test de la route /geometry/pyramids/initial (génération du système de pyramides)."""
    response = test_client.get('/geometry/pyramids/initial')
    assert response.status_code == 200
    data = response.get_json()
    assert 'pyramids' in data and isinstance(data['pyramids'], list)
    assert len(data['pyramids']) == 2  # Deux pyramides
    assert 'bricks' in data['pyramids'][0] and isinstance(data['pyramids'][0]['bricks'], list)
    assert len(data['pyramids'][0]['bricks']) > 0  # Au moins une brique

def test_pyramids_initial_params(test_client):
    """Test de la route /geometry/pyramids/initial avec paramètres."""
    response = test_client.get('/geometry/pyramids/initial?base_size=3&num_layers=2&brick_size=1')
    assert response.status_code == 200
    data = response.get_json()
    assert 'pyramids' in data and isinstance(data['pyramids'], list)
    # 3x3=9 bricks at layer 0, 1x1=1 brick at layer 1: 10 bricks per pyramid, 20 total
    total_bricks = sum(len(p['bricks']) for p in data['pyramids'])
    assert total_bricks == 20
    # Vérifie que chaque brique a une position cohérente (base_size influence la position)
    for pyramid in data['pyramids']:
        for brick in pyramid['bricks']:
            assert isinstance(brick['position'], list)
            assert len(brick['position']) == 3

def test_pyramids_animate(test_client):
    """Test de la route /geometry/pyramids/animate (animation du système de pyramides)."""
    response = test_client.get('/geometry/pyramids/animate?steps=3')
    assert response.status_code == 200
    data = response.get_json()
    assert 'frames' in data and isinstance(data['frames'], list)
    assert len(data['frames']) == 3  # Vérifie le nombre de frames
    assert 'pyramids' in data['frames'][0]
    assert 'bricks_positions' in data['frames'][0]['pyramids'][0]
    assert isinstance(data['frames'][0]['pyramids'][0]['bricks_positions'], list)

def test_pyramids_animate_params(test_client):
    """Test de la route /geometry/pyramids/animate avec paramètres de dynamique."""
    response = test_client.get('/geometry/pyramids/animate?steps=5&chaos_factor=0.5&noise_level=0.01')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['frames']) == 5
    assert isinstance(data['frames'][0]['pyramids'][0]['bricks_positions'][0][0], (float, int))