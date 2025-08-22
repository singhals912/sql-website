# 🚀 SQL Practice Platform Setup

## Quick Start (Automated)

### Option 1: Use startup script
```bash
cd /Users/ss/Downloads/Code/Vibe_coding/SQL_practice_website
./start.sh
```

Then in a **new terminal**:
```bash
cd /Users/ss/Downloads/Code/Vibe_coding/SQL_practice_website
./frontend.sh
```

---

## Manual Setup (Step by Step)

### Step 1: Start Database Services
```bash
cd /Users/ss/Downloads/Code/Vibe_coding/SQL_practice_website/sql-practice-platform
docker-compose up -d postgres redis
```

### Step 2: Start Backend (Terminal 1)
```bash
cd /Users/ss/Downloads/Code/Vibe_coding/SQL_practice_website/backend
node src/server.js
```

### Step 3: Start Frontend (Terminal 2)
```bash
cd /Users/ss/Downloads/Code/Vibe_coding/SQL_practice_website/sql-practice-platform/frontend
npm start
```

---

## Access URLs
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001
- **Health Check:** http://localhost:5001/api/health

---

## Troubleshooting

### Frontend won't start?
```bash
cd sql-practice-platform/frontend
rm -rf node_modules/.cache
npm start
```

### Backend port conflict?
```bash
# Kill existing processes
pkill -f "node.*server"
# Then restart backend
```

### Docker issues?
```bash
# Restart Docker Desktop
# Then run: docker-compose up -d postgres redis
```