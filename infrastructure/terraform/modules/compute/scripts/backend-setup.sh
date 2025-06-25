#!/bin/bash
# Setup script Backend - Oracle d'Entropie

# Mise à jour système
apt-get update -y
apt-get upgrade -y

# Installation Python 3.11
apt-get install -y python3.11 python3.11-venv python3-pip

# Installation Docker
apt-get install -y docker.io docker-compose
systemctl start docker
systemctl enable docker

# Installation Git
apt-get install -y git

# Clone et setup Oracle d'Entropie
cd /home/ubuntu
git clone https://github.com/sirciti/oracle-entropie-externe.git
cd oracle-entropie-externe/backend

# Setup environnement virtuel Python
python3.11 -m venv venv
source venv/bin/activate

# Installation dépendances
pip install -r requirements.txt

# Démarrage FastAPI
uvicorn main:app --host 0.0.0.0 --port 8000 &

echo "Backend Oracle d'Entropie déployé avec succès !"
