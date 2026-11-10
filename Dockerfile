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

