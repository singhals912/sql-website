# SQL Practice Platform

A full-stack web application for learning and practicing SQL with interactive challenges, personalized recommendations, and progress tracking.

## 🏗️ Current Architecture

### Frontend (Vercel - datasql.pro)
- **Framework**: React 18 with React Router v6
- **Styling**: Tailwind CSS with dark mode support
- **Deployment**: Vercel (custom domain: datasql.pro)
- **Build**: Create React App

### Backend (Railway)
- **Framework**: Node.js with Express
- **Database**: PostgreSQL (planned, currently using in-memory storage)
- **Email**: SendGrid integration for password reset
- **Authentication**: JWT tokens with bcrypt password hashing
- **Deployment**: Railway (sql-website-production-d4d1.up.railway.app)

## 📁 Project Structure

```
sql-practice-platform/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components (HomePage, LoginPage, etc.)
│   │   ├── contexts/        # React contexts (AuthContext, ThemeContext)
│   │   ├── services/        # API service layers
│   │   └── config/          # Environment configuration
│   ├── public/
│   │   ├── index.html
│   │   └── _redirects       # Netlify/Vercel routing rules
│   └── package.json
├── backend/                 # Node.js backend
│   ├── routes/              # Express route handlers
│   │   ├── auth-minimal-test.js  # Currently active auth routes
│   │   ├── auth.js          # Full auth implementation
│   │   └── [other routes]
│   ├── config/              # Database and environment config
│   ├── middleware/          # Express middleware
│   └── index.js             # Main server file
├── vercel.json              # Vercel deployment config
└── README.md
```

## 🔧 Current Implementation Status

### ✅ Working Features
- **Email System**: SendGrid integration with password reset emails
- **Authentication Backend**: Login, register, forgot password, reset password endpoints
- **In-Memory Data**: Users, bookmarks, progress tracking (session-based)
- **Frontend Components**: Complete UI for all features
- **Dark Mode**: Full dark/light theme support

### ⚠️ Critical Issues (Need Immediate Attention)
- **🔴 Domain Down**: datasql.pro not loading (site completely inaccessible)
- **🔴 Reset Password Routing**: Links redirect to homepage instead of reset form
- **🔴 Bookmarks API**: "Failed to load bookmarks" error persists
- **🟡 Homepage Duplicates**: Some repetitive content sections
- **🟡 API Routing**: Frontend-backend communication issues

## 🔄 Current Route Structure

### Frontend Routes (React Router)
```javascript
/ → NewHomePage
/login → LoginPage  
/register → RegisterPage
/reset-password → ResetPasswordPage (BROKEN - redirects to /)
/bookmarks → BookmarksPage (BROKEN - API errors)
/problems → ProblemsPage
/progress → ProgressPage  
/profile → ProfilePage
```

### Backend API Routes (Express)
```javascript
// Auth routes
POST /api/auth/login
POST /api/auth/register  
POST /api/auth/forgot-password
POST /api/auth/reset-password

// Data routes (mapped to auth routes temporarily)
GET /api/bookmarks
GET /api/bookmarks/stats
POST /api/bookmarks
GET /api/progress
GET /api/recommendations/problems
GET /api/recommendations/daily-challenge
```

## 🔐 Authentication Flow

### Current Implementation (In-Memory)
1. **Registration**: Creates user in `global.users` array
2. **Login**: Validates password with bcrypt, returns JWT token
3. **Forgot Password**: Generates token, sends email via SendGrid
4. **Reset Password**: Validates token, updates password in memory

### Environment Variables (Railway)
```
SMTP_PASS=SG.xxx (SendGrid API key)
EMAIL_FROM=noreply@datasql.pro
JWT_SECRET=xxx
```

## 📧 Email Configuration

### SendGrid Setup
- **Domain**: datasql.pro authenticated with SendGrid
- **DNS Records**: CNAME records added to domain provider
- **API Key**: Full access key configured in Railway
- **Templates**: HTML email templates for password reset

### Email Flow
1. User requests password reset
2. Backend generates secure token
3. SendGrid sends email with reset link
4. Link format: `https://datasql.pro/reset-password?token=xxx`

## 🐛 Known Issues & Debugging

### 🔴 CRITICAL: Issue 1 - Domain Not Loading
- **Problem**: datasql.pro completely inaccessible
- **Impact**: Entire application down
- **Possible Causes**: 
  - Vercel deployment failure
  - DNS propagation issues  
  - Routing configuration breaking deployment
  - Build failures from recent changes
- **Status**: URGENT - needs immediate investigation

### 🔴 Issue 2: Reset Password Routing
- **Problem**: Reset links redirect to homepage
- **Cause**: Vercel routing not handling React Router client-side routes
- **Attempted Fixes**: 
  - Added _redirects file
  - Updated vercel.json with rewrites
  - Simplified routing configuration
- **Status**: Still broken

