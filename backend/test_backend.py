import pytest
from backend.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_generate_random(client):
    response = client.get('/generate_random')
    assert response.status_code == 200
    data = response.get_json()
    assert 'random_number' in data

def test_icosahedron_initial(client):
    response = client.get('/icosahedron/initial')
    assert response.status_code == 200
    data = response.get_json()
    assert 'vertices' in data and 'faces' in data

def test_icosahedron_animate(client):
    response = client.get('/icosahedron/animate?steps=2')
    assert response.status_code == 200
    data = response.get_json()
    assert 'frames' in data
