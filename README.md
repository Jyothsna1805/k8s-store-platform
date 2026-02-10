# Kubernetes Store Provisioning Platform (WooCommerce)

A multi-tenant, Kubernetes-native store provisioning platform that automatically deploys fully functional ecommerce stores using Helm.  
Designed to run locally (Kind / Minikube / k3d) and deploy unchanged to production-like environments (k3s on VPS) via Helm values.

---

## Project Overview

This project implements a **store provisioning platform** where users can dynamically create isolated ecommerce stores on Kubernetes.

Each store:
- Is deployed into its **own Kubernetes namespace**
- Has **persistent storage**
- Is exposed via **Ingress with stable URLs**
- Supports **end-to-end order placement**

For **Round 1**, WooCommerce (WordPress + WooCommerce) is fully implemented.  
The architecture is designed to support MedusaJS with minimal changes in Round 2.

---

## Architecture & Components

### 1. Dashboard (Frontend)
- Displays existing stores and their status
- Triggers store creation and deletion
- Shows store URLs and timestamps

### 2. Backend / Orchestrator
- Receives store lifecycle requests
- Generates per-store configuration
- Invokes Helm installs/upgrades/deletes
- Tracks provisioning state

### 3. Helm Charts
- Parameterized Helm chart for stores
- Environment-specific values (`values-local.yaml`, `values-prod.yaml`)
- Kubernetes-native provisioning

### 4. Kubernetes Resources
Each store provisions:
- Namespace
- Deployment / StatefulSet
- Service
- Ingress
- PersistentVolumeClaims
- Secrets
- ResourceQuota + LimitRange

---

## End-to-End Flow

1. User clicks **Create Store**
2. Backend provisions Kubernetes resources using Helm
3. Store status transitions: `Provisioning → Ready`
4. Store is accessible via Ingress URL
5. User places an order successfully
6. User deletes store → all resources are cleaned up

---
REPOSITORY STRUCTURE  :

k8s-store-platform/
├── backend/                # Node.js backend / orchestrator
│   ├── src/
│   ├── routes/
│   └── index.js
├── charts/
│   └── store/              # Helm chart for WooCommerce store
│       ├── templates/
│       ├── values.yaml
│       └── Chart.yaml
├── values-local.yaml       # Local environment values
├── values-prod.yaml        # Production (VPS/k3s) values
├── screenshots/            # WooCommerce demo screenshots
├── README.md
└── system-design.md
## Local Setup Instructions

### Prerequisites
- Docker
- kubectl
- Helm v3+
- Kind / Minikube / k3d
- Node.js (for backend/dashboard)

### Start Kubernetes Cluster (example using Kind)

kind create cluster --name store-platform

Install Ingress Controller:
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

Deploy Platform Components:
helm install store-platform charts/store -f charts/store/values-local.yaml

Local Domain Mapping

Add to /etc/hosts:
127.0.0.1 store1.local

WooCommerce Validation : 

The following screenshots demonstrate a complete end-to-end WooCommerce flow.

1. WooCommerce Store Setup Completed
<img width="1600" height="747" alt="image" src="https://github.com/user-attachments/assets/3b66a15e-bcd9-46a0-972b-05f6acbb2f9e" />

2. Product Page
<img width="1600" height="750" alt="image" src="https://github.com/user-attachments/assets/15fafb03-4bbf-47bc-8511-8797b7c897f0" />

3. Cart Page
<img width="929" height="831" alt="image" src="https://github.com/user-attachments/assets/47b98736-fb2f-43f3-86e5-340800b93cd2" />

4. Checkout Page (GST + COD Enabled)
<img width="1127" height="859" alt="image" src="https://github.com/user-attachments/assets/d1962696-b806-4bae-9175-5860aab7087a" />

5. Order Confirmation Page
<img width="1177" height="779" alt="image" src="https://github.com/user-attachments/assets/160e2e22-c487-4cf1-a5ed-b34a5766db2f" />


✔ Product added
✔ GST calculated
✔ Cash on Delivery enabled
✔ Order successfully created and persisted

---

## Persistence & Data Management

