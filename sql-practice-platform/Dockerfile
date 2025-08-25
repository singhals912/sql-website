FROM node:18-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

COPY backend/ ./backend/

EXPOSE 5001

CMD ["node", "backend/index.js"]