# backend/test_backend/test_generate_token.py

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

import pytest
from backend.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_generate_token_default(client):
    response = client.post('/stream_tokens', json={
        'num_tokens': 1, 'length': 32,
        'char_options': {'lowercase': True, 'uppercase': True, 'numbers': True, 'symbols': True}
    })
    assert response.status_code == 200
    data = response.get_json()
    token = data['tokens'][0]
    assert isinstance(token, str)
    assert 8 <= len(token) <= 128
    assert any(c.islower() for c in token)
    assert any(c.isupper() for c in token)
    assert any(c.isdigit() for c in token)
    assert any(c in '!@#$%^&*()-_=+[]{}|;:,.<>?' for c in token)

def test_generate_token_only_lowercase_and_digits(client):
    response = client.post('/stream_tokens', json={
        'num_tokens': 1, 'length': 16,
        'char_options': {'lowercase': True, 'uppercase': False, 'numbers': True, 'symbols': False}
    })
    assert response.status_code == 200
    token = response.get_json()['tokens'][0]
    assert all(c.islower() or c.isdigit() for c in token)
    assert any(c.islower() for c in token)
    assert any(c.isdigit() for c in token)

def test_generate_token_invalid_length(client):
    response = client.post('/stream_tokens', json={
        'num_tokens': 1, 'length': 4,
        'char_options': {'lowercase': True, 'uppercase': True, 'numbers': True, 'symbols': False}
    })
    assert response.status_code == 400
    assert 'error' in response.get_json()

def test_generate_token_no_charset_selected(client):
    response = client.post('/stream_tokens', json={
        'num_tokens': 1, 'length': 16,
        'char_options': {'lowercase': False, 'uppercase': False, 'numbers': False, 'symbols': False}
    })
    assert response.status_code == 400
    assert 'error' in response.get_json()

def test_generate_token_min_required_length(client):
    response = client.post('/stream_tokens', json={
        'num_tokens': 1, 'length': 8,
        'char_options': {'lowercase': True, 'uppercase': True, 'numbers': True, 'symbols': False}
    })
    assert response.status_code == 200
    token = response.get_json()['tokens'][0]
    assert len(token) == 8
    assert any(c.islower() for c in token)
    assert any(c.isupper() for c in token)
    assert any(c.isdigit() for c in token)
