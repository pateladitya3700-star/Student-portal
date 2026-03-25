const db = require('../config/database');

async function createStudentProfile() {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.log('Usage: node scripts/create-student-profile.js <email>');
      process.exit(1);
    }
    
    console.log(`🔍 Looking for user: ${email}`);
    
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    const userId = users[0].id;
    console.log(`✓ User found (ID: ${userId})`);
    
    // Check if student profile already exists
    const [existing] = await db.query('SELECT id FROM students WHERE user_id = ?', [userId]);
    
    if (existing.length > 0) {
      console.log('❌ Student profile already exists!');
      process.exit(1);
    }
    
    console.log('\n📝 Creating student profile...');
    
    // Create student profile with the data from the registration attempt
    const studentData = {
      user_id: userId,
      student_id: 'NEB1', // From the error log
      first_name: 'Aditya',
      last_name: 'Patel',
      phone: '7296045564',
      address: 'birgunj',
      class: '12',
      section: 'A',
      roll_number: 21,
      guardian_name: 'Abv Patel',
      guardian_phone: '1234569871',
      enrollment_date: '2026-03-22'
    };
    
    await db.query(
      `INSERT INTO students (user_id, student_id, first_name, last_name, phone, address, 
                             class, section, roll_number, guardian_name, guardian_phone, enrollment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentData.user_id,
        studentData.student_id,
        studentData.first_name,
        studentData.last_name,
        studentData.phone,
        studentData.address,
        studentData.class,
        studentData.section,
        studentData.roll_number,
        studentData.guardian_name,
        studentData.guardian_phone,
        studentData.enrollment_date
      ]
    );
    
    console.log('✅ Student profile created successfully!');
    console.log('\n📋 Profile details:');
    console.log(`   Name: ${studentData.first_name} ${studentData.last_name}`);
    console.log(`   Student ID: ${studentData.student_id}`);
    console.log(`   Class: ${studentData.class}, Section: ${studentData.section}, Roll: ${studentData.roll_number}`);
    console.log(`   Guardian: ${studentData.guardian_name} (${studentData.guardian_phone})`);
    console.log('\nYou can now login and see your profile!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createStudentProfile();
