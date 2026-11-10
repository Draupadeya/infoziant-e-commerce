# Docker & Kubernetes Assignment Submission

**Student Username:** `phanindrakilambi`  
**Application:** Vaultex 3D E-Commerce Storefront  
**Date:** November 2026  

---

## 1. Expected Deliverables

### Deliverable 1: Dockerfile
* **File Location:** [`Dockerfile`](file:///d:/infoziant%20e-commerce/Dockerfile)
* **Architecture:** Multi-Stage Build (Node.js 22 Alpine Builder + Nginx 1.27 Alpine Production Server)

```dockerfile
# Multi-stage production build for Vaultex E-Commerce Storefront
# Stage 1: Build React Vite SPA with Node 22
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests and install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend application code and compile
COPY frontend/ .
RUN npm run build

# Stage 2: Serve compiled production bundle via lightweight Nginx Alpine
FROM nginx:1.27-alpine

# Copy custom Nginx configuration with gzip and SPA routing
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port 80
EXPOSE 80

# Health check to ensure Nginx is healthy
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

---

### Deliverable 2: Docker Hub Image Link
* **Public Docker Hub Repository:**  
  👉 **`https://hub.docker.com/r/phanindrakilambi/vaultex-storefront`**
* **Docker Image Tag:**  
  `phanindrakilambi/vaultex-storefront:v1.0`
* **Docker Pull Command:**  
  ```bash
  docker pull phanindrakilambi/vaultex-storefront:v1.0
  ```

---

### Deliverable 3: Kubernetes `deployment.yaml`
* **File Location:** [`deployment.yaml`](file:///d:/infoziant%20e-commerce/deployment.yaml)
* **Features:** 2 Pod Replicas (High Availability), RollingUpdate Zero-Downtime Strategy, Resource Quotas (CPU/Memory limits), Liveness & Readiness Probes.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vaultex-storefront
  labels:
    app: vaultex-storefront
    tier: frontend
spec:
  replicas: 2 # Demonstrates Kubernetes Pod replication & high availability
  selector:
    matchLabels:
      app: vaultex-storefront
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: vaultex-storefront
        tier: frontend
    spec:
      containers:
      - name: vaultex-app
        # Docker Hub image for phanindrakilambi
        image: phanindrakilambi/vaultex-storefront:v1.0
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 80
          name: http
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "256Mi"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 15
          periodSeconds: 20
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
```

---

### Deliverable 4: Kubernetes `service.yaml`
* **File Location:** [`service.yaml`](file:///d:/infoziant%20e-commerce/service.yaml)
* **Type:** NodePort (`30080`) routing external traffic to Port 80 on Nginx pods.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: vaultex-service
  labels:
    app: vaultex-storefront
spec:
  type: NodePort # Exposes service externally on each Minikube node's IP
  selector:
    app: vaultex-storefront
  ports:
  - name: http
    port: 80         # Internal cluster port
    targetPort: 80   # Port on the container running Nginx
    nodePort: 30080  # NodePort accessible via Minikube (range 30000-32767)
```

---

## 2. Execution & Demonstration Commands

In Windows PowerShell inside `d:\infoziant e-commerce`:

```powershell
# 1. Build the production Docker image
docker build -t phanindrakilambi/vaultex-storefront:v1.0 .

# 2. Login & Push to your Docker Hub repository
docker login
docker push phanindrakilambi/vaultex-storefront:v1.0

# 3. Start local Minikube cluster
minikube start

# 4. Deploy both YAML configurations
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# 5. Check cluster status
kubectl get pods -o wide
kubectl get service vaultex-service

# 6. Launch and view in your browser
minikube service vaultex-service
```

*(Alternatively, you can simply run: `.\deploy-docker-k8s.ps1`)*

---

## 3. Viva & Architecture Explanation

| Question | Answer |
| :--- | :--- |
| **Why Multi-Stage Dockerfile?** | It drastically reduces image size (from ~1.2 GB to ~35 MB) and enhances security by excluding Node.js source files, compiler tools, and devDependencies from the final container. |
| **Why 2 Replicas in Deployment?** | Guarantees high availability (HA). If one pod crashes or is updated, traffic seamlessly routes to the healthy pod without downtime. |
| **What do Liveness & Readiness Probes do?** | Readiness probe confirms Nginx is ready to accept HTTP traffic before Minikube directs users to it. Liveness probe periodically checks `/` on port 80 and automatically restarts an unresponsive pod. |
| **Why use NodePort service?** | Exposes the container port `80` to an external port `30080` across the Minikube cluster node, making it directly accessible to web browsers. |

