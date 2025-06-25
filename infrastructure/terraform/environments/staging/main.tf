# Environnement STAGING - Oracle d'Entropie
# Configuration tests avec sécurité intermédiaire

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

# Configuration AWS
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = "staging"
      Project     = "oracle-entropie"
      ManagedBy   = "terraform"
      Owner       = "sirciti"
      CostCenter  = "staging-tests"
    }
  }
}

# Variables locales
locals {
  environment = "staging"
  project_name = "oracle-entropie"
  cloud_provider = "aws"
}

# Module Network
module "network" {
  source = "../../modules/network"
  
  cloud_provider = local.cloud_provider
  environment    = local.environment
  project_name   = local.project_name
}

# Module Compute
module "compute" {
  source = "../../modules/compute"
  
  cloud_provider = local.cloud_provider
  environment    = local.environment
  project_name   = local.project_name
  
  # Dépendances Network
  vpc_id                     = module.network.vpc_id
  public_subnet_id           = module.network.public_subnet_id
  private_subnet_id          = module.network.private_subnet_id
  frontend_security_group_id = module.network.frontend_security_group_id
  backend_security_group_id  = module.network.backend_security_group_id
  
  depends_on = [module.network]
}

# Module Database
module "database" {
  source = "../../modules/database"
  
  cloud_provider = local.cloud_provider
  environment    = local.environment
  project_name   = local.project_name
  
  # Dépendances Network
  vpc_id                     = module.network.vpc_id
  private_subnet_id          = module.network.private_subnet_id
  backend_security_group_id  = module.network.backend_security_group_id
  
  depends_on = [module.network]
}

# Module Monitoring
module "monitoring" {
  source = "../../modules/monitoring"
  
  cloud_provider = local.cloud_provider
  environment    = local.environment
  project_name   = local.project_name
  
  # Dépendances Network
  vpc_id                     = module.network.vpc_id
  public_subnet_id           = module.network.public_subnet_id
  frontend_security_group_id = module.network.frontend_security_group_id
  
  depends_on = [module.network]
}
