const db = require('../config/database');

async function checkStudentProfile() {
  try {
    const email = process.argv[2] || 'foreveraditya18@gmail.com';
    
    console.log(`🔍 Checking profile for: ${email}\n`);
    
    // Get user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    console.log('✓ User found:');
    console.log(`   ID: ${users[0].id}`);
    console.log(`   Email: ${users[0].email}`);
    console.log(`   Role: ${users[0].role}`);
    
    // Get student profile
    const [students] = await db.query(
      'SELECT * FROM students WHERE user_id = ?',
      [users[0].id]
    );
    
    if (students.length === 0) {
      console.log('\n❌ Student profile NOT found!');
      console.log('   This user has no student record in the database.');
      console.log('   The registration may have failed partway through.');
      process.exit(1);
    }
    
    console.log('\n✓ Student profile found:');
    console.log(students[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkStudentProfile();
