# Module Database - Oracle d'Entropie
# PostgreSQL managé avec sauvegardes et réplication

variable "cloud_provider" {
  description = "Cloud provider"
  type        = string
}

variable "environment" {
  description = "Environment"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_id" {
  description = "Private subnet ID"
  type        = string
}

variable "backend_security_group_id" {
  description = "Backend security group ID"
  type        = string
}

# Subnet Group pour RDS
resource "aws_db_subnet_group" "oracle_db_subnet_group" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  name       = "${var.project_name}-db-subnet-group-${var.environment}"
  subnet_ids = [var.private_subnet_id, aws_subnet.db_subnet_secondary[0].id]
  
  tags = {
    Name = "${var.project_name}-db-subnet-group-${var.environment}"
  }
}

# Subnet secondaire pour Multi-AZ
resource "aws_subnet" "db_subnet_secondary" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  vpc_id            = var.vpc_id
  cidr_block        = "10.0.3.0/24"
  availability_zone = data.aws_availability_zones.available[0].names[1]
  
  tags = {
    Name = "${var.project_name}-db-subnet-secondary-${var.environment}"
    Type = "database"
  }
}

# Security Group Database
resource "aws_security_group" "database_sg" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  name_prefix = "${var.project_name}-database-${var.environment}"
  vpc_id      = var.vpc_id
  
  # PostgreSQL port depuis Backend seulement
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.backend_security_group_id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "${var.project_name}-database-sg-${var.environment}"
  }
}

# Random password pour la DB
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# Instance RDS PostgreSQL
resource "aws_db_instance" "oracle_postgres" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  # Configuration de base
  identifier = "${var.project_name}-postgres-${var.environment}"
  engine     = "postgres"
  engine_version = "15.4"
  
  # Taille et performance
  instance_class    = var.environment == "prod" ? "db.t3.medium" : "db.t3.micro"
  allocated_storage = var.environment == "prod" ? 100 : 20
  max_allocated_storage = var.environment == "prod" ? 1000 : 100
  storage_type      = "gp3"
  storage_encrypted = true
  
  # Base de données
  db_name  = "oracle_entropie"
  username = "oracle_admin"
  password = random_password.db_password.result
  
  # Réseau et sécurité
  db_subnet_group_name   = aws_db_subnet_group.oracle_db_subnet_group[0].name
  vpc_security_group_ids = [aws_security_group.database_sg[0].id]
  publicly_accessible    = false
  
  # Sauvegardes et maintenance
  backup_retention_period = var.environment == "prod" ? 7 : 3
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  # Haute disponibilité (prod seulement)
  multi_az = var.environment == "prod" ? true : false
  
  # Monitoring
  monitoring_interval = var.environment == "prod" ? 60 : 0
  monitoring_role_arn = var.environment == "prod" ? aws_iam_role.rds_enhanced_monitoring[0].arn : null
  
  # Performance Insights
  performance_insights_enabled = var.environment == "prod" ? true : false
  
  # Protection
  deletion_protection = var.environment == "prod" ? true : false
  skip_final_snapshot = var.environment != "prod"
  final_snapshot_identifier = var.environment == "prod" ? "${var.project_name}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null
  
  tags = {
    Name        = "${var.project_name}-postgres-${var.environment}"
    Environment = var.environment
    Type        = "database"
  }
}

# IAM Role pour Enhanced Monitoring (prod)
resource "aws_iam_role" "rds_enhanced_monitoring" {
  count = var.cloud_provider == "aws" && var.environment == "prod" ? 1 : 0
  
  name = "${var.project_name}-rds-monitoring-role-${var.environment}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "rds_enhanced_monitoring" {
  count = var.cloud_provider == "aws" && var.environment == "prod" ? 1 : 0
  
  role       = aws_iam_role.rds_enhanced_monitoring[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# Stockage du mot de passe dans AWS Secrets Manager
resource "aws_secretsmanager_secret" "db_password" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  name = "${var.project_name}-db-password-${var.environment}"
  
  tags = {
    Name = "${var.project_name}-db-password-${var.environment}"
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  secret_id = aws_secretsmanager_secret.db_password[0].id
  secret_string = jsonencode({
    username = aws_db_instance.oracle_postgres[0].username
    password = random_password.db_password.result
    engine   = "postgres"
    host     = aws_db_instance.oracle_postgres[0].endpoint
    port     = aws_db_instance.oracle_postgres[0].port
    dbname   = aws_db_instance.oracle_postgres[0].db_name
  })
}

# Data sources
data "aws_availability_zones" "available" {
  count = var.cloud_provider == "aws" ? 1 : 0
  state = "available"
}
