# Multi-stage build for production
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ ./

FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:18-alpine AS production

# Install production dependencies
RUN apk add --no-cache postgresql-client mysql-client

WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/backend ./backend
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

WORKDIR /app/backend

EXPOSE 5001

CMD ["npm", "start"]