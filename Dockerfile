# Fast Railway deployment - backend only
FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY sql-practice-platform/backend/package.json ./

# Install dependencies
RUN npm install --only=production

# Copy backend source files
COPY sql-practice-platform/backend/ ./

# Create public folder for potential frontend assets
RUN mkdir -p ./public

EXPOSE 5001

CMD ["npm", "start"]