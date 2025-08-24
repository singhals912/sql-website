# Multi-stage build for SQL Practice Platform
FROM node:18-alpine AS backend-builder

WORKDIR /app
COPY sql-practice-platform/backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

COPY sql-practice-platform/backend/ ./backend/

FROM node:18-alpine AS frontend-builder

WORKDIR /app
COPY sql-practice-platform/frontend/package*.json ./frontend/
RUN cd frontend && npm ci
COPY sql-practice-platform/frontend/ ./frontend/
RUN cd frontend && npm run build

FROM node:18-alpine AS production

# Install database clients
RUN apk add --no-cache postgresql-client mysql-client

WORKDIR /app

# Copy built applications
COPY --from=backend-builder /app/backend ./backend
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# Set working directory to backend
WORKDIR /app/backend

EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5001/api/health || exit 1

CMD ["npm", "start"]