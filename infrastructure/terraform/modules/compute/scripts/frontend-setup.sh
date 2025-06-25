#!/bin/bash
# Setup script Frontend - Oracle d'Entropie

# Mise à jour système
apt-get update -y
apt-get upgrade -y

# Installation Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Installation Docker
apt-get install -y docker.io docker-compose
systemctl start docker
systemctl enable docker

# Installation Git
apt-get install -y git

# Clone et setup Oracle d'Entropie
cd /home/ubuntu
git clone https://github.com/sirciti/oracle-entropie-externe.git
cd oracle-entropie-externe/frontend

# Installation dépendances
npm install

# Build production si environnement prod
if [ "${environment}" = "prod" ]; then
    npm run build
    npm install -g serve
    serve -s dist -l 5173 &
else
    npm run dev -- --host 0.0.0.0 &
fi

echo "Frontend Oracle d'Entropie déployé avec succès !"
