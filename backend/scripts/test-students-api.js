const db = require('../config/database');

async function testStudentsAPI() {
  try {
    const [students] = await db.query(
      `SELECT s.*, u.email 
       FROM students s
       JOIN users u ON s.user_id = u.id
       ORDER BY s.class, s.section, s.roll_number
       LIMIT 10`
    );
    
    console.log(`✓ Found ${students.length} students (showing first 10):\n`);
    
    students.forEach(s => {
      console.log(`${s.student_id} - ${s.first_name} ${s.last_name}`);
      console.log(`  Email: ${s.email}`);
      console.log(`  Class ${s.class}, Section ${s.section}, Roll ${s.roll_number}\n`);
    });
    
    // Count total
    const [count] = await db.query('SELECT COUNT(*) as total FROM students');
    console.log(`\nTotal students in database: ${count[0].total}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testStudentsAPI();
