import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
import pytest
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
from backend.utils import SentryTestTransport  # Import corrigé

@pytest.fixture
def test_client():
    """Fixture pour créer un client de test Flask avec un contexte d'application."""
    from backend.app import app
    app.config['TESTING'] = True
    with app.app_context():
        with app.test_client() as client:
            yield client

def test_sentry_error(test_client):
    """Test de la route /test-sentry pour vérifier qu'une erreur est capturée par Sentry."""
    transport = SentryTestTransport()
    sentry_sdk.init(
        integrations=[FlaskIntegration()],
        transport=transport,
        environment="testing"
    )

    try:
        test_client.get('/test-sentry')
    except ZeroDivisionError:
        pass  # L'erreur est attendue

    assert len(transport.envelopes) >= 1

    # Réinitialiser Sentry
    sentry_sdk.init(release=None)
