# ========================================================
# Vaultex Storefront - Docker & Kubernetes Automation Script
# User: phanindrakilambi
# Image: phanindrakilambi/vaultex-storefront:v1.1
# ========================================================

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Step 1: Building Docker Image (v1.1)" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
docker build -t phanindrakilambi/vaultex-storefront:v1.1 .
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker build failed! Please make sure Docker Desktop is running." -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  Step 2: Pushing Image to Docker Hub" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Authenticating to Docker Hub (if not logged in)..."
docker push phanindrakilambi/vaultex-storefront:v1.1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker push failed! Check your Docker Hub credentials." -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  Step 3: Checking Minikube Status" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
$minikubeStatus = minikube status --format "{{.Host}}" 2>$null
if ($minikubeStatus -ne "Running") {
    Write-Host "Starting Minikube cluster..." -ForegroundColor Yellow
    minikube start
}

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  Step 4: Deploying Kubernetes Manifests" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

Write-Host "`nWaiting for Pods to become Ready..." -ForegroundColor Yellow
kubectl rollout status deployment/vaultex-storefront --timeout=120s

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  Step 5: Verifying Cluster Deployment" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
kubectl get pods -l app=vaultex-storefront -o wide
kubectl get service vaultex-service

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  Step 6: Launching Application via Minikube Service" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
minikube service vaultex-service