Each provisioned store is stateful and backed by persistent storage to ensure data durability across pod restarts and upgrades.

- **Database Persistence**
  - WooCommerce stores use a MySQL database deployed per store.
  - Each database uses a dedicated **PersistentVolumeClaim (PVC)**.
  - PVCs are created inside the store’s namespace to ensure isolation.

- **WordPress Data Persistence**
  - WordPress uploads and plugins are stored on a separate PVC.
  - Ensures media and configuration are not lost during pod recreation.

- **Storage Classes**
  - Local development: default Kubernetes storage class (e.g., `standard`).
  - Production (k3s/VPS): configurable via Helm values to use hostPath, local-path, or cloud-backed storage.

---

## Isolation, Reliability, and Cleanup

### Namespace-based Isolation
- Each store is provisioned in its **own Kubernetes namespace**.
- All resources (Pods, Services, PVCs, Secrets, Ingress) are scoped to that namespace.
- This ensures strong tenant isolation and controlled blast radius.

### Reliability
- Pods include **readiness and liveness probes**.
- Provisioning status is tracked (`Provisioning → Ready → Failed`).
- Helm ensures consistent, declarative deployments.

### Cleanup Guarantees
- Deleting a store:
  - Uninstalls the Helm release.
  - Deletes the namespace.
  - Automatically removes PVCs, Secrets, and Services.
- No orphaned resources remain after teardown.

---

## Security Posture

- **Secrets Management**
  - Database credentials and WordPress secrets are stored as Kubernetes Secrets.
  - No secrets are hardcoded in source code or Helm charts.

- **RBAC & Least Privilege**
  - Provisioning backend uses limited Kubernetes permissions.
  - Scoped access only to namespaces it manages.

- **Network Exposure**
  - Only Ingress endpoints are publicly exposed.
  - Databases and internal services remain cluster-internal.

- **Container Hardening**
  - Official images are used (WordPress, MySQL).
  - Containers can be configured to run as non-root in production.

---

## Scaling Plan

### Horizontally Scalable Components
- **Dashboard (Frontend)**: stateless, horizontally scalable.
- **Backend API / Orchestrator**: stateless, can scale with replicas.
- **Ingress Controller**: scalable based on traffic.

### Provisioning Throughput
- Store provisioning requests are serialized or rate-limited.
- Concurrency controls prevent resource exhaustion.
- Horizontal scaling allows multiple store creations in parallel.

### Stateful Constraints
- Databases remain single-replica per store.
- Scaling is achieved by provisioning more stores, not scaling individual databases.

---

## Abuse Prevention & Guardrails

- **Rate Limiting**
  - Limit store creation requests per user/IP.

- **Quotas**
  - Namespace-level `ResourceQuota` and `LimitRange`:
    - CPU
    - Memory
    - Maximum PVC size per store

- **Timeouts**
  - Provisioning jobs have timeouts to prevent stuck states.

- **Audit Logging**
  - All create/delete actions are logged with timestamps.

---

## Local-to-Production Deployment Story

### Local (Development)
- Kubernetes: Kind / Minikube
- Ingress: NGINX with local domain mapping (e.g., `/etc/hosts`)
- Storage: default local storage class

### Production-like (VPS with k3s)
- Kubernetes: k3s
- Ingress: NGINX or Traefik
- Domains: real DNS records
- Storage: hostPath or cloud-backed volumes
- Secrets injected via Helm values or external secret managers

### Helm Values Separation
- values-local.yaml
- values-prod.yaml

This allows the **same Helm charts** to be deployed without code changes.

---

## Upgrade & Rollback Strategy

- Store upgrades are performed using:

  helm upgrade <release-name> ./charts/store -f values-prod.yaml

**THIS PROJECT DEMONSTRATES A PRODUCTION-READY, KUBERNETES-NATIVE MULTI-TENANT STORE PROVISIONING PLATFORM WITH END-TO-END ORDER FLOW, STRONG ISOLATION, AND A CLEAR PATH FROM LOCAL DEVELOPMENT TO VPS-BASED PRODUCTION DEPLOYMENT.**

