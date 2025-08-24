#!/bin/bash

echo "🎨 Starting Frontend..."

cd sql-practice-platform/frontend

# Clear any React cache
rm -rf node_modules/.cache 2>/dev/null || true

echo "Starting React development server..."
npm start