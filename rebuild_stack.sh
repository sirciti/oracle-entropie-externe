#!/bin/bash
# =================================================================
# SCRIPT DE REDÉPLOIEMENT ROBUSTE ET PERMANENT DE LA STACK PROD
# =================================================================
# Auteur : sirciti
# Date : 2025-07-01
# Description : Déploiement stable, gestion réseau, Traefik, nettoyage.
# Version : 3.1 (Mise à jour 2025-07-07 pour robustesse accrue et gestion des erreurs)
# =================================================================

set -e # Arrête le script immédiatement si une commande échoue

# --- Configuration ---
OLD_TRAEFIK_NAME="datacenter-pro-traefik-1"
NEW_TRAEFIK_NAME="traefik-oracle"
APP_NETWORK="oracle-network"
APP_DOMAIN="quantum-oracle-entropie.duckdns.org"
FRONTEND_LABEL="app=oracle-frontend"
COMPOSE_FILE="docker-compose.prod.yml"

# --- Couleurs pour les messages ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# --- Protection contre les modifications non souhaitées ---
echo -e "${YELLOW}### VÉRIFICATION DE L'INTÉGRITÉ DU SCRIPT ###${NC}"
if [[ ! -f "$COMPOSE_FILE" ]]; then
    echo -e "${RED}⚠️ Fichier $COMPOSE_FILE introuvable. Arrêt du script.${NC}"
    exit 1
fi

# --- Vérification de la connectivité réseau et DNS ---
echo -e "${BLUE}### VÉRIFICATION DE LA CONNECTIVITÉ RÉSEAU ET DNS ###${NC}"
echo -e "${YELLOW}Test de connectivité Internet...${NC}"
if ping -c 4 8.8.8.8 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connectivité Internet confirmée${NC}"
else
    echo -e "${RED}⚠️ Échec de connectivité Internet. Vérifiez votre réseau.${NC}"
    exit 1
fi

echo -e "${YELLOW}Test de résolution DNS...${NC}"
if nslookup quantum-oracle-entropie.duckdns.org > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Résolution DNS réussie${NC}"
else
    echo -e "${RED}⚠️ Échec de résolution DNS. Configuration des serveurs DNS...${NC}"
    echo "nameserver 1.1.1.1" | sudo tee -a /etc/resolv.conf
    echo "nameserver 8.8.8.8" | sudo tee -a /etc/resolv.conf
    if nslookup quantum-oracle-entropie.duckdns.org > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Résolution DNS corrigée${NC}"
    else
        echo -e "${RED}⚠️ Échec persistant de résolution DNS. Arrêt du script.${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}### ÉTAPE 0: PRÉPARATION DU nginx.conf (prod) POUR LE FRONTEND ###${NC}"
cp frontend/nginx.prod.conf frontend/nginx.conf

echo -e "${BLUE}### ÉTAPE 0B: SAUVEGARDE AUTOMATIQUE DE LA BASE DE DONNÉES ###${NC}"

# Vérification et démarrage du conteneur oracle-db
if ! docker ps --format "{{.Names}}" | grep -q "^oracle-db$"; then
    echo -e "${YELLOW}Le conteneur oracle-db n'est pas démarré. Démarrage en cours...${NC}"
    docker start oracle-db
    # Attente que le conteneur soit prêt (optionnel, mais recommandé)
    echo -e "${YELLOW}Attente de 10 secondes pour que le conteneur soit opérationnel...${NC}"
    sleep 10
fi

BACKUP_FILE="backup_pre_deployment_$(date +%Y%m%d_%H%M%S).sql"
if docker exec oracle-db pg_dump -U oracle_user oracle_visits > $BACKUP_FILE; then
    echo -e "${GREEN}✅ Sauvegarde réussie : $BACKUP_FILE${NC}"
else
    echo -e "${RED}⚠️ Échec de la sauvegarde. Arrêt du script pour sécurité.${NC}"
    exit 1
fi

echo -e "${BLUE}### ÉTAPE 1: ARRÊT COMPLET DE LA STACK APPLICATIVE ###${NC}"
docker-compose -f $COMPOSE_FILE down --remove-orphans --volumes || true

echo -e "${BLUE}### ÉTAPE 2: SUPPRESSION DÉFINITIVE DE L'ANCIEN TRAEFIK ###${NC}"
echo -e "${YELLOW}Suppression du conteneur Traefik corrompu...${NC}"
docker stop $OLD_TRAEFIK_NAME 2>/dev/null || true
docker rm -f $OLD_TRAEFIK_NAME 2>/dev/null || true
echo -e "${GREEN}✅ Ancien Traefik supprimé définitivement${NC}"

echo -e "${BLUE}### ÉTAPE 2B: SUPPRESSION DU NOUVEAU TRAEFIK S'IL EXISTE DÉJÀ (HORS COMPOSE) ###${NC}"
echo -e "${YELLOW}Suppression du conteneur Traefik (nouveau) s'il existe déjà hors compose...${NC}"
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

