# Module Monitoring - Oracle d'Entropie
# Netdata + Prometheus + Grafana pour supervision complète

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

variable "public_subnet_id" {
  description = "Public subnet ID"
  type        = string
}

variable "frontend_security_group_id" {
  description = "Frontend security group ID"
  type        = string
}

# Security Group Monitoring
resource "aws_security_group" "monitoring_sg" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  name_prefix = "${var.project_name}-monitoring-${var.environment}"
  vpc_id      = var.vpc_id
  
  # Netdata (19999)
  ingress {
    from_port   = 19999
    to_port     = 19999
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Prometheus (9090)
  ingress {
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Grafana (3000)
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "${var.project_name}-monitoring-sg-${var.environment}"
  }
}

# Instance Monitoring
resource "aws_instance" "monitoring" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  ami                    = data.aws_ami.ubuntu[0].id
  instance_type          = var.environment == "prod" ? "t3.medium" : "t3.small"
  key_name              = "${var.project_name}-key-${var.environment}"
  subnet_id             = var.public_subnet_id
  vpc_security_group_ids = [aws_security_group.monitoring_sg[0].id]
  
  user_data = base64encode(templatefile("${path.module}/scripts/monitoring-setup.sh", {
    environment = var.environment
    project_name = var.project_name
  }))
  
  tags = {
    Name        = "${var.project_name}-monitoring-${var.environment}"
    Environment = var.environment
    Type        = "monitoring"
  }
}

# Elastic IP pour monitoring
resource "aws_eip" "monitoring_eip" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  instance = aws_instance.monitoring[0].id
  domain   = "vpc"
  
  tags = {
    Name = "${var.project_name}-monitoring-eip-${var.environment}"
  }
}

# Data sources
data "aws_ami" "ubuntu" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  most_recent = true
  owners      = ["099720109477"] # Canonical
  
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-22.04-amd64-server-*"]
  }
  
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}
