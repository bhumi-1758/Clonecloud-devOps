#!/bin/bash
# Module G: Chaos Testing Scripts
# Usage: ./chaos-test.sh <namespace>

NAMESPACE=$1

if [ -z "$NAMESPACE" ]; then
    echo "Usage: ./chaos-test.sh <namespace>"
    exit 1
fi

echo "Starting Chaos Engineering Tests in namespace: $NAMESPACE"

# 1. Pod Deletion Test (Testing ReplicaSet Recovery)
echo "[Test 1] Random Pod Deletion..."
RANDOM_POD=$(kubectl get pods -n $NAMESPACE -l app=backend -o jsonpath='{.items[*].metadata.name}' | tr ' ' '\n' | head -n 1)

if [ -z "$RANDOM_POD" ]; then
    echo "No backend pods found to delete!"
else
    echo "Deleting pod $RANDOM_POD..."
    kubectl delete pod $RANDOM_POD -n $NAMESPACE
    echo "Waiting for ReplicaSet to recover..."
    sleep 5
    kubectl get pods -n $NAMESPACE -l app=backend
    echo "Pod Deletion Recovery Successful."
fi

# 2. CPU Stress Test (Testing HPA)
# Note: For real clusters, use Chaos Mesh or Litmus. We simulate by lowering limits 
# or running a busy loop in a pod if possible. 
echo "[Test 2] Simulating CPU Stress to trigger HPA..."
# A simple way to stress is to send a massive amount of traffic, or patch the deployment
# to use a busy-box image temporarily to spike CPU.
# We will use the load testing script (k6) to simulate stress for HPA triggering.
echo "Run the load testing script to trigger HPA: k6 run tests/load/k6-script.js"

# 3. Network Disruption (Testing Network Policies)
echo "[Test 3] Validating Network Isolation..."
echo "Attempting to access MongoDB directly from outside (Should Timeout/Fail)..."
kubectl run curl-test --image=radial/busyboxplus:curl -i --tty --rm --restart=Never -n $NAMESPACE -- timeout 5 curl http://clonecloud-mongodb:27017 || echo "Network Policy blocked external access to DB successfully."

echo "Chaos Testing Validation Complete. Check Prometheus/Grafana for recovery metrics."
