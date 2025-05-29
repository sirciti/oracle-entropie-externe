# backend/test_backend/test_generate_token.py

import pytest
from backend.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_generate_token_default(client):
    response = client.get('/generate_token')
    assert response.status_code == 200
    data = response.get_json()
    token = data['token']
    assert isinstance(token, str)
    assert 8 <= len(token) <= 128
    assert any(c.islower() for c in token)
    assert any(c.isupper() for c in token)
    assert any(c.isdigit() for c in token)
    assert any(c in '!@#$%^&*()-_=+[]{}|;:,.<>?' for c in token)

def test_generate_token_only_lowercase_and_digits(client):
    response = client.get('/generate_token?lowercase=true&uppercase=false&numbers=true&symbols=false&length=16')
    assert response.status_code == 200
    token = response.get_json()['token']
    assert all(c.islower() or c.isdigit() for c in token)
    assert any(c.islower() for c in token)
    assert any(c.isdigit() for c in token)

def test_generate_token_invalid_length(client):
    response = client.get('/generate_token?length=4')
    assert response.status_code == 400
    assert 'error' in response.get_json()

def test_generate_token_no_charset_selected(client):
    response = client.get('/generate_token?lowercase=false&uppercase=false&numbers=false&symbols=false')
    assert response.status_code == 400
    assert 'error' in response.get_json()

def test_generate_token_min_required_length(client):
    # Choix de 3 types : lower + upper + digits => longueur minimale = 8
    response = client.get('/generate_token?lowercase=true&uppercase=true&numbers=true&symbols=false&length=8')
    assert response.status_code == 200
    token = response.get_json()['token']
    assert len(token) == 8
    assert any(c.islower() for c in token)
    assert any(c.isupper() for c in token)
    assert any(c.isdigit() for c in token)
