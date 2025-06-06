# backend/test_backend/test_cubes.py

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
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

def test_cubes_initial(test_client):
    response = test_client.get('/geometry/cubes/initial')
    assert response.status_code == 200
    data = response.get_json()
    assert 'cubes' in data and isinstance(data['cubes'], list)
    assert len(data['cubes']) == 3 # Par défaut 3 cubes
    assert 'balls' in data['cubes'][0] and isinstance(data['cubes'][0]['balls'], list)
    assert len(data['cubes'][0]['balls']) == 3 # Par défaut 3 billes par cube
    assert 'metadata' in data

def test_cubes_initial_params(test_client):
    response = test_client.get('/geometry/cubes/initial?num_cubes=1&cube_size=10&num_balls_per_cube=2&space_bounds=50')
    assert response.status_code == 200
    data = response.get_json()
    assert data['metadata']['num_cubes'] == 1
    assert data['metadata']['cube_size'] == 10.0
    assert data['metadata']['num_balls_per_cube'] == 2
    assert data['metadata']['space_bounds'] == 50.0
    assert len(data['cubes']) == 1
    assert len(data['cubes'][0]['balls']) == 2

def test_cubes_animate(test_client):
    response = test_client.get('/geometry/cubes/animate?steps=5')
    assert response.status_code == 200
    data = response.get_json()
    assert 'frames' in data and isinstance(data['frames'], list)
    assert len(data['frames']) == 5
    assert 'cubes' in data['frames'][0]
    assert 'position' in data['frames'][0]['cubes'][0]
    assert 'rotation' in data['frames'][0]['cubes'][0]
    assert 'balls_positions' in data['frames'][0]['cubes'][0]
    assert 'ball_radius' in data['frames'][0]['cubes'][0]

def test_cubes_animate_params(test_client):
    response = test_client.get('/geometry/cubes/animate?steps=10&dt=0.01&chaos=0.5')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['frames']) == 10
    assert isinstance(data['frames'][0]['cubes'][0]['position'][0], (float, int))
    assert isinstance(data['frames'][0]['cubes'][0]['rotation'][0], (float, int))
    assert isinstance(data['frames'][0]['cubes'][0]['balls_positions'][0][0], (float, int))