import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
import pytest
from backend.app import app
from flask import Flask

@pytest.fixture
def test_client():
    """Fixture pour créer un client de test Flask avec un contexte d'application."""
    app.config['TESTING'] = True
    with app.app_context():
        with app.test_client() as client:
            yield client

def test_sentry_error(test_client):
    """Test de la route /test-sentry pour vérifier qu'une erreur est capturée par Sentry."""
    response = test_client.get('/test-sentry')
    assert response.status_code == 500
    data = response.get_json()
    assert 'error' in data
