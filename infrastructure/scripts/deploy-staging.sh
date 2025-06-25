#!/bin/bash
# Script de déploiement STAGING - Oracle d'Entropie

set -e

echo "🧪 Déploiement Oracle d'Entropie - Environnement STAGING"

cd "$(dirname "$0")/../terraform/environments/staging"

if [ ! -f terraform.tfvars ]; then
    cp terraform.tfvars.example terraform.tfvars
    echo "📝 Fichier terraform.tfvars créé pour STAGING"
fi

terraform init
terraform plan -out=tfplan
terraform apply tfplan

echo "✅ STAGING déployé avec succès !"
terraform output oracle_entropie_urls
