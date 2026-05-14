# CloneCloud Demo Screenshots Guide

This guide details the screenshots you should capture to demonstrate the complete lifecycle of a feature branch using CloneCloud.

## 1. Code Push & Jenkins Trigger
- **Screenshot 1**: Developer committing code and pushing to a branch named `feature/task-priority`.
- **Screenshot 2**: Jenkins webhook triggered, starting the pipeline.

## 2. DevSecOps Pipeline Execution
- **Screenshot 3**: Jenkins console output showing successful `gitleaks` (Secret Scanning).
- **Screenshot 4**: Jenkins console output showing successful `npm audit` (Dependency Scanning).
- **Screenshot 5**: Jenkins console output showing `trivy` container scanning blocking or passing the build.

## 3. Kubernetes Deployment
- **Screenshot 6**: Jenkins console output showing successful `helm upgrade --install` to the normalized namespace `clonecloud-feature-task-priority`.
- **Screenshot 7**: `kubectl get pods -n clonecloud-feature-task-priority` showing running frontend, backend, and mongodb pods.

## 4. Application Verification
- **Screenshot 8**: The browser accessing `http://feature-task-priority.test.example.com` showing the TaskFlow dashboard.

## 5. Load Testing & Chaos Engineering
- **Screenshot 9**: The output of `k6 run` showing load testing results (1000 users).
- **Screenshot 10**: `kubectl get hpa -n clonecloud-feature-task-priority` showing the pods scaling up due to the load.
- **Screenshot 11**: Terminal showing a pod being deleted and immediately recreated by the ReplicaSet.

## 6. Observability
- **Screenshot 12**: Grafana Dashboard ("CloneCloud Fleet Overview") showing the traffic spike and recovery metrics during chaos tests.
- **Screenshot 13**: Prometheus targets showing the dynamically discovered `ServiceMonitor` for the new branch.

## 7. Cleanup
- **Screenshot 14**: Jenkins console output or GitHub Actions log showing the environment being destroyed upon PR merge.
- **Screenshot 15**: `kubectl get namespaces` showing the namespace is completely removed.
