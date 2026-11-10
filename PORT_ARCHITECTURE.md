# Production Network & Port Security Architecture Specification

## Overview

When running an e-commerce shop website live on an **Ubuntu Server (AWS EC2 Host)**, strict network perimeter control is critical to protect customer transactions, order data, and payment information. 

This architecture implements the **Principle of Least Privilege (PoLP)** and **Defense-in-Depth** by isolating application tiers behind a single unified reverse proxy gateway.

---

## 1. Port Summary Table

| Port | Service | Protocol | Visibility | Host Binding | Security Level | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **80** | Nginx Gateway | HTTP (TCP) | **OPEN (Public)** | `0.0.0.0:80` | High Hardening | Entrypoint for all web visitors. Serves React static assets & proxies `/api/*` to FastAPI. |
| **443** | Nginx Gateway | HTTPS (TCP) | **OPEN (Public)** | `0.0.0.0:443` | SSL/TLS Let's Encrypt | Secure encrypted transport for production live transactions. |
| **22** | OpenSSH | SSH (TCP) | **RESTRICTED** | `0.0.0.0:22` | Key-pair only / VPN | Remote server administration (Restricted to admin IP in AWS Security Group). |
| **8000** | FastAPI (Uvicorn) | HTTP (TCP) | **STRICTLY PRIVATE** | *None (Container Only)* | Internal Isolated | Internal REST API processing application logic and orders. Accessible ONLY via Nginx inside Docker bridge network. |
| **5432** | PostgreSQL | PostgreSQL (TCP) | **STRICTLY PRIVATE** | *None (Container Only)* | Internal Isolated | Relational database holding product catalog and customer orders. ZERO external connectivity. |

---

## 2. Traffic Flow Architecture Diagram

```
                     PUBLIC INTERNET (Clients / Browsers)
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │   AWS EC2 SECURITY GROUP / UFW FIREWALL   │
                │     Allows: 80 (HTTP), 443 (HTTPS), 22   │
                │     Blocks: ALL OTHER INBOUND PORTS      │
                └──────────────────────────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │        DOCKER HOST: UBUNTU 22/24 LTS     │
                │                                          │
                │  PORT 80 (Published: 0.0.0.0:80->80)     │
                │  ┌────────────────────────────────────┐  │
                │  │     secrid-nginx-gateway (Nginx)   │  │
                │  └─────────────────┬──────────────────┘  │
                │                    │                     │
                │   ═════════════════╪═════════════════    │
                │   ISOLATED DOCKER BRIDGE: shop-network   │
                │   ═════════════════╪═════════════════    │
                │                    │                     │
                │         ┌──────────┴──────────┐          │
                │         │                     │          │
                │  Route: /*             Route: /api/*     │
                │         ▼                     ▼          │
                │  ┌──────────────┐     ┌──────────────┐   │
                │  │   frontend   │     │   backend    │   │
                │  │  React Vite  │     │ FastAPI/ASGI │   │
                │  │ (Port 80)    │     │ (Port 8000)  │   │
                │  │ [PRIVATE]    │     │ [PRIVATE]    │   │
                │  └──────────────┘     └───────┬──────┘   │
                │                               │          │
                │               Internal Query: │          │
                │               db:5432         │          │
                │                               ▼          │
                │                       ┌──────────────┐   │
                │                       │      db      │   │
                │                       │  Postgres 16 │   │
                │                       │ (Port 5432)  │   │
                │                       │ [PRIVATE]    │   │
                │                       └──────────────┘   │
                └──────────────────────────────────────────┘
```

---

## 3. Why Ports 8000 and 5432 Stay Strictly Private

### Why Port 8000 (FastAPI) Remains Private:
1. **Prevent Direct API Bypass**: If port 8000 was open, attackers could bypass Nginx rate limiting, gzip compression, security headers (`X-Frame-Options`, `Content-Security-Policy`), and SSL termination.
2. **Denial of Service (DoS) Mitigation**: Nginx handles slowloris attacks and connection buffering far more efficiently than Python ASGI workers.
3. **CORS & SSL Unification**: By reverse-proxying `/api/` on port 80/443, the frontend and API share the same origin, eliminating CORS complexity and certificate mismatches.

