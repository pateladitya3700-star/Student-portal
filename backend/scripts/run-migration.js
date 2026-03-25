const fs = require('fs');
const db = require('../config/database');

async function runMigration() {
  try {
    console.log('🔄 Running database migration...\n');

    // Read the migration SQL file
    const migrationSQL = fs.readFileSync('../database/migrate-to-class-system.sql', 'utf8');
    
    // Split by semicolons and filter out empty statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        await db.query(statement);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Verifying migration...');
    
    // Verify the migration
    const [students] = await db.query('DESCRIBE students');
    console.log('\n✓ Students table structure:');
    students.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });

    const [courses] = await db.query('SELECT COUNT(*) as count FROM courses');
    console.log(`\n✓ Courses created: ${courses[0].count}`);

    console.log('\n🎉 Migration successful! You can now run:');
    console.log('   node scripts/generate-students.js');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

runMigration();
