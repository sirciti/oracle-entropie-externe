import pytest
from flask import url_for
from core.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_spiral_initial(client, mocker):
    mocker.patch('core.utils.utils.get_entropy_data', return_value=0.123456789)
    response = client.get('/geometry/spiral/initial')
    assert response.status_code == 200
    data = response.get_json()
    assert data['type'] == 'spiral'
    assert 'positions' in data
    assert 'entropy' in data
    assert isinstance(data['positions'], list)
    assert len(data['positions']) == 100
    assert all(len(pos) == 3 for pos in data['positions'])

def test_spiral_animate(client, mocker):
    mocker.patch('core.utils.utils.get_entropy_data', return_value=0.123456789)
    response = client.get('/geometry/spiral/animate?steps=5')
    assert response.status_code == 200
    data = response.get_json()
    assert 'frames' in data
    assert len(data['frames']) == 5
    assert all('positions' in frame for frame in data['frames'])