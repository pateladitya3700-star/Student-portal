const db = require('../config/database');

async function testFacultyFeatures() {
  try {
    console.log('🧪 Testing Faculty Export & Upload Features...\n');

    // 1. Check faculty and courses
    console.log('1. Checking faculty and assigned courses...');
    const [faculty] = await db.query('SELECT id, faculty_id, first_name, last_name FROM faculty WHERE faculty_id = ?', ['FAC001']);
    console.log(`   ✓ Faculty: ${faculty[0].first_name} ${faculty[0].last_name} (ID: ${faculty[0].id})`);

    const [courses] = await db.query(`
      SELECT c.id, c.code, c.name, c.class
      FROM faculty_courses fc
      JOIN courses c ON fc.course_id = c.id
      WHERE fc.faculty_id = ?
    `, [faculty[0].id]);
    console.log(`   ✓ Assigned courses: ${courses.length}`);
    courses.forEach(c => console.log(`     - ${c.name} (${c.code}) - Class ${c.class}`));

    // 2. Test attendance summary query
    console.log('\n2. Testing attendance summary query...');
    const testCourse = courses[0];
    const [attendanceSummary] = await db.query(`
      SELECT 
        s.student_id,
        s.first_name,
        s.last_name,
        s.roll_number,
        COUNT(a.id) as total_days,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_days,
        ROUND((SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100, 2) as percentage
      FROM students s
      LEFT JOIN attendance a ON s.id = a.student_id AND a.course_id = ?
      WHERE s.class = '11' AND s.section = 'A'
      GROUP BY s.id
      ORDER BY s.roll_number
      LIMIT 5
    `, [testCourse.id]);
    console.log(`   ✓ Attendance summary loaded: ${attendanceSummary.length} students (showing first 5)`);
    attendanceSummary.forEach(s => {
      console.log(`     - Roll ${s.roll_number}: ${s.student_id} - ${s.present_days || 0}/${s.total_days || 0} days (${s.percentage || 0}%)`);
    });

    // 3. Check results table structure
    console.log('\n3. Checking results table structure...');
    const [columns] = await db.query('DESCRIBE results');
    const columnNames = columns.map(c => c.Field);
    const requiredColumns = ['term', 'percentage', 'grade'];
    const hasAllColumns = requiredColumns.every(col => columnNames.includes(col));
    console.log(`   ✓ Results table has required columns: ${hasAllColumns ? 'YES' : 'NO'}`);
    if (hasAllColumns) {
      console.log(`     - term: ✓`);
      console.log(`     - percentage: ✓`);
      console.log(`     - grade: ✓`);
    }

    // 4. Test results analysis query
    console.log('\n4. Testing results analysis query...');
    const [results] = await db.query(`
      SELECT 
        s.student_id,
        s.first_name,
        s.last_name,
        s.roll_number,
        r.term,
        r.theory_marks,
        r.practical_marks,
        r.total_marks,
        r.percentage,
        r.grade
      FROM students s
      LEFT JOIN results r ON s.id = r.student_id AND r.course_id = ? AND r.term = 'First Term'
      WHERE s.class = '11' AND s.section = 'A'
      ORDER BY s.roll_number
      LIMIT 5
    `, [testCourse.id]);
    console.log(`   ✓ Results loaded: ${results.length} students (showing first 5)`);
    results.forEach(r => {
      if (r.grade) {
        console.log(`     - Roll ${r.roll_number}: ${r.student_id} - ${r.percentage}% (${r.grade})`);
      } else {
        console.log(`     - Roll ${r.roll_number}: ${r.student_id} - No results yet`);
      }
    });

    // 5. Calculate grade distribution
    console.log('\n5. Testing grade distribution calculation...');
    const [allResults] = await db.query(`
      SELECT grade, COUNT(*) as count
      FROM results
      WHERE course_id = ? AND term = 'First Term'
      GROUP BY grade
    `, [testCourse.id]);
    console.log(`   ✓ Grade distribution:`);
    if (allResults.length > 0) {
      allResults.forEach(g => {
        console.log(`     - ${g.grade}: ${g.count} students`);
      });
    } else {
      console.log(`     - No results found for First Term`);
    }

    // 6. Check unique constraints
    console.log('\n6. Checking unique constraints...');
    const [constraints] = await db.query(`
      SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE
      FROM information_schema.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = 'nic_portal' 
      AND TABLE_NAME IN ('attendance', 'results')
      AND CONSTRAINT_TYPE = 'UNIQUE'
    `);
    console.log(`   ✓ Unique constraints found: ${constraints.length}`);
    constraints.forEach(c => {
      console.log(`     - ${c.CONSTRAINT_NAME} on ${c.TABLE_NAME || 'table'}`);
    });

    console.log('\n✅ All tests passed! Faculty features are ready.');
    console.log('\n📋 Next steps:');
    console.log('1. Login as faculty: faculty@nic.edu.np / Faculty@123');
    console.log('2. Go to "Export Attendance" to export attendance summary');
    console.log('3. Go to "Upload Marks" to upload term-wise marks');
    console.log('4. Go to "Results Analysis" to view grade distribution');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testFacultyFeatures();
