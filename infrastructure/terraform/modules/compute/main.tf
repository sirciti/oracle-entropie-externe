# Module Compute - Oracle d'Entropie
# Serveurs Frontend/Backend optimisés

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

variable "private_subnet_id" {
  description = "Private subnet ID"
  type        = string
}

variable "frontend_security_group_id" {
  description = "Frontend security group ID"
  type        = string
}

variable "backend_security_group_id" {
  description = "Backend security group ID"
  type        = string
}

# Key Pair pour SSH
resource "aws_key_pair" "oracle_key" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  key_name   = "${var.project_name}-key-${var.environment}"
  public_key = file("~/.ssh/id_rsa.pub")
  
  tags = {
    Name = "${var.project_name}-key-${var.environment}"
  }
}

# Instance Frontend (Vite + Three.js)
resource "aws_instance" "frontend" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  ami                    = data.aws_ami.ubuntu[0].id
  instance_type          = var.environment == "prod" ? "t3.medium" : "t3.micro"
  key_name              = aws_key_pair.oracle_key[0].key_name
  subnet_id             = var.public_subnet_id
  vpc_security_group_ids = [var.frontend_security_group_id]
  
  user_data = base64encode(templatefile("${path.module}/scripts/frontend-setup.sh", {
    environment = var.environment
  }))
  
  tags = {
    Name        = "${var.project_name}-frontend-${var.environment}"
    Environment = var.environment
    Type        = "frontend"
  }
}

# Instance Backend (FastAPI + Python)
resource "aws_instance" "backend" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  ami                    = data.aws_ami.ubuntu[0].id
  instance_type          = var.environment == "prod" ? "t3.medium" : "t3.micro"
  key_name              = aws_key_pair.oracle_key[0].key_name
  subnet_id             = var.private_subnet_id
  vpc_security_group_ids = [var.backend_security_group_id]
  
  user_data = base64encode(templatefile("${path.module}/scripts/backend-setup.sh", {
    environment = var.environment
  }))
  
  tags = {
    Name        = "${var.project_name}-backend-${var.environment}"
    Environment = var.environment
    Type        = "backend"
  }
}

# Load Balancer pour haute disponibilité
resource "aws_lb" "oracle_alb" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  name               = "${var.project_name}-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.frontend_security_group_id]
  subnets           = [var.public_subnet_id]
  
  tags = {
    Name = "${var.project_name}-alb-${var.environment}"
  }
}

# Target Group
resource "aws_lb_target_group" "frontend_tg" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  name     = "${var.project_name}-frontend-tg-${var.environment}"
  port     = 5173
  protocol = "HTTP"
  vpc_id   = var.vpc_id
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }
  
  tags = {
    Name = "${var.project_name}-frontend-tg-${var.environment}"
  }
}

# Target Group Attachment
resource "aws_lb_target_group_attachment" "frontend_attachment" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  target_group_arn = aws_lb_target_group.frontend_tg[0].arn
  target_id        = aws_instance.frontend[0].id
  port             = 5173
}

# Listener
resource "aws_lb_listener" "frontend_listener" {
  count = var.cloud_provider == "aws" ? 1 : 0
  
  load_balancer_arn = aws_lb.oracle_alb[0].arn
  port              = "80"
  protocol          = "HTTP"
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_tg[0].arn
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
