const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function resetPassword() {
  try {
    const email = process.argv[2];
    const newPassword = process.argv[3];
    
    if (!email || !newPassword) {
      console.log('Usage: node scripts/reset-password.js <email> <new-password>');
      console.log('Example: node scripts/reset-password.js foreveraditya18@gmail.com MyNewPass123');
      process.exit(1);
    }

    console.log(`🔍 Looking for user: ${email}`);
    
    const [users] = await db.query('SELECT id, email, role FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log(`✓ Found user:`, users[0]);
    console.log(`\n🔐 Resetting password...`);
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
    
    console.log('✅ Password reset successfully!');
    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 New Password: ${newPassword}`);
    console.log('\nYou can now login with these credentials.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
