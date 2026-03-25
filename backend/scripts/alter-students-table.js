const db = require('../config/database');

async function alterStudentsTable() {
  try {
    console.log('🔄 Altering students table to add new columns...\n');

    // Check current structure
    const [columns] = await db.query('DESCRIBE students');
    const columnNames = columns.map(col => col.Field);
    
    console.log('Current columns:', columnNames.join(', '));

    // Add guardian_name if it doesn't exist
    if (!columnNames.includes('guardian_name')) {
      console.log('\n✓ Adding guardian_name column...');
      await db.query('ALTER TABLE students ADD COLUMN guardian_name VARCHAR(200) AFTER roll_number');
    } else {
      console.log('\n✓ guardian_name column already exists');
    }

    // Add guardian_phone if it doesn't exist
    if (!columnNames.includes('guardian_phone')) {
      console.log('✓ Adding guardian_phone column...');
      await db.query('ALTER TABLE students ADD COLUMN guardian_phone VARCHAR(20) AFTER guardian_name');
    } else {
      console.log('✓ guardian_phone column already exists');
    }

    // Check if we need to change program to class
    if (columnNames.includes('program') && !columnNames.includes('class')) {
      console.log('\n⚠️  WARNING: Table still has old structure (program/semester)');
      console.log('   You need to run the full migration to convert to class/section structure');
      console.log('   This will DELETE all existing student data!');
      console.log('\n   To proceed, run: node scripts/run-full-migration.js');
    } else if (columnNames.includes('class')) {
      console.log('\n✅ Table already has new structure (class/section)');
    }

    // Show final structure
    const [finalColumns] = await db.query('DESCRIBE students');
    console.log('\n📋 Final table structure:');
    finalColumns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

alterStudentsTable();