### 🔴 Issue 3: Bookmarks API Failures  
- **Problem**: "Failed to load bookmarks" error
- **Cause**: API endpoint mismatch and data structure issues
- **Expected**: `/api/bookmarks/stats` returning specific format
- **Attempted Fixes**:
  - Added `/api/bookmarks/stats` endpoint
  - Fixed data structure to match frontend expectations
  - Added session ID header handling
- **Status**: API exists but still failing

### 🟡 Issue 4: Homepage Content Duplication
- **Problem**: Repetitive sections and data sync issues
- **Cause**: Multiple components rendering similar content
- **Fix Applied**: Removed duplicates from RecommendationDashboard
- **Status**: Should be resolved

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Local Development
```bash
# Clone repository
git clone [repo-url]
cd sql-practice-platform

# Backend setup
cd backend
npm install
npm run dev    # Runs on localhost:5001

# Frontend setup  
cd ../frontend
npm install
npm start      # Runs on localhost:3000
```

### Environment Configuration
Create `.env` files:

**Backend `.env`:**
```env
PORT=5001
NODE_ENV=development
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3000

# Email (SendGrid)
SMTP_PASS=SG.your-sendgrid-api-key
EMAIL_FROM=noreply@datasql.pro

# Database (planned)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sql_practice
DB_USER=postgres
DB_PASSWORD=your-password
```

## 🚀 Deployment Status

### Vercel (Frontend)
- **Domain**: datasql.pro
- **Status**: 🔴 **CRITICAL - NOT LOADING**
- **Build**: Automatic on main branch push
- **Config**: vercel.json with routing rules

### Railway (Backend)  
- **URL**: sql-website-production-d4d1.up.railway.app
- **Status**: ✅ Running
- **Environment**: Production variables configured
- **Database**: PostgreSQL planned but not connected

## 📋 Immediate Action Items for New Session

### 🔴 URGENT (Fix First)
1. **Investigate why datasql.pro is down**
   - Check Vercel deployment status
   - Verify DNS settings
   - Check for build failures
   - Test if vercel.json changes broke deployment

2. **Fix reset password routing**
   - Debug why React Router isn't working on Vercel
   - Test local vs production routing behavior
   - Consider alternative routing solutions

3. **Fix bookmarks API completely**
   - Debug API call failures in browser network tab
   - Verify endpoint responses match expected format
   - Test session ID handling

### 🟡 HIGH (After Critical Issues)
4. **Connect PostgreSQL database**
5. **Implement proper user sessions**
6. **Add more SQL problems and features**

## 🔄 Recent Changes (Last Session)
- Fixed server syntax errors causing Railway crashes
- Added complete authentication endpoints
- Implemented SendGrid email functionality  
- Added bookmarks and progress API endpoints
- Updated homepage to remove duplicate content
- Added client-side routing configuration (_redirects, vercel.json)
- Fixed package.json dependencies

## 🛠️ Technologies Used

### Frontend
- React 18, React Router v6
- Tailwind CSS, CSS Modules
- Axios for API calls
- Local storage for session management

### Backend  
- Express.js, Node.js
- bcryptjs for password hashing
- jsonwebtoken for authentication
- @sendgrid/mail for emails
- CORS, helmet for security

### Deployment
- Vercel for static frontend
- Railway for Node.js backend
- SendGrid for email delivery
- Namecheap for domain management

## 🧪 Testing & Debugging

### Local Testing
```bash
# Test backend health
curl http://localhost:5001/api/health

# Test auth endpoints
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Test bookmarks
curl http://localhost:5001/api/bookmarks/stats \
  -H "X-Session-ID: test-session"
```

### Production Testing (When Working)
```bash
# Test production backend
curl https://sql-website-production-d4d1.up.railway.app/api/health

# Test production API through Vercel proxy
curl https://datasql.pro/api/auth/test
```

## 📚 Key File Locations

### Frontend
- **Main App**: `frontend/src/App.js`
- **Homepage**: `frontend/src/pages/NewHomePage.js`
- **Reset Password**: `frontend/src/pages/ResetPasswordPage.js`
- **Bookmarks**: `frontend/src/pages/BookmarksPage.js`
- **Auth Context**: `frontend/src/contexts/AuthContext.js`
- **Environment Config**: `frontend/src/config/environment.js`

### Backend
- **Main Server**: `backend/index.js`
- **Auth Routes**: `backend/routes/auth-minimal-test.js`
- **Package**: `backend/package.json`

### Configuration
- **Vercel Config**: `vercel.json`
- **Frontend Redirects**: `frontend/public/_redirects`

---

**⚠️ CRITICAL NOTE FOR NEW SESSION**: 
The site (datasql.pro) is currently down and needs immediate attention. Start by investigating the domain/deployment issues before working on other features.

**Latest Git Commit**: Contains routing fixes and API updates that may have caused the outage.

**Priority Order**: Domain → Reset Password → Bookmarks → Other Features