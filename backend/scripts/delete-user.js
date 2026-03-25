const db = require('../config/database');

async function deleteUser() {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.log('Usage: node scripts/delete-user.js <email>');
      console.log('Example: node scripts/delete-user.js foreveraditya18@gmail.com');
      process.exit(1);
    }

    console.log(`🔍 Looking for user: ${email}`);
    
    const [users] = await db.query('SELECT id, email, role FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log(`✓ Found user:`, users[0]);
    console.log(`\n🗑️  Deleting user...`);
    
    await db.query('DELETE FROM users WHERE email = ?', [email]);
    
    console.log('✅ User deleted successfully!');
    console.log('You can now register with this email again.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteUser();
