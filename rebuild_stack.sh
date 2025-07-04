#!/bin/bash
# =================================================================
# SCRIPT DE REDÉPLOIEMENT ROBUSTE ET PERMANENT DE LA STACK PROD
# =================================================================
# Auteur : sirciti
# Date : 2025-07-01
# Description : Déploiement stable, gestion réseau, Traefik, nettoyage.
# =================================================================

set -e # Arrête le script immédiatement si une commande échoue

# --- Configuration ---
OLD_TRAEFIK_NAME="datacenter-pro-traefik-1"
NEW_TRAEFIK_NAME="traefik-oracle"
APP_NETWORK="oracle-network"
APP_DOMAIN="quantum-oracle-entropie.duckdns.org"
ACME_EMAIL="votre.email@domaine.com" # IMPORTANT: Mettez votre email ici
FRONTEND_LABEL="app=oracle-frontend"
COMPOSE_FILE="docker-compose.prod.yml"

# --- Couleurs pour les messages ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}### ÉTAPE 1: ARRÊT COMPLET DE LA STACK APPLICATIVE ###${NC}"
docker-compose -f $COMPOSE_FILE down --remove-orphans --volumes || true

echo -e "${BLUE}### ÉTAPE 2: SUPPRESSION DÉFINITIVE DE L'ANCIEN TRAEFIK ###${NC}"
echo -e "${YELLOW}Suppression du conteneur Traefik corrompu...${NC}"
docker stop $OLD_TRAEFIK_NAME 2>/dev/null || true
docker rm -f $OLD_TRAEFIK_NAME 2>/dev/null || true
echo -e "${GREEN}✅ Ancien Traefik supprimé définitivement${NC}"

echo -e "${BLUE}### ÉTAPE 2B: SUPPRESSION DU NOUVEAU TRAEFIK S'IL EXISTE DÉJÀ ###${NC}"
echo -e "${YELLOW}Suppression du conteneur Traefik (nouveau) s'il existe déjà...${NC}"
docker stop $NEW_TRAEFIK_NAME 2>/dev/null || true
docker rm -f $NEW_TRAEFIK_NAME 2>/dev/null

echo -e "${BLUE}### ÉTAPE 3: NETTOYAGE COMPLET DE L'ENVIRONNEMENT DOCKER ###${NC}"
echo -e "${YELLOW}Nettoyage des conteneurs, réseaux, volumes et images...${NC}"
docker system prune -af --volumes

echo -e "${BLUE}### ÉTAPE 4: REDÉMARRAGE DU SERVICE DOCKER ###${NC}"
echo -e "${YELLOW}Redémarrage de Docker pour nettoyer l'état interne...${NC}"
sudo systemctl restart docker
echo -e "${YELLOW}Attente du redémarrage complet de Docker (10 secondes)...${NC}"
sleep 10

echo -e "${BLUE}### ÉTAPE 5: CRÉATION DE L'INFRASTRUCTURE RÉSEAU ###${NC}"
echo -e "${YELLOW}Création du réseau applicatif unique: ${APP_NETWORK}...${NC}"
docker network create $APP_NETWORK 2>/dev/null || echo "Le réseau ${APP_NETWORK} existe déjà."

echo -e "${BLUE}### ÉTAPE 6: CRÉATION D'UN NOUVEAU TRAEFIK PROPRE ###${NC}"
echo -e "${YELLOW}Création du nouveau conteneur Traefik...${NC}"
docker run -d \
  --name $NEW_TRAEFIK_NAME \
  --restart unless-stopped \
  -p 80:80 -p 443:443 \
  --network $APP_NETWORK \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v traefik-data:/etc/traefik \
  traefik:latest \
  --providers.docker=true \
  --providers.docker.network=$APP_NETWORK \
  --providers.docker.exposedbydefault=false \
  --entrypoints.web.address=:80 \
  --entrypoints.websecure.address=:443 \
  --certificatesresolvers.myresolver.acme.tlschallenge=true \
  --certificatesresolvers.myresolver.acme.email=$ACME_EMAIL \
  --certificatesresolvers.myresolver.acme.storage=/etc/traefik/acme.json

echo -e "${GREEN}✅ Nouveau Traefik créé avec succès sur le réseau ${APP_NETWORK}${NC}"

echo -e "${BLUE}### ÉTAPE 7: DÉPLOIEMENT DE L'APPLICATION ###${NC}"
echo -e "${YELLOW}Reconstruction des images et démarrage des services...${NC}"
docker-compose -f $COMPOSE_FILE up --build -d

echo -e "${BLUE}### ÉTAPE 8: VÉRIFICATIONS POST-DÉPLOIEMENT ###${NC}"
echo -e "${YELLOW}Attente du démarrage des services (15 secondes)...${NC}"
sleep 15

echo -e "${YELLOW}--- État final des conteneurs ---${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Détection dynamique du conteneur frontend par label
FRONTEND_CONTAINER=$(docker ps -q -f "label=${FRONTEND_LABEL}")
FRONTEND_CONTAINER_NAME=$(docker ps --filter "label=${FRONTEND_LABEL}" --format "{{.Names}}" | head -n1)

echo -e "${YELLOW}--- Vérification de la configuration réseau ---${NC}"
NETWORK_CONTAINERS=$(docker network inspect $APP_NETWORK 2>/dev/null | grep -E "(${FRONTEND_CONTAINER_NAME}|$NEW_TRAEFIK_NAME)" | wc -l)
if [ "$NETWORK_CONTAINERS" -ge 2 ]; then
    echo -e "${GREEN}✅ Traefik et Frontend sont connectés au réseau ${APP_NETWORK}${NC}"
else
    echo -e "${RED}⚠️  Problème de connexion réseau détecté${NC}"
fi

echo -e "${YELLOW}--- Test de connectivité interne au frontend ---${NC}"
if [ -n "$FRONTEND_CONTAINER" ]; then
    if docker exec $FRONTEND_CONTAINER curl -s --head http://localhost | grep -q "200\|HTTP"; then
        echo -e "${GREEN}✅ Le conteneur frontend répond correctement${NC}"
    else
        echo -e "${RED}⚠️  Le conteneur frontend ne répond pas${NC}"
    fi
else
    echo -e "${RED}⚠️  Aucun conteneur frontend détecté (label=${FRONTEND_LABEL})${NC}"
fi

echo -e "${YELLOW}--- Vérification des logs Traefik récents ---${NC}"
TRAEFIK_ERRORS=$(docker logs $NEW_TRAEFIK_NAME --since 2m 2>/dev/null | grep -i "error\|unable" | wc -l)
if [ "$TRAEFIK_ERRORS" -eq 0 ]; then
    echo -e "${GREEN}✅ Aucune erreur dans les logs Traefik${NC}"
else
    echo -e "${RED}⚠️  $TRAEFIK_ERRORS erreur(s) détectée(s) dans Traefik${NC}"
fi

echo ""
echo -e "${GREEN}############################################"
echo -e "#     DÉPLOIEMENT TERMINÉ AVEC SUCCÈS    #"
echo -e "############################################${NC}"
echo -e "${BLUE}🌐 Application accessible sur: https://${APP_DOMAIN}${NC}"
echo -e "${YELLOW}💡 Nouveau Traefik: ${NEW_TRAEFIK_NAME}${NC}"
echo ""
