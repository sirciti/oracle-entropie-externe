# Environnement PROD - Oracle d'Entropie
# Configuration production haute disponibilité

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
  
  # Backend S3 pour état Terraform partagé
  backend "s3" {
    bucket = "oracle-entropie-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "eu-west-3"
    encrypt = true
    dynamodb_table = "oracle-entropie-terraform-locks"
  }
}

# Configuration AWS
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = "prod"
      Project     = "oracle-entropie"
      ManagedBy   = "terraform"
      Owner       = "sirciti"
      CostCenter  = "production"
      Backup      = "required"
      Monitoring  = "critical"
    }
  }
}

# Variables locales
locals {
  environment = "prod"
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

# Module Compute avec Auto Scaling
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

# Module Database avec Multi-AZ
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

# Module Monitoring avec alerting
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

# WAF pour sécurité web
resource "aws_wafv2_web_acl" "oracle_waf" {
  name  = "${local.project_name}-waf-${local.environment}"
  scope = "REGIONAL"
  
  default_action {
    allow {}
  }
  
  # Règle anti-DDoS
  rule {
    name     = "RateLimitRule"
    priority = 1
    
    action {
      block {}
    }
    
    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitRule"
      sampled_requests_enabled   = true
    }
  }
  
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "OracleEntropieWAF"
    sampled_requests_enabled   = true
  }
  
  tags = {
    Name = "${local.project_name}-waf-${local.environment}"
  }
}
