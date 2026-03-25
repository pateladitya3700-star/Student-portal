const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

console.log('🔄 MySQL to PostgreSQL Data Import\n');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function importData() {
  const client = await pool.connect();
  
  try {
    console.log('✅ Connected to Supabase\n');
    
    // First, run the PostgreSQL schema
    console.log('📋 Creating tables...');
    const schema = fs.readFileSync('../database/schema-postgresql.sql', 'utf8');
    await client.query(schema);
    console.log('✅ Tables created\n');
    
    // Now import sample data
    console.log('📥 Importing sample data...\n');
    
    // 1. Create admin user
    console.log('Creating admin user...');
    await client.query(`
      INSERT INTO users (email, password, role) 
      VALUES ('admin@college.edu', '$2a$10$YourHashedPasswordHere', 'admin')
      ON CONFLICT (email) DO NOTHING
    `);
    
    // 2. Create sample student
    console.log('Creating sample student...');
    const userResult = await client.query(`
      INSERT INTO users (email, password, role) 
      VALUES ('student@college.edu', '$2a$10$YourHashedPasswordHere', 'student')
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `);
    
    if (userResult.rows.length > 0) {
      await client.query(`
        INSERT INTO students (user_id, student_id, first_name, last_name, phone, address, class, section, roll_number, guardian_name, guardian_phone, enrollment_date)
        VALUES ($1, 'STU001', 'John', 'Doe', '1234567890', '123 Main St', '11', 'A', 1, 'Jane Doe', '0987654321', '2024-01-01')
        ON CONFLICT (student_id) DO NOTHING
      `, [userResult.rows[0].id]);
    }
    
    // 3. Create sample faculty
    console.log('Creating sample faculty...');
    const facultyUserResult = await client.query(`
      INSERT INTO users (email, password, role) 
      VALUES ('faculty@college.edu', '$2a$10$YourHashedPasswordHere', 'faculty')
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `);
    
    if (facultyUserResult.rows.length > 0) {
      await client.query(`
        INSERT INTO faculty (user_id, faculty_id, first_name, last_name, phone, department, specialization)
        VALUES ($1, 'FAC001', 'Dr. Smith', 'Johnson', '1112223333', 'Computer Science', 'AI & ML')
        ON CONFLICT (faculty_id) DO NOTHING
      `, [facultyUserResult.rows[0].id]);
    }
    
    // 4. Create sample courses
    console.log('Creating sample courses...');
    await client.query(`
      INSERT INTO courses (code, name, class, credits, description) VALUES
      ('CS101', 'Computer Science', '11', 4, 'Introduction to Computer Science'),
      ('MATH101', 'Mathematics', '11', 4, 'Advanced Mathematics'),
      ('PHY101', 'Physics', '11', 4, 'Physics Fundamentals'),
      ('CHEM101', 'Chemistry', '11', 4, 'Chemistry Basics'),
      ('ENG101', 'English', '11', 3, 'English Literature'),
      ('CS201', 'Advanced CS', '12', 4, 'Advanced Computer Science'),
      ('MATH201', 'Calculus', '12', 4, 'Calculus and Analysis')
      ON CONFLICT (code) DO NOTHING
    `);
    
    console.log('\n✅ Sample data imported successfully!\n');
    
    // Show summary
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM students) as students,
        (SELECT COUNT(*) FROM faculty) as faculty,
        (SELECT COUNT(*) FROM courses) as courses
    `);
    
    console.log('📊 Database Summary:');
    console.log('- Users:', counts.rows[0].users);
    console.log('- Students:', counts.rows[0].students);
    console.log('- Faculty:', counts.rows[0].faculty);
    console.log('- Courses:', counts.rows[0].courses);
    console.log('');
    
    console.log('🎉 Import complete!');
    console.log('');
    console.log('Default credentials:');
    console.log('- Admin: admin@college.edu / admin123');
    console.log('- Student: student@college.edu / student123');
    console.log('- Faculty: faculty@college.edu / faculty123');
    console.log('');
    console.log('Next: npm start');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

importData();
