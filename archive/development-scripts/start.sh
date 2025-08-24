#!/bin/bash

echo "🚀 Starting SQL Practice Platform..."

# Start Docker services
echo "1. Starting database services..."
cd sql-practice-platform
docker-compose up -d postgres redis
echo "✅ Database services started"

# Start backend
echo "2. Starting backend server..."
cd ../backend
node src/server.js &
BACKEND_PID=$!
echo "✅ Backend running on http://localhost:5001 (PID: $BACKEND_PID)"

# Wait a moment for backend to start
sleep 2

# Test backend
echo "3. Testing backend..."
curl -s http://localhost:5001/api/health || echo "❌ Backend not responding"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Now run frontend in a new terminal:"
echo "cd /Users/ss/Downloads/Code/Vibe_coding/SQL_practice_website/sql-practice-platform/frontend"
echo "npm start"
echo ""
echo "Backend PID: $BACKEND_PID (to kill: kill $BACKEND_PID)"