# Variables environnement PROD

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-3"  # Paris
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks autorisés pour l'accès"
  type        = list(string)
  default     = ["10.0.0.0/16"]  # Très restreint en prod
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
    frontend   = "t3.medium"    # Production grade
    backend    = "t3.medium"
    monitoring = "t3.large"
    database   = "db.t3.medium"
  }
}

variable "backup_retention_days" {
  description = "Nombre de jours de rétention des sauvegardes"
  type        = number
  default     = 30  # 30 jours en production
}

variable "multi_az_enabled" {
  description = "Activer Multi-AZ pour haute disponibilité"
  type        = bool
  default     = true
}

variable "ssl_certificate_arn" {
  description = "ARN du certificat SSL pour HTTPS"
  type        = string
  default     = ""
}
