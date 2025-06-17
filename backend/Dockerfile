FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONPATH=/app
ENV FLASK_ENV=production
ENV GUNICORN_CMD_ARGS="--timeout 120 --workers 3"

EXPOSE 5000

CMD ["gunicorn", "-c", "gunicorn.conf.py", "core.app:app"]