# Store Application Platform (Kubernetes + Helm)

## Overview
This project demonstrates a simplified multi-tenant store platform built on Kubernetes.
Each store is provisioned in an isolated namespace using Helm, with resource limits and clean lifecycle management.

The goal is to show:
- Store provisioning & deletion
- Namespace-level isolation
- Idempotent operations
- Helm-based deployments
- Clear local → production story

---

## System Architecture

### Components
- **Backend API (Node.js)**  
  Handles store lifecycle: create, list, delete.
- **Helm Chart**  
  Defines Kubernetes resources per store.
- **Kubernetes (Minikube / k3s)**  
  Runs isolated namespaces per store.

### Responsibilities
- Backend validates requests and ensures idempotency.
- Helm provisions Kubernetes resources.
- Kubernetes enforces isolation and quotas.

---

## End-to-End Flow

1. Create store via API
2. Namespace is created
3. Deployment + Service applied
4. Store becomes ready
5. Store can be deleted
6. Namespace and all resources are cleaned up

---

## Local Setup (Minikube)

### Prerequisites
- Docker
- Minikube
- kubectl
- Helm
- Node.js (>=18)

### Start Kubernetes
```bash
minikube start
