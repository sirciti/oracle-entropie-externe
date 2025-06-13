FROM python:3.12-slim

WORKDIR /app

# Installer les dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste du code
COPY . .

# Variables d'environnement
ENV FLASK_ENV=production
ENV GUNICORN_CMD_ARGS="--timeout 120 --workers 3"

EXPOSE 5000

# Lancer l'application avec Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "core.app:app"]