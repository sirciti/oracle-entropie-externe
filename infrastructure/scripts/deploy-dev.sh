#!/bin/bash
# Script de déploiement DEV - Oracle d'Entropie

set -e

echo "🚀 Déploiement Oracle d'Entropie - Environnement DEV"

# Vérifications préalables
if [ ! -f ~/.ssh/id_rsa.pub ]; then
    echo "❌ Clé SSH publique manquante. Générer avec: ssh-keygen -t rsa"
    exit 1
fi

if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform non installé"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI non installé"
    exit 1
fi

# Vérification credentials AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Credentials AWS non configurés"
    echo "Configurer avec: aws configure"
    exit 1
fi

cd "$(dirname "$0")/../terraform/environments/dev"

# Copier le fichier de variables si nécessaire
if [ ! -f terraform.tfvars ]; then
    cp terraform.tfvars.example terraform.tfvars
    echo "📝 Fichier terraform.tfvars créé. Adapter si nécessaire."
fi

echo "🔧 Initialisation Terraform..."
terraform init

echo "📋 Planification du déploiement..."
terraform plan -out=tfplan

echo "🚀 Déploiement en cours..."
terraform apply tfplan

echo "✅ Déploiement terminé !"
echo ""
echo "📊 URLs d'accès :"
terraform output oracle_entropie_urls

echo ""
echo "🔑 Commandes SSH :"
terraform output ssh_commands

echo ""
echo "📈 Résumé :"
terraform output deployment_summary
