const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const facultyData = [
  // Physics Department
  {
    email: 'rajesh.sharma@nic.edu',
    facultyId: 'FAC001',
    firstName: 'Rajesh',
    lastName: 'Sharma',
    phone: '9841234567',
    department: 'Physics',
    specialization: 'Mechanics and Thermodynamics'
  },
  {
    email: 'priya.patel@nic.edu',
    facultyId: 'FAC002',
    firstName: 'Priya',
    lastName: 'Patel',
    phone: '9841234568',
    department: 'Physics',
    specialization: 'Optics and Modern Physics'
  },
  
  // Chemistry Department
  {
    email: 'amit.kumar@nic.edu',
    facultyId: 'FAC003',
    firstName: 'Amit',
    lastName: 'Kumar',
    phone: '9841234569',
    department: 'Chemistry',
    specialization: 'Organic Chemistry'
  },
  {
    email: 'sneha.gupta@nic.edu',
    facultyId: 'FAC004',
    firstName: 'Sneha',
    lastName: 'Gupta',
    phone: '9841234570',
    department: 'Chemistry',
    specialization: 'Inorganic and Physical Chemistry'
  },
  
  // Biology Department
  {
    email: 'vikram.singh@nic.edu',
    facultyId: 'FAC005',
    firstName: 'Vikram',
    lastName: 'Singh',
    phone: '9841234571',
    department: 'Biology',
    specialization: 'Botany and Plant Sciences'
  },
  {
    email: 'anjali.verma@nic.edu',
    facultyId: 'FAC006',
    firstName: 'Anjali',
    lastName: 'Verma',
    phone: '9841234572',
    department: 'Biology',
    specialization: 'Zoology and Human Biology'
  },
  
  // Mathematics Department
  {
    email: 'suresh.yadav@nic.edu',
    facultyId: 'FAC007',
    firstName: 'Suresh',
    lastName: 'Yadav',
    phone: '9841234573',
    department: 'Mathematics',
    specialization: 'Calculus and Algebra'
  },
  {
    email: 'kavita.joshi@nic.edu',
    facultyId: 'FAC008',
    firstName: 'Kavita',
    lastName: 'Joshi',
    phone: '9841234574',
    department: 'Mathematics',
    specialization: 'Statistics and Probability'
  },
  
  // Computer Science Department
  {
    email: 'rahul.mehta@nic.edu',
    facultyId: 'FAC009',
    firstName: 'Rahul',
    lastName: 'Mehta',
    phone: '9841234575',
    department: 'Computer Science',
    specialization: 'Programming and Data Structures'
  },
  {
    email: 'pooja.reddy@nic.edu',
    facultyId: 'FAC010',
    firstName: 'Pooja',
    lastName: 'Reddy',
    phone: '9841234576',
    department: 'Computer Science',
    specialization: 'Database and Web Technologies'
  },
  
  // English Department
  {
    email: 'deepak.thapa@nic.edu',
    facultyId: 'FAC011',
    firstName: 'Deepak',
    lastName: 'Thapa',
    phone: '9841234577',
    department: 'English',
    specialization: 'Literature and Communication'
  },
  {
    email: 'meera.shah@nic.edu',
    facultyId: 'FAC012',
    firstName: 'Meera',
    lastName: 'Shah',
    phone: '9841234578',
    department: 'English',
    specialization: 'Grammar and Composition'
  },
  
  // Nepali Department
  {
    email: 'binod.karki@nic.edu',
    facultyId: 'FAC013',
    firstName: 'Binod',
    lastName: 'Karki',
    phone: '9841234579',
    department: 'Nepali',
    specialization: 'Nepali Literature and Language'
  },
  
  // Physical Education
  {
    email: 'sanjay.tamang@nic.edu',
    facultyId: 'FAC014',
    firstName: 'Sanjay',
    lastName: 'Tamang',
    phone: '9841234580',
    department: 'Physical Education',
    specialization: 'Sports and Fitness'
  }
];

async function generateFaculty() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nic_portal'
    });

    console.log('Connected to database');
    console.log('Generating 14 faculty members...\n');

    // Default password for all faculty
    const defaultPassword = '123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    let successCount = 0;
    let skipCount = 0;

    for (const faculty of facultyData) {
      try {
        // Check if email already exists
        const [existingUsers] = await connection.query(
          'SELECT id FROM users WHERE email = ?',
          [faculty.email]
        );

        if (existingUsers.length > 0) {
          console.log(`⚠️  Skipped: ${faculty.email} (already exists)`);
          skipCount++;
          continue;
        }

        // Check if faculty ID already exists
        const [existingFaculty] = await connection.query(
          'SELECT id FROM faculty WHERE faculty_id = ?',
          [faculty.facultyId]
        );

        if (existingFaculty.length > 0) {
          console.log(`⚠️  Skipped: ${faculty.facultyId} (ID already exists)`);
          skipCount++;
          continue;
        }

        // Insert user
        const [userResult] = await connection.query(
          'INSERT INTO users (email, password, role, is_active) VALUES (?, ?, ?, ?)',
          [faculty.email, hashedPassword, 'faculty', true]
        );

        const userId = userResult.insertId;

        // Insert faculty profile
        await connection.query(
          `INSERT INTO faculty (user_id, faculty_id, first_name, last_name, phone, department, specialization)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            faculty.facultyId,
            faculty.firstName,
            faculty.lastName,
            faculty.phone,
            faculty.department,
            faculty.specialization
          ]
        );

        console.log(`✅ Created: ${faculty.firstName} ${faculty.lastName} (${faculty.email}) - ${faculty.department}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Error creating ${faculty.email}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('FACULTY GENERATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Successfully created: ${successCount} faculty`);
    console.log(`⚠️  Skipped (already exist): ${skipCount} faculty`);
    console.log(`📊 Total processed: ${facultyData.length} faculty`);
    console.log('\n📋 FACULTY CREDENTIALS:');
    console.log('   Email: [faculty email from list above]');
    console.log('   Password: 123456 (for all faculty)');
    console.log('\n📚 DEPARTMENTS:');
    console.log('   - Physics (2 faculty)');
    console.log('   - Chemistry (2 faculty)');
    console.log('   - Biology (2 faculty)');
    console.log('   - Mathematics (2 faculty)');
    console.log('   - Computer Science (2 faculty)');
    console.log('   - English (2 faculty)');
    console.log('   - Nepali (1 faculty)');
    console.log('   - Physical Education (1 faculty)');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

// Run the script
generateFaculty();
