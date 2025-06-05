# Utiliser une image Python officielle comme base
FROM python:3.12-slim

# Installer Rust et Cargo pour blake3
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Ajouter Rust au PATH
ENV PATH="/root/.cargo/bin:${PATH}"

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .

# Exposer le port Flask
EXPOSE 5000

# Commande pour lancer l'application
CMD ["python", "-m", "backend.app"]