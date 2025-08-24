# SQL Practice Website - Project Overview

This directory contains the complete SQL Practice Platform project with organized structure.

## 🚀 **MAIN PROJECT** (Production Ready)

### [`sql-practice-platform/`](sql-practice-platform/)
**The complete, production-ready SQL learning platform**

- ✅ **Status**: Production Ready
- ✅ **Problems**: 70 comprehensive SQL challenges  
- ✅ **Database Support**: PostgreSQL & MySQL (100% compatibility)
- ✅ **Validation Coverage**: 100% (140/140 schemas with expected outputs)
- ✅ **Security**: Enterprise-grade query validation and sandboxing
- ✅ **Documentation**: Comprehensive README with all setup instructions

**Quick Start:**
```bash
cd sql-practice-platform/
docker-compose up -d
cd backend && npm start
cd ../frontend && npm start
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- Health Monitor: http://localhost:5001/api/monitor/health

---

## 📁 **ARCHIVED FILES**

All development history, legacy code, and experimental files have been organized in the `archive/` directory:

### [`archive/legacy-backend/`](archive/legacy-backend/)
- Previous version of the backend system
- Contains the old backend architecture and scripts used during development

### [`archive/development-scripts/`](archive/development-scripts/)  
- All development, debugging, and fixing scripts
- Python scripts for problem validation and fixes
- Shell scripts for batch operations
- JavaScript utilities for testing and maintenance
- Package files from development iterations

### [`archive/old-documentation/`](archive/old-documentation/)
- Development notes and progress tracking
- Fix summaries and validation reports  
- Setup instructions from various development phases
- Problem validation reports and logs

### [`archive/old-projects/`](archive/old-projects/)
- `sql-practice-problems/` - Earlier problem definitions
- `sql-website/` - Previous website iterations

### [`archive/backups/`](archive/backups/)
- Project backups from various development stages
- `sql-practice-platform-backup-20250821_220758.tar.gz`

---

## 🎯 **For Production Use**

**Use ONLY**: [`sql-practice-platform/`](sql-practice-platform/)

This is the final, production-ready version with:
- Clean, organized codebase
- Comprehensive documentation  
- All 70 problems working perfectly
- Enterprise security and monitoring
- Dual database support (PostgreSQL & MySQL)
- Complete API documentation

---

## 🗂️ **Directory Structure**

```
SQL_practice_website/
├── README.md                    ← This overview file
├── sql-practice-platform/       ← 🚀 MAIN PRODUCTION PROJECT
│   ├── README.md               ← Comprehensive project documentation
│   ├── backend/                ← Node.js API server
│   ├── frontend/               ← React.js web application  
│   ├── database/               ← Database schemas & migrations
│   └── docker-compose.yml      ← Docker orchestration
└── archive/                    ← Development history & legacy files
    ├── legacy-backend/         ← Previous backend versions
    ├── development-scripts/    ← All dev/debug/fix scripts  
    ├── old-documentation/      ← Development notes & reports
    ├── old-projects/           ← Previous project iterations
    └── backups/                ← Project backups
```

---

## 🚀 **Next Steps**

1. **For Development**: Work with `sql-practice-platform/`
2. **For Deployment**: Use `sql-practice-platform/` only
3. **For Reference**: Check archived files if needed
4. **For Documentation**: See `sql-practice-platform/README.md`

The platform is ready for production deployment! 🎉