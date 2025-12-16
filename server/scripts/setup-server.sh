#!/bin/bash

################################################################################
# Server Setup Script for AWS EC2 (Ubuntu 22.04)
# This script installs all necessary dependencies for the Incial Backend
################################################################################

set -e  # Exit on error

echo "========================================"
echo "Incial Backend - Server Setup Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run this script as root"
    exit 1
fi

print_info "Starting server setup..."
echo ""

# Update system
print_info "Step 1/6: Updating system packages..."
sudo apt update
sudo apt upgrade -y
print_success "System packages updated"
echo ""

# Install Java 17 (Amazon Corretto)
print_info "Step 2/6: Installing Java 17 (Amazon Corretto)..."
if command -v java &> /dev/null; then
    print_info "Java is already installed. Version:"
    java -version
else
    wget -q https://corretto.aws/downloads/latest/amazon-corretto-17-x64-linux-jdk.deb
    sudo dpkg -i amazon-corretto-17-x64-linux-jdk.deb
    sudo apt-get install -f -y
    rm amazon-corretto-17-x64-linux-jdk.deb
    print_success "Java 17 installed"
fi
echo ""

# Install Docker
print_info "Step 3/6: Installing Docker..."
if command -v docker &> /dev/null; then
    print_info "Docker is already installed. Version:"
    docker --version
else
    sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    sudo usermod -aG docker $USER
    print_success "Docker installed"
    print_info "Note: You may need to log out and back in for Docker group membership to take effect"
fi
echo ""

# Install Docker Compose
print_info "Step 4/6: Installing Docker Compose..."
if command -v docker-compose &> /dev/null; then
    print_info "Docker Compose is already installed. Version:"
    docker-compose --version
else
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed"
fi
echo ""

# Install Git and utilities
print_info "Step 5/6: Installing Git and utilities..."
sudo apt install -y git htop curl vim nano unzip
print_success "Git and utilities installed"
echo ""

# Configure firewall (UFW)
print_info "Step 6/6: Configuring firewall..."
if sudo ufw status | grep -q "Status: active"; then
    print_info "UFW is already active"
else
    print_info "Enabling UFW firewall (this may briefly interrupt network connections)..."
    sudo ufw --force enable
fi

# Allow necessary ports
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw allow 8080/tcp comment 'Application'

print_success "Firewall configured"
echo ""

# Summary
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
print_success "Installed components:"
echo "  - Java 17 (Amazon Corretto)"
echo "  - Docker"
echo "  - Docker Compose"
echo "  - Git"
echo "  - System utilities"
echo ""
print_info "Next steps:"
echo "  1. Create application directory: mkdir -p ~/incial-backend"
echo "  2. Follow deployment guide in docs/AWS-DEPLOYMENT-GUIDE.md"
echo ""
print_info "Important: If Docker was just installed, run: newgrp docker"
echo "           Or log out and back in for group membership to take effect"
echo ""
