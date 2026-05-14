# CloneCloud – Ephemeral Testing Environment Generator

CloneCloud is an enterprise-grade DevOps platform that automatically spins up isolated testing environments for every feature branch.

## 🚀 Overview

Whenever a developer pushes a branch, CloneCloud:
1. Builds the **TaskFlow** microservice (Frontend & Backend).
2. Runs unit tests and security scans.
3. Packages applications into Docker containers.
4. Deploys a branch-specific Helm chart to Kubernetes.
5. Generates a unique preview URL (e.g., `feat-auth.test.example.com`).
6. Enables Prometheus monitoring and Grafana dashboards for the environment.
7. Automatically cleans up resources upon branch merge.

## 📁 Repository Structure

- `src/frontend`: React Dashboard (Vite).
- `src/backend`: Node.js Express API (MongoDB).
- `docker/`: Multi-stage Dockerfiles.
- `helm/`: Kubernetes templates.
- `monitoring/`: Grafana dashboards and Prometheus rules.
- `scripts/`: Cleanup and utility scripts.
- `Jenkinsfile`: The core CI/CD pipeline definition.

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- MongoDB (running locally or via Docker)

### Backend
```bash
cd src/backend
npm install
npm start
```

### Frontend
```bash
cd src/frontend
npm install
npm run dev
```

## ☸️ Kubernetes Deployment

To deploy manually using Helm:
```bash
helm upgrade --install my-feature ./helm/clonecloud \
    --namespace clonecloud-my-feature \
    --create-namespace \
    --set global.domain=example.com
```

## 🧹 Cleanup
```bash
./scripts/cleanup-env.sh my-feature
```