echo -e "${BLUE}### ÉTAPE 5B: VÉRIFICATION DES VOLUMES DOCKER ###${NC}"
for VOLUME in oracle-db-data minio-storage-data traefik-data; do
    if ! docker volume inspect $VOLUME > /dev/null 2>&1; then
        echo -e "${YELLOW}Création du volume $VOLUME...${NC}"
        docker volume create $VOLUME
    else
        echo -e "${GREEN}✅ Volume $VOLUME déjà existant${NC}"
    fi
done

echo -e "${BLUE}### ÉTAPE 6: TRAEFIK INTÉGRÉ DANS DOCKER-COMPOSE.PROD.YML ###${NC}"
echo -e "${YELLOW}Traefik sera lancé avec les autres services via docker-compose.prod.yml...${NC}"

echo -e "${BLUE}### ÉTAPE 7: DÉPLOIEMENT DE L'APPLICATION ###${NC}"
echo -e "${YELLOW}Reconstruction des images et démarrage des services...${NC}"
if ! docker-compose -f $COMPOSE_FILE up --build -d; then
    echo -e "${RED}⚠️ Échec du déploiement. Tentative de rollback...${NC}"
    docker-compose -f $COMPOSE_FILE down --remove-orphans
    echo -e "${YELLOW}Retentative de déploiement...${NC}"
    docker-compose -f $COMPOSE_FILE up --build -d || { echo -e "${RED}⚠️ Échec définitif. Arrêt du script.${NC}"; exit 1; }
fi

echo -e "${BLUE}### ÉTAPE 8: VÉRIFICATIONS POST-DÉPLOIEMENT ###${NC}"
echo -e "${YELLOW}Attente du démarrage des services...${NC}"
MAX_WAIT=60
WAIT_TIME=0
until docker ps | grep -q "oracle-frontend" || [ $WAIT_TIME -ge $MAX_WAIT ]; do
    sleep 5
    WAIT_TIME=$((WAIT_TIME + 5))
    echo -e "${YELLOW}Attente... ($WAIT_TIME secondes écoulées)${NC}"
done
if [ $WAIT_TIME -ge $MAX_WAIT ]; then
    echo -e "${RED}⚠️ Timeout atteint. Les services ne sont pas tous démarrés.${NC}"
else
    echo -e "${GREEN}✅ Services démarrés après $WAIT_TIME secondes.${NC}"
fi

echo -e "${BLUE}### ÉTAPE 8B: VÉRIFICATION DE LA TABLE VISITES ###${NC}"
if docker exec oracle-db psql -U oracle_user -d oracle_visits -c "\dt" | grep -q "visites"; then
    echo -e "${GREEN}✅ Table 'visites' existe dans la base de données.${NC}"
else
    echo -e "${YELLOW}Création de la table 'visites'...${NC}"
    docker exec oracle-db psql -U oracle_user -d oracle_visits -c "CREATE TABLE IF NOT EXISTS visites (id SERIAL PRIMARY KEY, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, page VARCHAR(255) NOT NULL, ip_address VARCHAR(45) NOT NULL, time_spent INTEGER DEFAULT 0, view_id VARCHAR(100));"
    echo -e "${GREEN}✅ Table 'visites' créée avec succès.${NC}"
fi

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
    echo -e "${RED}⚠️ Problème de connexion réseau détecté${NC}"
fi

echo -e "${YELLOW}--- Test de connectivité interne au frontend ---${NC}"
if [ -n "$FRONTEND_CONTAINER" ]; then
    if docker exec $FRONTEND_CONTAINER curl -s --head http://localhost | grep -q "200\|HTTP"; then
        echo -e "${GREEN}✅ Le conteneur frontend répond correctement${NC}"
    else
        echo -e "${RED}⚠️ Le conteneur frontend ne répond pas${NC}"
    fi
else
    echo -e "${RED}⚠️ Aucun conteneur frontend détecté (label=${FRONTEND_LABEL})${NC}"
fi

echo -e "${YELLOW}--- Vérification des logs Traefik récents ---${NC}"
TRAEFIK_ERRORS=$(docker logs $NEW_TRAEFIK_NAME --since 2m 2>/dev/null | grep -i "error\|unable" | wc -l)
if [ "$TRAEFIK_ERRORS" -eq 0 ]; then
    echo -e "${GREEN}✅ Aucune erreur dans les logs Traefik${NC}"
else
    echo -e "${RED}⚠️ $TRAEFIK_ERRORS erreur(s) détectée(s) dans Traefik${NC}"
fi

echo -e "${YELLOW}--- Test final de connectivité externe ---${NC}"
if curl -4 -k -s --head https://$APP_DOMAIN/api/geometry/icosahedron/initial | grep -q "200"; then
    echo -e "${GREEN}✅ L'application répond correctement via Traefik sur https://$APP_DOMAIN${NC}"
else
    echo -e "${RED}⚠️ L'application ne répond pas correctement via Traefik${NC}"
fi

echo ""
echo -e "${GREEN}############################################"
echo -e "#     DÉPLOIEMENT TERMINÉ AVEC SUCCÈS    #"
echo -e "############################################${NC}"
echo -e "${BLUE}🌐 Application accessible sur: https://${APP_DOMAIN}${NC}"
echo -e "${YELLOW}💡 Traefik intégré: ${NEW_TRAEFIK_NAME}${NC}"
echo ""
