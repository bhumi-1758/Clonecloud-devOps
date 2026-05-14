# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY src/backend/package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine

WORKDIR /app

# Run as non-root user
RUN addgroup -S taskflow && adduser -S taskflow -G taskflow
USER taskflow

COPY --from=builder --chown=taskflow:taskflow /app/node_modules ./node_modules
COPY --chown=taskflow:taskflow src/backend/ ./

# Environment defaults
ENV NODE_ENV=production \
    PORT=5000 \
    MONGO_URI=mongodb://mongodb:27017/taskflow

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]
