const db = require('../config/database');

async function checkCourses() {
  try {
    const [cols] = await db.query('DESCRIBE courses');
    console.log('📚 Courses table structure:');
    cols.forEach(c => console.log(`   ${c.Field}: ${c.Type}`));
    
    const [courses] = await db.query('SELECT * FROM courses ORDER BY class, name');
    console.log(`\n✓ Total courses: ${courses.length}`);
    
    if (courses.length > 0) {
      console.log('\n📋 Courses list:');
      courses.forEach(c => {
        console.log(`   ${c.code} - ${c.name} (Class ${c.class})`);
      });
    } else {
      console.log('\n⚠️  No courses found. Run: node scripts/seed.js');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCourses();