### Why Port 5432 (PostgreSQL) Must Never Be Public:
1. **Zero Database Attack Surface**: Exposing port 5432 on the public internet exposes your database to continuous automated brute-force attacks, credential stuffing, and zero-day protocol exploits.
2. **Encapsulated Network Layer**: The database container is assigned an IP only on the Docker virtual bridge (`shop-network`). It has no public gateway routing table.
3. **Credential Safeguard**: Even if database credentials were weak, no external connection can initiate a TCP handshake to port 5432.

---

## 4. AWS EC2 Security Group Configuration

In the AWS EC2 Management Console, attach an **Inbound Security Group** with the following exact rules:

| Type | Protocol | Port Range | Source | Description |
| :--- | :--- | :--- | :--- | :--- |
| **HTTP** | TCP | `80` | `0.0.0.0/0` (Anywhere IPv4) | Public HTTP storefront access |
| **HTTP** | TCP | `80` | `::/0` (Anywhere IPv6) | Public HTTP storefront access |
| **HTTPS** | TCP | `443` | `0.0.0.0/0` (Anywhere IPv4) | Public SSL/TLS encrypted storefront |
| **HTTPS** | TCP | `443` | `::/0` (Anywhere IPv6) | Public SSL/TLS encrypted storefront |
| **SSH** | TCP | `22` | `YOUR_OFFICE_IP/32` | System administration (NEVER 0.0.0.0/0) |

> **CRITICAL RULE**: Do **NOT** add rules for Port `8000`, `5432`, or `5173`. If they are not in the Security Group, AWS drops all packets at the hypervisor level before they even reach the Ubuntu host!

---

## 5. Ubuntu Server Host Firewall (UFW) Configuration

On the Ubuntu Server host, execute the following commands to harden the operating system firewall:

```bash
# 1. Reset and establish default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 2. Allow SSH remote admin access (limit to your subnet if possible)
sudo ufw allow 22/tcp comment 'SSH Administration'

# 3. Allow Public Web Ports ONLY
sudo ufw allow 80/tcp comment 'Nginx HTTP Gateway'
sudo ufw allow 443/tcp comment 'Nginx HTTPS Gateway'

# 4. Explicitly ensure backend and database ports are blocked
sudo ufw delete allow 8000/tcp 2>/dev/null || true
sudo ufw delete allow 5432/tcp 2>/dev/null || true

# 5. Enable firewall
sudo ufw enable
sudo ufw status verbose
```

---

## 6. Docker Compose Port Binding Syntax: `ports` vs `expose`

In `docker-compose.yml`, notice the crucial difference:

```yaml
# PUBLIC GATEWAY (Bound to Host 0.0.0.0)
nginx-gateway:
  ports:
    - "80:80"    # <--- Published to host and open to the internet

# PRIVATE SERVICES (Accessible ONLY to other containers on shop-network)
backend:
  expose:
    - "8000"     # <--- Internal Docker DNS only. NO host binding!

db:
  expose:
    - "5432"     # <--- Internal Docker DNS only. NO host binding!
```

- **`ports: - "80:80"`** tells the Docker daemon to bind the host socket on `0.0.0.0:80` and route traffic to the container.
- **`expose: - "8000"`** documents and makes the port available *only* to containers interconnected via `shop-network`. Docker creates **no** iptables forwarding rule on the host network interface.

---

## 7. Verification Commands

Run these commands on the Ubuntu server to confirm port status:

```bash
# 1. Check which ports are actively listening on host network interfaces
sudo ss -tlpn

# Expected output:
# LISTEN   0   511   0.0.0.0:80     0.0.0.0:*    users:(("docker-proxy",pid=...,fd=4))
# LISTEN   0   128   0.0.0.0:22     0.0.0.0:*    users:(("sshd",pid=...,fd=3))
# (Notice 8000 and 5432 DO NOT APPEAR in the list!)

# 2. Audit running Docker containers and port bindings
docker compose ps

# Expected output:
# secrid-nginx-gateway   0.0.0.0:80->80/tcp
# secrid-frontend        80/tcp
# secrid-backend-api     8000/tcp
# secrid-postgres-db     5432/tcp

# 3. Test HTTP entrypoint
curl -I http://localhost:80/

# 4. Verify external connection to 8000 & 5432 is refused
curl -I --connect-timeout 2 http://localhost:8000
# Result: Connection refused / Timeout
```
