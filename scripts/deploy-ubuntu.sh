#!/usr/bin/env bash
# ==============================================================================
# VAULTEX STOREFRONT - UBUNTU SERVER (AWS EC2) PRODUCTION DEPLOYMENT SCRIPT
# Target OS: Ubuntu 22.04 LTS / Ubuntu 24.04 LTS
# ==============================================================================
set -euo pipefail

echo "=========================================================="
echo " Starting VAULTEX Storefront Deployment on Ubuntu Host"
echo "=========================================================="

# 1. Update system packages
echo "==> [1/6] Updating APT package index..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release ufw net-tools

# 2. Install Docker Engine and Docker Compose Plugin if not present
if ! command -v docker &> /dev/null; then
    echo "==> [2/6] Installing official Docker Engine..."
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker "$USER"
    echo "Docker installed successfully."
else
    echo "==> [2/6] Docker is already installed."
fi

# 3. Configure Ubuntu Host UFW Firewall
# Port 80 (and 443) OPEN to public; Ports 8000 and 5432 BLOCKED/PRIVATE
echo "==> [3/6] Configuring Ubuntu UFW Host Firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH Remote Management'
sudo ufw allow 80/tcp comment 'HTTP Nginx Public Gateway'
sudo ufw allow 443/tcp comment 'HTTPS SSL Traffic'
# Explicitly verify private ports are never opened in UFW:
sudo ufw delete allow 8000/tcp 2>/dev/null || true
sudo ufw delete allow 5432/tcp 2>/dev/null || true
echo "y" | sudo ufw enable
sudo ufw status verbose

# 4. Prepare Environment Configuration
echo "==> [4/6] Verifying environment files..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "Created .env from .env.example. Please review credentials for production."
    else
        echo "ERROR: .env file missing."
        exit 1
    fi
fi

# 5. Build and launch Docker Compose stack
echo "==> [5/6] Building and running containers via Docker Compose..."
docker compose down --remove-orphans || true
docker compose build --no-cache
docker compose up -d

# 6. Verify Port Listening Status & Service Health
echo "==> [6/6] Verifying Port Status and Service Isolation..."
sleep 8

echo ""
echo "=== DOCKER RUNNING CONTAINERS ==="
docker compose ps

echo ""
echo "=== HOST LISTENING PORTS (ss -tlpn) ==="
sudo ss -tlpn | grep -E ':(80|8000|5432)\b' || true

echo ""
echo "=== TESTING PUBLIC PORT 80 (HTTP) ==="
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80/ || echo "FAILED")
echo "HTTP GET http://localhost:80/ -> Status Code: ${HTTP_CODE}"

echo ""
echo "=== TESTING API REVERSE PROXY VIA PORT 80 ==="
API_HEALTH=$(curl -s http://localhost:80/api/health || echo "FAILED")
echo "Healthcheck Response: ${API_HEALTH}"

echo ""
echo "=== VERIFYING PRIVATE PORTS (8000 & 5432) ARE NOT ACCESSIBLE EXTERNALLY ==="
if curl -s --connect-timeout 2 http://127.0.0.1:8000 >/dev/null 2>&1; then
    echo "WARNING: Port 8000 answered on host (check if host port binding exists)!"
else
    echo "SUCCESS: Port 8000 is PRIVATE (Not accessible from host network)."
fi

if nc -z -w2 127.0.0.1 5432 2>/dev/null; then
    echo "WARNING: Port 5432 answered on host (PostgreSQL is exposed)!"
else
    echo "SUCCESS: Port 5432 is STRICTLY PRIVATE (PostgreSQL safe inside Docker bridge)."
fi

echo ""
echo "=========================================================="
echo " VAULTEX Storefront is LIVE on Port 80!"
echo " Public Port:  80 (Nginx Gateway -> React + FastAPI)"
echo " Private Ports: 8000 (FastAPI), 5432 (PostgreSQL)"
echo "=========================================================="
