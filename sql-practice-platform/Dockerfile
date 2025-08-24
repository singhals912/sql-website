# Multi-stage build for SQL Practice Platform
FROM node:18-alpine AS backend-builder

WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ ./

FROM node:18-alpine AS frontend-builder

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:18-alpine AS production

# Install database clients for SQL execution
RUN apk add --no-cache postgresql-client mysql-client

WORKDIR /app

# Copy built backend
COPY --from=backend-builder /app ./
# Copy built frontend static files
COPY --from=frontend-builder /app/build ./public

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5001

CMD ["npm", "start"]