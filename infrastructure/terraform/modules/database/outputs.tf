# Outputs Database Module

output "db_instance_endpoint" {
  description = "RDS instance endpoint"
  value       = var.cloud_provider == "aws" ? aws_db_instance.oracle_postgres[0].endpoint : null
  sensitive   = true
}

output "db_instance_port" {
  description = "RDS instance port"
  value       = var.cloud_provider == "aws" ? aws_db_instance.oracle_postgres[0].port : null
}

output "db_instance_name" {
  description = "RDS instance database name"
  value       = var.cloud_provider == "aws" ? aws_db_instance.oracle_postgres[0].db_name : null
}

output "db_instance_username" {
  description = "RDS instance username"
  value       = var.cloud_provider == "aws" ? aws_db_instance.oracle_postgres[0].username : null
  sensitive   = true
}

output "db_secret_arn" {
  description = "Database secret ARN"
  value       = var.cloud_provider == "aws" ? aws_secretsmanager_secret.db_password[0].arn : null
}
