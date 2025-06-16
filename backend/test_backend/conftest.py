import sys
import sentry_sdk
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import pytest
from core.app import app
from core.utils.utils import SentryTestTransport
from sentry_sdk.integrations.flask import FlaskIntegration

@pytest.fixture
def test_client():
    transport = SentryTestTransport()
    sentry_sdk.init(
        integrations=[FlaskIntegration()],
        transport=transport,
        environment="testing",
        send_default_pii=True,
        traces_sample_rate=1.0
    )
    app.config['TESTING'] = True
    app.config['PROPAGATE_EXCEPTIONS'] = True  # Important !
    with app.app_context():
        with app.test_client() as client:
            yield client, transport