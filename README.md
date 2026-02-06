# Store Application Deployment using Helm

This project demonstrates deploying a simple Store application on Kubernetes using Helm with namespace isolation and resource management.

---

## Prerequisites
- Docker
- Minikube
- kubectl
- Helm

---

## Project Structure

```
helm/store/
├── Chart.yaml
├── values.yaml
├── values-local.yaml
├── values-prod.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── namespace.yaml
│   ├── resourcequota.yaml
│   └── limitrange.yaml
```

---

## Local Setup

```bash
minikube start
```

---

## Deploy Store Application

```bash
kubectl create namespace store-demo
helm install store-demo ./helm/store -n store-demo -f values-local.yaml
```

---

## Verify Deployment

```bash
kubectl get pods -n store-demo
kubectl get svc -n store-demo
```

---

## Cleanup Resources

```bash
helm uninstall store-demo -n store-demo
kubectl delete namespace store-demo
```

---

## Result

The Store application is successfully deployed on Kubernetes using Helm with proper deployment, service exposure, and resource isolation.
