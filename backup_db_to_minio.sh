#!/bin/bash
# Variables
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_$DATE.sql"
MINIO_BUCKET="backups"
MINIO_ENDPOINT="localhost:9000"
MINIO_USER="minio_user"
MINIO_PASS="minio_pass"
DB_NAME="oraclevisits"


# Vérifier si c'est vendredi entre 11h30 et 11h45
DAY=$(date +%a)
HOUR=$(date +%H)
MINUTE=$(date +%M)
if [ "$DAY" == "Fri" ] && [ "$HOUR" == "11" ] && [ "$MINUTE" -ge "30" ] && [ "$MINUTE" -le "45" ]; then
  echo "Début de la sauvegarde hebdomadaire : $DATE"
  
  # Sauvegarde de la base de données
  docker exec oracle-db pg_dump -U oracle_user oracle_visits > $BACKUP_FILE
  
  # Installation de mc (MinIO Client) si nécessaire
  if ! command -v mc &> /dev/null; then
    echo "Installation de MinIO Client..."
    wget https://dl.min.io/client/mc/release/linux-amd64/mc -O /usr/local/bin/mc
    chmod +x /usr/local/bin/mc
  fi
  
  # Configuration de l'alias MinIO
  mc alias set local http://$MINIO_ENDPOINT $MINIO_USER $MINIO_PASS
  
  # Création du bucket si nécessaire
  mc mb local/$MINIO_BUCKET --ignore-existing
  
  # Envoi de la sauvegarde vers MinIO
  mc cp $BACKUP_FILE local/$MINIO_BUCKET/
  
  # Suppression des sauvegardes de plus de 15 jours
  find . -name "backup_*.sql" -mtime +15 -delete
  mc find local/$MINIO_BUCKET --older-than 15d --exec "mc rm {}"
  
  # Nettoyage local
  rm $BACKUP_FILE
  echo "Sauvegarde terminée : $BACKUP_FILE envoyé vers MinIO et fichiers anciens supprimés."
else
  echo "Pas de sauvegarde prévue. Condition non remplie (Vendredi 11h30-11h45)."
fi
