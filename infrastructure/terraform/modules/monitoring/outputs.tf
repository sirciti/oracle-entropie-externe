# Outputs Monitoring Module

output "monitoring_public_ip" {
  description = "Monitoring server public IP"
  value       = var.cloud_provider == "aws" ? aws_eip.monitoring_eip[0].public_ip : null
}

output "netdata_url" {
  description = "Netdata dashboard URL"
  value       = var.cloud_provider == "aws" ? "<http://${aws_eip.monitoring_eip>[0].public_ip}:19999" : null
}

output "prometheus_url" {
  description = "Prometheus dashboard URL"
  value       = var.cloud_provider == "aws" ? "<http://${aws_eip.monitoring_eip>[0].public_ip}:9090" : null
}

output "grafana_url" {
  description = "Grafana dashboard URL"
  value       = var.cloud_provider == "aws" ? "<http://${aws_eip.monitoring_eip>[0].public_ip}:3000" : null
}
