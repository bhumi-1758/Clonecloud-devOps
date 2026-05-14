#!/bin/bash

# CloneCloud Cleanup Script
# Usage: ./cleanup-env.sh <branch-name>

BRANCH_NAME=$1

if [ -z "$BRANCH_NAME" ]; then
    echo "Error: Branch name not provided."
    echo "Usage: ./cleanup-env.sh <branch-name>"
    exit 1
fi

# Slugify branch name to match namespace
NAMESPACE="clonecloud-$(echo $BRANCH_NAME | sed 's/[^a-zA-Z0-9]/-/g' | tr '[:upper:]' '[:lower:]')"

echo "Cleaning up ephemeral environment for branch: $BRANCH_NAME"
echo "Target Namespace: $NAMESPACE"

# Delete the Helm release
helm uninstall clonecloud --namespace $NAMESPACE

# Delete the namespace
kubectl delete namespace $NAMESPACE

echo "Cleanup complete."
