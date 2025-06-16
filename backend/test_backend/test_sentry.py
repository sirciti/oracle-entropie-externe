import pytest
from core.app import app
import sentry_sdk

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['ENV'] = 'development'
    with app.test_client() as client:
        yield client

def test_sentry_endpoint(client, mocker):
    mock_capture = mocker.patch('sentry_sdk.capture_exception')
    response = client.get('/test-sentry')
    assert response.status_code == 500
    assert mock_capture.called
    assert isinstance(mock_capture.call_args[0][0], ZeroDivisionError)