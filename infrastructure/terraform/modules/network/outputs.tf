# Outputs Network Module

output "vpc_id" {
  description = "VPC ID"
  value       = var.cloud_provider == "aws" ? aws_vpc.oracle_vpc[0].id : null
}

output "public_subnet_id" {
  description = "Public subnet ID"
  value       = var.cloud_provider == "aws" ? aws_subnet.public_subnet[0].id : null
}

output "private_subnet_id" {
  description = "Private subnet ID"
  value       = var.cloud_provider == "aws" ? aws_subnet.private_subnet[0].id : null
}

output "frontend_security_group_id" {
  description = "Frontend security group ID"
  value       = var.cloud_provider == "aws" ? aws_security_group.frontend_sg[0].id : null
}

output "backend_security_group_id" {
  description = "Backend security group ID"
  value       = var.cloud_provider == "aws" ? aws_security_group.backend_sg[0].id : null
}
