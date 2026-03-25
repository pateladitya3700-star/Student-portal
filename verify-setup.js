#!/usr/bin/env node

/**
 * Setup Verification Script
 * National Infotech College - Student Portal
 * 
 * Run this script to verify your setup is correct
 * Usage: node verify-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 National Infotech College Portal - Setup Verification\n');
console.log('=' .repeat(60));

let errors = 0;
let warnings = 0;

// Check Node.js version
console.log('\n📦 Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 18) {
  console.log(`✅ Node.js ${nodeVersion} (OK)`);
} else {
  console.log(`❌ Node.js ${nodeVersion} (Need v18 or higher)`);
  errors++;
}

// Check required directories
console.log('\n📁 Checking project structure...');
const requiredDirs = [
  'backend',
  'backend/config',
  'backend/controllers',
  'backend/middleware',
  'backend/routes',
  'backend/scripts',
  'frontend',
  'frontend/src',
  'frontend/src/pages',
  'frontend/src/context',
  'frontend/src/services',
  'database'
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`❌ ${dir}/ (Missing)`);
    errors++;
  }
});

// Check required backend files
console.log('\n📄 Checking backend files...');
const backendFiles = [
  'backend/package.json',
  'backend/server.js',
  'backend/.env.example',
  'backend/config/database.js',
  'backend/middleware/auth.js',
  'backend/controllers/authController.js',
  'backend/controllers/studentController.js',
  'backend/controllers/facultyController.js',
  'backend/controllers/adminController.js',
  'backend/routes/auth.js',
  'backend/routes/student.js',
  'backend/routes/faculty.js',
  'backend/routes/admin.js',
  'backend/scripts/seed.js'
];

backendFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} (Missing)`);
    errors++;
  }
});

// Check required frontend files
console.log('\n📄 Checking frontend files...');
const frontendFiles = [
  'frontend/package.json',
  'frontend/index.html',
  'frontend/vite.config.js',
  'frontend/src/main.jsx',
  'frontend/src/App.jsx',
  'frontend/src/index.css',
  'frontend/src/context/AuthContext.jsx',
  'frontend/src/services/api.js',
  'frontend/src/pages/Landing.jsx',
  'frontend/src/pages/Login.jsx',
  'frontend/src/pages/StudentDashboard.jsx',
  'frontend/src/pages/FacultyDashboard.jsx',
  'frontend/src/pages/AdminDashboard.jsx'
];

frontendFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} (Missing)`);
    errors++;
  }
});

// Check database files
console.log('\n📄 Checking database files...');
const dbFiles = [
  'database/schema.sql',
  'database/seed.sql'
];

dbFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} (Missing)`);
    errors++;
  }
});

// Check documentation files
console.log('\n📄 Checking documentation...');
const docFiles = [
  'README.md',
  'SETUP.md',
  'FEATURES.md',
  'PROJECT_SUMMARY.md',
  'QUICKSTART.md',
  '.gitignore'
];

docFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} (Missing)`);
    errors++;
  }
});

// Check .env file
console.log('\n⚙️  Checking configuration...');
if (fs.existsSync('backend/.env')) {
  console.log('✅ backend/.env exists');
  const envContent = fs.readFileSync('backend/.env', 'utf8');
  
  const requiredEnvVars = [
    'PORT',
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET'
  ];
  
  requiredEnvVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`  ✅ ${varName} configured`);
    } else {
      console.log(`  ⚠️  ${varName} missing`);
      warnings++;
    }
  });
} else {
  console.log('⚠️  backend/.env not found (copy from .env.example)');
  warnings++;
}

// Check node_modules
console.log('\n📦 Checking dependencies...');
if (fs.existsSync('backend/node_modules')) {
  console.log('✅ Backend dependencies installed');
} else {
  console.log('⚠️  Backend dependencies not installed (run: cd backend && npm install)');
  warnings++;
}

if (fs.existsSync('frontend/node_modules')) {
  console.log('✅ Frontend dependencies installed');
} else {
  console.log('⚠️  Frontend dependencies not installed (run: cd frontend && npm install)');
  warnings++;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 Verification Summary:\n');

if (errors === 0 && warnings === 0) {
  console.log('🎉 Perfect! Your setup is complete and ready to go!\n');
  console.log('Next steps:');
  console.log('1. Setup database: mysql -u root -p < database/schema.sql');
  console.log('2. Configure backend/.env with your database credentials');
  console.log('3. Seed database: cd backend && npm run seed');
  console.log('4. Start backend: cd backend && npm start');
  console.log('5. Start frontend: cd frontend && npm run dev');
  console.log('\nSee QUICKSTART.md for detailed instructions.');
} else {
  if (errors > 0) {
    console.log(`❌ Found ${errors} error(s) - Please fix these issues`);
  }
  if (warnings > 0) {
    console.log(`⚠️  Found ${warnings} warning(s) - These should be addressed`);
  }
  console.log('\nRefer to SETUP.md for detailed setup instructions.');
}

console.log('\n' + '='.repeat(60) + '\n');

process.exit(errors > 0 ? 1 : 0);
