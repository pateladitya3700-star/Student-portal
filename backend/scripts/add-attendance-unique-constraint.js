const db = require('../config/database');

async function addUniqueConstraint() {
  try {
    console.log('Adding unique constraint to attendance table...');

    // Check if constraint already exists
    const [constraints] = await db.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.TABLE_CONSTRAINTS 
      WHERE TABLE_SCHEMA = 'nic_portal' 
      AND TABLE_NAME = 'attendance' 
      AND CONSTRAINT_NAME = 'unique_attendance'
    `);

    if (constraints.length > 0) {
      console.log('✓ Unique constraint already exists');
      process.exit(0);
      return;
    }

    // Add unique constraint
    await db.query(`
      ALTER TABLE attendance 
      ADD CONSTRAINT unique_attendance 
      UNIQUE KEY (student_id, course_id, date)
    `);

    console.log('✓ Unique constraint added successfully!');
    console.log('  This prevents duplicate attendance entries for the same student, course, and date.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addUniqueConstraint();
