import sys
import os
import pytest
from sentry_sdk import flush
from sentry_sdk.integrations.flask import FlaskIntegration
from backend.core.utils.utils import SentryTestTransport

@pytest.fixture
def test_client():
    transport = SentryTestTransport()
    import sentry_sdk
    sentry_sdk.init(
        integrations=[FlaskIntegration()],
        transport=transport,
        environment="testing",
        send_default_pii=True,
        traces_sample_rate=1.0
    )
    from core.app import app
    app.config['TESTING'] = True
    app.config['PROPAGATE_EXCEPTIONS'] = False
    with app.app_context():
        with app.test_client() as client:
            yield client, transport

def test_sentry_error(test_client):
    client, transport = test_client
    response = client.get('/test-sentry')
    assert response.status_code == 500
    flush(timeout=2.0)
    assert len(transport.envelopes) >= 1, "Aucun événement Sentry n'a été capturé"
