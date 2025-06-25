#!/bin/bash
# Script de déploiement PROD - Oracle d'Entropie

set -e

echo "🚀 Déploiement Oracle d'Entropie - Environnement PRODUCTION"
echo "⚠️  ATTENTION: Déploiement en production !"

read -p "Confirmer le déploiement en PRODUCTION ? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Déploiement annulé"
    exit 1
fi

cd "$(dirname "$0")/../terraform/environments/prod"

if [ ! -f terraform.tfvars ]; then
    echo "❌ Fichier terraform.tfvars manquant pour PROD"
    echo "Créer le fichier avec les variables de production"
    exit 1
fi

terraform init
terraform plan -out=tfplan

echo "📋 Révision finale du plan de déploiement..."
read -p "Appliquer les changements en PRODUCTION ? (yes/no): " final_confirm
if [ "$final_confirm" != "yes" ]; then
    echo "❌ Déploiement annulé"
    exit 1
fi

terraform apply tfplan

echo "✅ PRODUCTION déployée avec succès !"
terraform output oracle_entropie_urls
