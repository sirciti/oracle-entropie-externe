# Variables environnement STAGING

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-3"  # Paris
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks autorisés pour l'accès"
  type        = list(string)
  default     = ["10.0.0.0/8", "172.16.0.0/12"]  # Restreint en staging
}

variable "instance_types" {
  description = "Types d'instances par composant"
  type = object({
    frontend   = string
    backend    = string
    monitoring = string
    database   = string
  })
  default = {
    frontend   = "t3.small"   # Plus puissant qu'en dev
    backend    = "t3.small"
    monitoring = "t3.medium"
    database   = "db.t3.small"
  }
}

variable "backup_retention_days" {
  description = "Nombre de jours de rétention des sauvegardes"
  type        = number
  default     = 7
}
