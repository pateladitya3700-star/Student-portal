const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function resetAllStudentPasswords() {
  try {
    console.log('🔐 Resetting all student passwords...\n');

    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update all users with role 'student'
    const [result] = await db.query(
      'UPDATE users SET password = ? WHERE role = ?',
      [hashedPassword, 'student']
    );

    console.log(`✅ Updated ${result.affectedRows} student passwords`);
    console.log(`\n🔑 New password for ALL students: ${newPassword}`);
    console.log('\nAll students can now login with password: 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAllStudentPasswords();
