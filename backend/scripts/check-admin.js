const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function checkAdmin() {
  try {
    console.log('🔍 Checking Admin Account...\n');

    // Check if admin exists
    const [admins] = await db.query('SELECT id, email, role, is_active FROM users WHERE role = ?', ['admin']);
    
    if (admins.length === 0) {
      console.log('❌ No admin account found in database!');
      console.log('\n📝 Creating admin account...');
      
      // Create admin account
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await db.query(
        'INSERT INTO users (email, password, role, is_active) VALUES (?, ?, ?, ?)',
        ['admin@nic.edu.np', hashedPassword, 'admin', true]
      );
      
      console.log('✅ Admin account created successfully!');
      console.log('\n📋 Admin Credentials:');
      console.log('   Email: admin@nic.edu.np');
      console.log('   Password: Admin@123');
    } else {
      console.log('✅ Admin account found!');
      console.log('\n📋 Admin Details:');
      admins.forEach(admin => {
        console.log(`   ID: ${admin.id}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Status: ${admin.is_active ? 'Active' : 'Inactive'}`);
      });

      // Check password
      const [user] = await db.query('SELECT password FROM users WHERE email = ?', ['admin@nic.edu.np']);
      if (user.length > 0) {
        const isValidPassword = await bcrypt.compare('Admin@123', user[0].password);
        console.log(`\n🔑 Password Check:`);
        console.log(`   Password "Admin@123" is ${isValidPassword ? '✅ CORRECT' : '❌ INCORRECT'}`);
        
        if (!isValidPassword) {
          console.log('\n🔧 Resetting admin password...');
          const hashedPassword = await bcrypt.hash('Admin@123', 10);
          await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'admin@nic.edu.np']);
          console.log('✅ Password reset to: Admin@123');
        }
      }

      // Check if active
      if (!admins[0].is_active) {
        console.log('\n⚠️  Admin account is INACTIVE!');
        console.log('🔧 Activating admin account...');
        await db.query('UPDATE users SET is_active = ? WHERE email = ?', [true, 'admin@nic.edu.np']);
        console.log('✅ Admin account activated!');
      }
    }

    console.log('\n✅ Admin account is ready to use!');
    console.log('\n📋 Login Credentials:');
    console.log('   Email: admin@nic.edu.np');
    console.log('   Password: Admin@123');
    console.log('\n🌐 Login URL: http://localhost:5173/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAdmin();
