# Fast Railway deployment - backend only
FROM node:18-alpine

WORKDIR /app

# Copy package files from current directory
COPY ./package.json ./

# Install dependencies
RUN npm install --only=production

# Copy all backend source files
COPY ./ ./

# Create public folder for potential frontend assets
RUN mkdir -p ./public

EXPOSE 5001

CMD ["npm", "start"]