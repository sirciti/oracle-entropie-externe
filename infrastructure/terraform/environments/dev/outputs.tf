# Outputs environnement DEV

output "oracle_entropie_urls" {
  description = "URLs d'accès Oracle d'Entropie"
  value = {
    frontend    = "http://${module.compute.frontend_public_ip}:5173"
    backend     = "http://${module.compute.backend_private_ip}:8000"
    netdata     = module.monitoring.netdata_url
    prometheus  = module.monitoring.prometheus_url
    grafana     = module.monitoring.grafana_url
  }
}

output "database_info" {
  description = "Informations base de données"
  value = {
    endpoint = module.database.db_instance_endpoint
    port     = module.database.db_instance_port
    database = module.database.db_instance_name
  }
  sensitive = true
}

output "ssh_commands" {
  description = "Commandes SSH pour accéder aux serveurs"
  value = {
    frontend   = "ssh -i ~/.ssh/id_rsa ubuntu@${module.compute.frontend_public_ip}"
    monitoring = "ssh -i ~/.ssh/id_rsa ubuntu@${module.monitoring.monitoring_public_ip}"
  }
}

output "deployment_summary" {
  description = "Résumé du déploiement"
  value = {
    environment     = "dev"
    region         = var.aws_region
    vpc_id         = module.network.vpc_id
    frontend_ip    = module.compute.frontend_public_ip
    monitoring_ip  = module.monitoring.monitoring_public_ip
    database_ready = module.database.db_instance_endpoint != null
  }
}
