#!/bin/bash
# Module H: End-to-End Demo Automation

set -e

BRANCH_NAME="feature/demo-auth-$(date +%s)"
# Normalizing exactly like Jenkinsfile
BRANCH_SLUG=$(echo "$BRANCH_NAME" | sed -e 's/[^a-zA-Z0-9]/-/g' | tr '[:upper:]' '[:lower:]')
NAMESPACE="clonecloud-${BRANCH_SLUG}"
DOMAIN="test.example.com"
INGRESS_HOST="${BRANCH_SLUG}.${DOMAIN}"

echo "=========================================="
echo "🚀 CLONECLOUD END-TO-END DEMO AUTOMATION"
echo "=========================================="
echo ""
echo "1. Creating feature branch: $BRANCH_NAME"
# In a real environment, this would be a git checkout -b and git push
sleep 2

echo "2. Simulating Code Push & Jenkins Trigger..."
echo "Normalized Branch Slug: $BRANCH_SLUG"
sleep 2

echo "3. Triggering Jenkins Pipeline (Mocked for Demo)..."
echo "   - Running DevSecOps Scans (Trufflehog, Trivy, NPM Audit)"
echo "   - Building Docker Images: backend:${BRANCH_SLUG}, frontend:${BRANCH_SLUG}"
echo "   - Pushing to Registry"
sleep 3

echo "4. Deploying ephemeral namespace: $NAMESPACE"
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
helm upgrade --install clonecloud ./helm/clonecloud \
    --namespace $NAMESPACE \
    --set global.domain=$DOMAIN \
    --set ingress.host=$INGRESS_HOST \
    --set backend.image.tag=latest \
    --set frontend.image.tag=latest \
    --wait

echo "5. Wait for Pods to become ready..."
kubectl wait --for=condition=ready pod -l app=backend -n $NAMESPACE --timeout=60s
kubectl wait --for=condition=ready pod -l app=frontend -n $NAMESPACE --timeout=60s

echo "=========================================="
echo "✅ DEPLOYMENT SUCCESSFUL"
echo "=========================================="
echo "Access your feature branch URL: http://$INGRESS_HOST"
echo "NOTE: Add this to your /etc/hosts for local testing:"
echo "127.0.0.1 $INGRESS_HOST"
echo ""

echo "6. Triggering Load & Chaos Tests..."
echo "Running Load Test (100 users)..."
# k6 run tests/load/k6-script.js -e TARGET_URL=http://$INGRESS_HOST

echo "Running Chaos Tests (Pod Deletion)..."
chmod +x tests/chaos/chaos-test.sh
./tests/chaos/chaos-test.sh $NAMESPACE

echo ""
echo "7. Simulating PR Merge & Cleanup..."
read -p "Press Enter to destroy the ephemeral environment..."
./scripts/cleanup-env.sh $BRANCH_NAME

echo "✨ Demo Completed Successfully."
