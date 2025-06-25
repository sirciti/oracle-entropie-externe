# Module Network - Oracle d'Entropie
# Support multi-cloud AWS/GCP

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

# AWS Network Configuration
resource "aws_vpc" "oracle_vpc" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name        = "${var.project_name}-vpc-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Subnet publique (Frontend)
resource "aws_subnet" "public_subnet" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  vpc_id                  = aws_vpc.oracle_vpc[0].id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true
  
  tags = {
    Name = "${var.project_name}-public-${var.environment}"
    Type = "public"
  }
}

# Subnet privée (Backend + Database)
resource "aws_subnet" "private_subnet" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  vpc_id            = aws_vpc.oracle_vpc[0].id
  cidr_block        = "10.0.2.0/24"
  availability_zone = data.aws_availability_zones.available.names[0]
  
  tags = {
    Name = "${var.project_name}-private-${var.environment}"
    Type = "private"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "oracle_igw" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  vpc_id = aws_vpc.oracle_vpc[0].id
  
  tags = {
    Name = "${var.project_name}-igw-${var.environment}"
  }
}

# Security Group Frontend
resource "aws_security_group" "frontend_sg" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  name_prefix = "${var.project_name}-frontend-${var.environment}"
  vpc_id      = aws_vpc.oracle_vpc[0].id
  
  # HTTP/HTTPS
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Vite dev server
  ingress {
    from_port   = 5173
    to_port     = 5173
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
    Name = "${var.project_name}-frontend-sg-${var.environment}"
  }
}

# Security Group Backend
resource "aws_security_group" "backend_sg" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  name_prefix = "${var.project_name}-backend-${var.environment}"
  vpc_id      = aws_vpc.oracle_vpc[0].id
  
  # FastAPI
  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.frontend_sg[0].id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "${var.project_name}-backend-sg-${var.environment}"
  }
}

# Data sources
data "aws_availability_zones" "available" {
  count = var.cloud_provider == "aws" ? 1 : 0
  state = "available"
}
