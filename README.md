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
<img width="1600" height="747" alt="image" src="https://github.com/user-attachments/assets/3b66a15e-bcd9-46a0-972b-05f6acbb2f9e" />


2. Product Page
<img width="1600" height="750" alt="image" src="https://github.com/user-attachments/assets/15fafb03-4bbf-47bc-8511-8797b7c897f0" />
<img width="1600" height="750" alt="image" src="https://github.com/user-attachments/assets/15fafb03-4bbf-47bc-8511-8797b7c897f0" />

3. Cart Page
<img width="929" height="831" alt="image" src="https://github.com/user-attachments/assets/47b98736-fb2f-43f3-86e5-340800b93cd2" />
<img width="929" height="831" alt="image" src="https://github.com/user-attachments/assets/47b98736-fb2f-43f3-86e5-340800b93cd2" />

4. Checkout Page (GST + COD Enabled)
<img width="1127" height="859" alt="image" src="https://github.com/user-attachments/assets/d1962696-b806-4bae-9175-5860aab7087a" />
<img width="1127" height="859" alt="image" src="https://github.com/user-attachments/assets/d1962696-b806-4bae-9175-5860aab7087a" />

5. Order Confirmation Page
<img width="1177" height="779" alt="image" src="https://github.com/user-attachments/assets/160e2e22-c487-4cf1-a5ed-b34a5766db2f" />
<img width="1177" height="779" alt="image" src="https://github.com/user-attachments/assets/160e2e22-c487-4cf1-a5ed-b34a5766db2f" />


✔ Product added
✔ GST calculated
✔ Cash on Delivery enabled
✔ Order successfully created and persisted

Persistence:

Each store uses PersistentVolumeClaims
WordPress database state survives pod restarts
Store data is isolated per namespace

Multi-Tenant Isolation:

Namespace per store
Dedicated PVCs, Secrets, Services
No cross-store access
Independent lifecycle per store

Optional protections implemented:

ResourceQuota per namespace
LimitRange enforcing default CPU/memory limits

Security Posture:

Secrets stored using Kubernetes Secrets
No hardcoded credentials
Public access only via Ingress
Backend APIs internal-only
Least-privilege RBAC for provisioning component
Containers run without elevated privileges where possible

Idempotency & Failure Handling:

Store creation is safe to retry
Helm release names are deterministic
Partial failures clean up resources
Status reflects Failed with clear reason
Delete operation guarantees cleanup

Scaling Plan:--
Horizontally Scalable:

Dashboard
Backend / Orchestrator

Stateful Constraints:

Databases remain stateful per store
PVC-backed storage

Provisioning Throughput:

Concurrent Helm installs supported
Can introduce work queues / rate limits

Abuse Prevention & Guardrails:

Max stores per user (configurable)
Namespace-level resource caps
Provisioning timeouts
Controlled blast radius per store

Production / VPS Deployment (k3s):

The same Helm charts deploy to production with configuration changes only.
Changes via values-prod.yaml
Domain names
StorageClass
Ingress class
Secrets source

Optional TLS (cert-manager):
helm upgrade --install store-platform charts/store -f charts/store/values-prod.yaml

Upgrade & Rollback Strategy:
Helm-managed releases
Safe upgrades using helm upgrade
Rollback using
helm rollback <release> <revision>

Repository Structure:

.
├── backend/                # API + provisioning logic
├── charts/
│   └── store/              # Helm chart for stores
├── scripts/                # Helper scripts
├── screenshots/            # Demo screenshots
├── README.md
└── system-design.md

System Design & Tradeoffs:
Why Helm?

Declarative
Idempotent
Environment configurable
Built-in rollback

Why Namespace-per-Store?

Strong isolation
Clean teardown
Resource governance

Why StatefulSet / PVCs?

Required for WordPress & DB persistence

Demo Video Coverage

The demo video shows:

System architecture overview
Helm-based provisioning
Namespace isolation
Store creation
Product → Cart → Checkout → Order
Kubernetes resources
Store deletion and cleanup
