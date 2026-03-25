const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Hash passwords
    const adminPass = await bcrypt.hash('Admin@123', 10);
    const facultyPass = await bcrypt.hash('Faculty@123', 10);
    const studentPass = await bcrypt.hash('Student@123', 10);

    // Clear existing data (in correct order due to foreign keys)
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('TRUNCATE TABLE notifications');
    await db.query('TRUNCATE TABLE results');
    await db.query('TRUNCATE TABLE attendance');
    await db.query('TRUNCATE TABLE enrollments');
    await db.query('TRUNCATE TABLE subjects');
    await db.query('TRUNCATE TABLE courses');
    await db.query('TRUNCATE TABLE students');
    await db.query('TRUNCATE TABLE faculty');
    await db.query('TRUNCATE TABLE users');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✓ Cleared existing data');

    // Insert users
    const [users] = await db.query(
      `INSERT INTO users (email, password, role) VALUES 
       ('admin@nic.edu.np', ?, 'admin'),
       ('faculty@nic.edu.np', ?, 'faculty'),
       ('student@nic.edu.np', ?, 'student')`,
      [adminPass, facultyPass, studentPass]
    );

    console.log('✓ Users created');

    // Insert faculty
    await db.query(
      `INSERT INTO faculty (user_id, faculty_id, first_name, last_name, phone, department, specialization)
       VALUES (2, 'FAC001', 'Rajesh', 'Sharma', '9841234567', 'Computer Science', 'Data Structures')`
    );

    // Insert student
    await db.query(
      `INSERT INTO students (user_id, student_id, first_name, last_name, phone, address, class, section, roll_number, guardian_name, guardian_phone, enrollment_date)
       VALUES (3, 'NIC11A01', 'Sita', 'Thapa', '9851234567', 'Birgunj-10', '11', 'A', 1, 'Ram Bahadur Thapa', '9841111111', '2024-01-15')`
    );

    console.log('✓ Profiles created');

    // Insert courses for Class 11 and 12
    await db.query(`
      INSERT INTO courses (code, name, class, credits, description) VALUES
      ('PHY11', 'Physics', '11', 4, 'Mechanics and Thermodynamics'),
      ('CHEM11', 'Chemistry', '11', 4, 'Physical and Inorganic Chemistry'),
      ('BIO11', 'Biology', '11', 4, 'Cell Biology and Genetics'),
      ('MATH11', 'Mathematics', '11', 5, 'Calculus and Algebra'),
      ('CS11', 'Computer Science', '11', 3, 'Introduction to Programming'),
      ('ENG11', 'English', '11', 3, 'English Language and Literature'),
      ('NEP11', 'Nepali', '11', 3, 'Nepali Language and Literature'),
      ('PHY12', 'Physics', '12', 4, 'Electromagnetism and Modern Physics'),
      ('CHEM12', 'Chemistry', '12', 4, 'Organic and Physical Chemistry'),
      ('BIO12', 'Biology', '12', 4, 'Genetics and Evolution'),
      ('MATH12', 'Mathematics', '12', 5, 'Advanced Calculus and Statistics'),
      ('CS12', 'Computer Science', '12', 3, 'Data Structures and Algorithms'),
      ('ENG12', 'English', '12', 3, 'Advanced English'),
      ('NEP12', 'Nepali', '12', 3, 'Advanced Nepali')
    `);

    console.log('✓ Courses created');

    // Assign subjects
    await db.query(`
      INSERT INTO subjects (course_id, faculty_id, academic_year) VALUES
      (1, 1, '2024'), (2, 1, '2024')
    `);

    // Enroll student
    await db.query(`
      INSERT INTO enrollments (student_id, subject_id, enrollment_date) VALUES
      (1, 1, '2024-01-15'), (1, 2, '2024-01-15')
    `);

    console.log('✓ Enrollments created');

    // Sample attendance
    await db.query(`
      INSERT INTO attendance (student_id, subject_id, date, status, marked_by) VALUES
      (1, 1, '2024-01-20', 'present', 1),
      (1, 1, '2024-01-21', 'present', 1),
      (1, 1, '2024-01-22', 'absent', 1)
    `);

    // Sample results
    await db.query(`
      INSERT INTO results (student_id, subject_id, exam_type, exam_date, marks_obtained, total_marks, uploaded_by) VALUES
      (1, 1, 'weekly_test', '2024-01-25', 18, 20, 1)
    `);

    console.log('✓ Sample data created');

    // Notifications
    await db.query(`
      INSERT INTO notifications (title, message, type, target_role, created_by) VALUES
      ('Welcome to NIC Portal', 'Welcome to National Infotech College Student Portal', 'announcement', 'all', 1)
    `);

    console.log('✓ Notifications created');
    console.log('\n✅ Database seeded successfully!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
