# Oracle d'Entropie - Infrastructure as Code
# Support multi-cloud AWS/GCP

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Variables globales
variable "cloud_provider" {
  description = "Cloud provider: aws ou gcp"
  type        = string
  default     = "aws"
}

variable "environment" {
  description = "Environment: dev, staging, prod"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Nom du projet"
  type        = string
  default     = "oracle-entropie"
}

# Configuration selon le provider
locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
