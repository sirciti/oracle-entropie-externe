# Variables environnement DEV

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-3"  # Paris
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks autorisés pour l'accès"
  type        = list(string)
  default     = ["0.0.0.0/0"]  # Ouvert en dev
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
    frontend   = "t3.micro"
    backend    = "t3.micro"
    monitoring = "t3.small"
    database   = "db.t3.micro"
  }
}
