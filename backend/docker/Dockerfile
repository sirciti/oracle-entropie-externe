# Utilise une image Python officielle comme base
FROM python:3.12-slim

# Installe Rust et Cargo pour blake3 et les outils de build Python
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    pkg-config \
    libssl-dev \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Ajoute Rust au PATH (nécessaire pour la compilation pendant le RUN pip install)
ENV PATH="/root/.cargo/bin:${PATH}"

# Définit le répertoire de travail DANS le conteneur
# C'est le répertoire où l'application sera exécutée.
# Nous allons copier le dossier 'backend' complet ici.
WORKDIR /usr/src/app

# Copie le fichier requirements.txt (qui est à la racine du dossier backend du système hôte)
# Le contexte de build est 'backend/' (défini dans docker-compose.yml)
COPY requirements.txt ./

# Installe les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt && \
    apt-get purge -y build-essential pkg-config libssl-dev && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# Copie tout le contenu du dossier 'backend' (le contexte de build)
# dans un sous-dossier 'backend' DANS le WORKDIR du conteneur.
# Cela crée la structure /usr/src/app/backend/...
COPY . /usr/src/app/backend

# Ajoute le répertoire parent de 'backend' au PYTHONPATH.
# Cela permet à Python de trouver le package 'backend' et ses sous-modules.
ENV PYTHONPATH=/usr/src/app:${PYTHONPATH}

# Expose le port sur lequel Flask va écouter
EXPOSE 5000

# Commande pour démarrer l'application Flask
# Lance l'application en tant que module Python pour une gestion correcte des packages.
# 'backend.core.app' est le chemin du module depuis la racine du PYTHONPATH.
CMD ["python", "-m", "backend.core.app"]
