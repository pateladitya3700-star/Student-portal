const db = require('../config/database');

async function updateResultsTable() {
  try {
    console.log('Updating results table...');

    // Check if columns exist
    const [columns] = await db.query('DESCRIBE results');
    const columnNames = columns.map(c => c.Field);

    // Add term column if it doesn't exist
    if (!columnNames.includes('term')) {
      await db.query(`
        ALTER TABLE results 
        ADD COLUMN term VARCHAR(20) AFTER course_id
      `);
      console.log('✓ Added term column');
    }

    // Add percentage column if it doesn't exist
    if (!columnNames.includes('percentage')) {
      await db.query(`
        ALTER TABLE results 
        ADD COLUMN percentage DECIMAL(5,2) AFTER total_marks
      `);
      console.log('✓ Added percentage column');
    }

    // Add grade column if it doesn't exist
    if (!columnNames.includes('grade')) {
      await db.query(`
        ALTER TABLE results 
        ADD COLUMN grade VARCHAR(5) AFTER percentage
      `);
      console.log('✓ Added grade column');
    }

    // Add unique constraint
    const [constraints] = await db.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.TABLE_CONSTRAINTS 
      WHERE TABLE_SCHEMA = 'nic_portal' 
      AND TABLE_NAME = 'results' 
      AND CONSTRAINT_NAME = 'unique_result'
    `);

    if (constraints.length === 0) {
      await db.query(`
        ALTER TABLE results 
        ADD CONSTRAINT unique_result 
        UNIQUE KEY (student_id, course_id, term)
      `);
      console.log('✓ Added unique constraint');
    }

    console.log('\n✓ Results table updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateResultsTable();
