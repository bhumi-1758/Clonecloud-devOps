#!/bin/sh
# This script will run before nginx starts to inject runtime environment variables

if [ -n "$API_URL" ]; then
  sed -i "s|__API_URL__|$API_URL|g" /usr/share/nginx/html/index.html
fi

exec "$@"
