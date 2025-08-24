# SQL Practice Platform

A comprehensive online platform for SQL practice and learning, inspired by LeetCode.

## Project Structure

```
sql-practice-platform/
├── backend/          # Node.js + Express API
├── frontend/         # React + TypeScript UI
├── docs/            # Documentation
└── docker/          # Docker configurations
```

## Development Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Docker & Docker Compose
- Git

### Quick Start
```bash
# Backend setup
cd backend
npm install
npm run dev

# Frontend setup (new terminal)
cd frontend  
npm install
npm start
```

## Features (MVP)
- [ ] User authentication & registration
- [ ] SQL editor with syntax highlighting
- [ ] Multi-dialect support (PostgreSQL, MySQL, SQLite)
- [ ] Problem database with categories
- [ ] Real-time query execution
- [ ] Progress tracking
- [ ] LeetCode-inspired UI

## Tech Stack
- **Backend:** Node.js, Express, PostgreSQL, Redis, Docker
- **Frontend:** React, TypeScript, Monaco Editor, Tailwind CSS
- **Database:** PostgreSQL (main), Redis (cache)
- **Deployment:** Docker, nginx