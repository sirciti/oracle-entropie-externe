FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV FLASK_ENV=production
ENV GUNICORN_CMD_ARGS="--timeout 120 --workers 3"

EXPOSE 5000

CMD ["sh", "-c", "PYTHONPATH=/app gunicorn --bind 0.0.0.0:5000 core.app:app"]