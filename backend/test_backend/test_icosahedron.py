import pytest
from backend.app import app  # Assure-toi que ce chemin est correct

@pytest.fixture
def test_client():
    app.config['TESTING'] = True
    with app.app_context():
        with app.test_client() as client:
            yield client

def test_generate_random(test_client):
    response = test_client.get('/generate_random')
    assert response.status_code == 200
    data = response.get_json()
    assert 'random_number' in data
    assert 'entropy_seed' in data

def test_entropy(test_client):
    response = test_client.get('/entropy')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, dict)

def test_icosahedron_initial(test_client):
    response = test_client.get('/icosahedron/initial')
    assert response.status_code == 200
    data = response.get_json()
    assert 'vertices' in data and 'faces' in data
    assert isinstance(data['vertices'], list)
    assert isinstance(data['faces'], list)

def test_icosahedron_subdivide(test_client):
    response = test_client.get('/icosahedron/subdivide')
    assert response.status_code == 200
    data = response.get_json()
    assert 'vertices' in data and 'faces' in data
    assert isinstance(data['vertices'], list)
    assert isinstance(data['faces'], list)

def test_icosahedron_animate(test_client):
    response = test_client.get('/icosahedron/animate?steps=2')
    assert response.status_code == 200
    data = response.get_json()
    assert 'frames' in data
    assert isinstance(data['frames'], list)
    assert len(data['frames']) == 2

def test_icosahedron_animate_params(test_client):
    response = test_client.get('/icosahedron/animate?radius=2&rotation_angle=0.785&steps=5')
    assert response.status_code == 200
    data = response.get_json()
    assert 'frames' in data
    assert len(data['frames']) == 5

def test_icosahedron_animate_invalid_params(test_client):
    response = test_client.get('/icosahedron/animate?position=invalid')
    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data

def test_final_entropy(test_client):
    response = test_client.get('/final_entropy')
    assert response.status_code == 200
    data = response.get_json()
    assert 'final_entropy' in data
    assert isinstance(data['final_entropy'], str)

def test_generate_token(test_client):
    response = test_client.get('/generate_token')
    assert response.status_code == 200
    data = response.get_json()
    assert 'token' in data
    assert isinstance(data['token'], str)
    assert len(data['token']) >= 32
