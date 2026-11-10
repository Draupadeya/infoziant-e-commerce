#!/usr/bin/env bash
# ==============================================================================
# PORT SECURITY & ISOLATION AUDIT SCRIPT
# Runs on Ubuntu Host / EC2 Instance to verify Open vs Private Ports
# ==============================================================================
set -euo pipefail

echo "=========================================================="
echo " Running Network & Port Security Verification Audit"
echo "=========================================================="

echo "1. Checking Host Listening Sockets (ss -tlpn)..."
echo "----------------------------------------------------------"
sudo ss -tlpn | grep -E '(:80|:443|:8000|:5432)' || echo "No direct service on these ports or docker proxy listening."

echo ""
echo "2. Auditing Docker Published Port Mappings..."
echo "----------------------------------------------------------"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "3. Port Accessibility Audit Table:"
echo "----------------------------------------------------------------------------------"
printf "%-10s %-25s %-18s %-20s\n" "PORT" "SERVICE" "EXPECTED STATE" "VERIFICATION RESULT"
echo "----------------------------------------------------------------------------------"

# Test Port 80
if curl -s -o /dev/null --connect-timeout 2 http://localhost:80; then
    P80_STATUS="CONFIRMED OPEN (HTTP OK)"
else
    P80_STATUS="UNREACHABLE (CHECK NGINX)"
fi
printf "%-10s %-25s %-18s %-20s\n" "80" "Nginx Gateway" "OPEN (PUBLIC)" "${P80_STATUS}"

# Test Port 8000
if curl -s -o /dev/null --connect-timeout 2 http://localhost:8000 2>/dev/null; then
    P8000_STATUS="EXPOSED (SECURITY ALERT!)"
else
    P8000_STATUS="CONFIRMED PRIVATE (SECURE)"
fi
printf "%-10s %-25s %-18s %-20s\n" "8000" "FastAPI Backend" "PRIVATE (INTERNAL)" "${P8000_STATUS}"

# Test Port 5432
if nc -z -w 2 localhost 5432 2>/dev/null; then
    P5432_STATUS="EXPOSED (SECURITY ALERT!)"
else
    P5432_STATUS="CONFIRMED PRIVATE (SECURE)"
fi
printf "%-10s %-25s %-18s %-20s\n" "5432" "PostgreSQL Database" "PRIVATE (STRICT)" "${P5432_STATUS}"

echo "----------------------------------------------------------------------------------"
echo "Audit complete."
