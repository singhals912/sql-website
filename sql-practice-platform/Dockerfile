# Fast Railway deployment - backend only
FROM node:18-alpine

WORKDIR /app

# Copy and install backend dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy backend source
COPY backend/ ./

# Create public folder for potential frontend assets
RUN mkdir -p ./public

EXPOSE 5001

CMD ["npm", "start"]