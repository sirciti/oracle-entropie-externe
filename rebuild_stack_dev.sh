#!/bin/bash
# =================================================================
# SCRIPT DE REDÉPLOIEMENT RAPIDE DE LA STACK DEV
# =================================================================
# Usage : ./rebuild_stack_dev.sh
# =================================================================

set -e

echo "---------------------------------------------"
echo "Arrêt des conteneurs de développement..."
docker-compose -f docker-compose.dev.yml down

echo "---------------------------------------------"
echo "Préparation du nginx.conf (dev) pour le frontend..."
cp frontend/nginx.dev.conf frontend/nginx.conf

echo "---------------------------------------------"
echo "Rebuild et redémarrage de la stack dev..."
docker-compose -f docker-compose.dev.yml build frontend
docker-compose -f docker-compose.dev.yml up --build -d

echo "---------------------------------------------"
echo "État des conteneurs dev :"
docker-compose -f docker-compose.dev.yml ps

echo "---------------------------------------------"
echo "Logs récents du backend :"
docker-compose -f docker-compose.dev.yml logs --tail=20 backend

echo "---------------------------------------------"
echo "Logs récents du frontend :"
docker-compose -f docker-compose.dev.yml logs --tail=10 frontend

echo "---------------------------------------------"
echo "Stack de développement redéployée avec succès !"
