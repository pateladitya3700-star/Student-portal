# 🎓 National Infotech College - Student Portal

A modern, secure, role-based web portal for National Infotech College, Birgunj, Nepal.

![Status](https://img.shields.io/badge/Status-Complete-success)
![Node](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18.2-blue)
![MySQL](https://img.shields.io/badge/MySQL-8+-orange)

## 📚 Documentation Quick Links

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[QUICKSTART.md](QUICKSTART.md)** | 5-minute setup guide | Start here for fast setup |
| **[SETUP.md](SETUP.md)** | Detailed installation | For step-by-step instructions |
| **[FEATURES.md](FEATURES.md)** | Complete feature list | To understand capabilities |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Production deployment | When deploying to server |
| **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** | Technical overview | For technical details |
| **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** | Complete overview | For comprehensive understanding |
| **[CHECKLIST.md](CHECKLIST.md)** | Completion checklist | To verify implementation |

## 🚀 Quick Start

```bash
# 1. Verify setup
node verify-setup.js

# 2. Setup database
mysql -u root -p < database/schema.sql

# 3. Backend
cd backend && npm install && cp .env.example .env
# Edit .env, then:
npm run seed && npm start

# 4. Frontend (new terminal)
cd frontend && npm install && npm run dev
```

**Access:** http://localhost:5173

**Login:** student@nic.edu.np / Student@123

## Features

- **Student Portal**: View courses, attendance, results, notifications
- **Faculty Portal**: Manage classes, mark attendance, upload grades
- **Admin Portal**: Full system control, reports, bulk operations
- **User Registration**: Self-registration for students and faculty
- **Security**: JWT authentication, role-based access control, password hashing

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL
- Authentication: JWT + bcrypt

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure database in .env
npm run migrate
npm run seed
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Default Login Credentials

**Admin:**
- Email: admin@nic.edu.np
- Password: Admin@123

**Faculty:**
- Email: faculty@nic.edu.np
- Password: Faculty@123

**Student:**
- Email: student@nic.edu.np
- Password: Student@123

## Database Schema

- users (authentication)
- students (profile, enrollment)
- faculty (profile, assignments)
- courses (Science, BCA, CSIT)
- subjects (course subjects)
- attendance (tracking)
- results (grades, tests)
- notifications (announcements)

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control (RBAC)
- Protected API routes
- Session timeout
- Input validation

## Project Structure

```
backend/
├── config/         # Database & environment config
├── middleware/     # Auth & validation
├── models/         # Database models
├── routes/         # API endpoints
├── controllers/    # Business logic
└── server.js       # Entry point

frontend/
├── src/
│   ├── components/ # Reusable components
│   ├── pages/      # Dashboard pages
│   ├── services/   # API calls
│   ├── context/    # Auth context
│   └── App.jsx     # Main app
```

## API Endpoints

### Authentication
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/logout
- GET /api/auth/me

### Students
- GET /api/students/profile
- GET /api/students/courses
- GET /api/students/attendance
- GET /api/students/results

### Faculty
- GET /api/faculty/courses
- POST /api/faculty/attendance
- POST /api/faculty/grades
- POST /api/faculty/announcements

### Admin
- GET /api/admin/users
- POST /api/admin/users
- GET /api/admin/reports
- POST /api/admin/bulk-upload

## License

© 2024 National Infotech College. All rights reserved.
