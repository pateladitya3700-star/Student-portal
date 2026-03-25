# 🚀 Quick Start Guide
## National Infotech College - Student Portal

Get the portal running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js (need v18+)
node --version

# Check MySQL (need v8+)
mysql --version

# Check npm
npm --version
```

If any are missing, install them first.

## Step 1: Database Setup (2 minutes)

```bash
# Start MySQL and create database
mysql -u root -p

# In MySQL prompt, run:
CREATE DATABASE nic_portal;
exit;

# Import schema
mysql -u root -p nic_portal < database/schema.sql
```

## Step 2: Backend Setup (1 minute)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Edit backend/.env:**
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=nic_portal
JWT_SECRET=change_this_to_random_string_in_production
```

```bash
# Seed database with sample data
npm run seed

# Start backend
npm start
```

✅ Backend running at http://localhost:5000

## Step 3: Frontend Setup (1 minute)

**Open a NEW terminal:**

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

✅ Frontend running at http://localhost:5173

## Step 4: Login & Test (1 minute)

Open browser: **http://localhost:5173**

### Test Accounts:

**Student Login:**
- Email: `student@nic.edu.np`
- Password: `Student@123`

**Faculty Login:**
- Email: `faculty@nic.edu.np`
- Password: `Faculty@123`

**Admin Login:**
- Email: `admin@nic.edu.np`
- Password: `Admin@123`

## What You'll See

### Student Dashboard
- Attendance: 66.67% (2/3 classes)
- Enrolled Courses: 2 (BCA courses)
- Recent test results
- Notifications

### Faculty Dashboard
- Assigned courses: 2
- Total students: 1
- Course management
- Attendance & grade upload

### Admin Dashboard
- System statistics
- User management
- Reports & analytics

## Troubleshooting

### "Cannot connect to database"
```bash
# Check MySQL is running
# Windows:
net start MySQL80

# Verify credentials in backend/.env
```

### "Port 5000 already in use"
```bash
# Change PORT in backend/.env to 5001
PORT=5001
```

### "Port 5173 already in use"
```bash
# Vite will automatically suggest another port
# Or edit frontend/vite.config.js
```

### "Module not found"
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Project Structure

```
student-portal/
├── backend/          # API Server (Port 5000)
│   ├── config/       # Database connection
│   ├── controllers/  # Business logic
│   ├── middleware/   # Auth & validation
│   ├── routes/       # API endpoints
│   └── server.js     # Entry point
│
├── frontend/         # React App (Port 5173)
│   ├── src/
│   │   ├── pages/    # Dashboard pages
│   │   ├── context/  # Auth context
│   │   └── services/ # API calls
│   └── index.html
│
└── database/         # SQL files
    ├── schema.sql    # Database structure
    └── seed.sql      # Sample data
```

## Next Steps

1. ✅ Explore student dashboard
2. ✅ Test faculty features
3. ✅ Check admin panel
4. ✅ Review attendance tracking
5. ✅ View results & grades
6. ✅ Test notifications

## Development Tips

### Backend Development
```bash
cd backend
npm run dev  # Auto-restart on changes (if nodemon installed)
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot reload enabled
```

### View API Health
```bash
curl http://localhost:5000/health
# Should return: {"status":"OK","message":"NIC Portal API is running"}
```

## Common Tasks

### Add New Student
1. Login as Admin
2. Go to Users tab
3. Click "Create User"
4. Fill student details
5. Submit

### Mark Attendance
1. Login as Faculty
2. Go to "Mark Attendance"
3. Select course
4. Mark present/absent
5. Submit

### View Results
1. Login as Student
2. Go to "Results" tab
3. View all test scores
4. Check percentage

## Production Deployment

### Backend
```bash
cd backend
npm install --production
NODE_ENV=production npm start
```

### Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder to web server
```

## Security Checklist

- [ ] Change default passwords
- [ ] Update JWT_SECRET in .env
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Use strong MySQL password
- [ ] Restrict database access

## Need Help?

📖 **Full Documentation:**
- README.md - Overview
- SETUP.md - Detailed setup
- FEATURES.md - Feature list
- PROJECT_SUMMARY.md - Complete summary

🐛 **Common Issues:**
- Check MySQL is running
- Verify .env configuration
- Ensure ports are available
- Check Node.js version

## Success Indicators

✅ Backend responds at http://localhost:5000/health
✅ Frontend loads at http://localhost:5173
✅ Can login with demo credentials
✅ Dashboard displays correctly
✅ Data loads from database

---

**You're all set! 🎉**

The portal is now running. Login and explore the features!
