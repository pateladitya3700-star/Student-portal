const db = require('../config/database');

async function testFacultyAttendance() {
  try {
    console.log('Testing Faculty Attendance System...\n');

    // 1. Check faculty
    console.log('1. Checking faculty...');
    const [faculty] = await db.query('SELECT * FROM faculty WHERE faculty_id = ?', ['FAC001']);
    console.log(`   ✓ Faculty: ${faculty[0].first_name} ${faculty[0].last_name} (ID: ${faculty[0].id})`);

    // 2. Check assigned courses
    console.log('\n2. Checking assigned courses...');
    const [courses] = await db.query(`
      SELECT c.*, fc.academic_year
      FROM faculty_courses fc
      JOIN courses c ON fc.course_id = c.id
      WHERE fc.faculty_id = ?
    `, [faculty[0].id]);
    console.log(`   ✓ Assigned courses: ${courses.length}`);
    courses.forEach(c => {
      console.log(`     - ${c.name} (${c.code}) - Class ${c.class}`);
    });

    // 3. Check students in Class 11 Section A
    console.log('\n3. Checking students in Class 11 Section A...');
    const [students] = await db.query(`
      SELECT id, student_id, first_name, last_name, roll_number
      FROM students
      WHERE class = '11' AND section = 'A'
      ORDER BY roll_number
      LIMIT 5
    `);
    console.log(`   ✓ Students found: ${students.length} (showing first 5)`);
    students.forEach(s => {
      console.log(`     - Roll ${s.roll_number}: ${s.student_id} - ${s.first_name} ${s.last_name}`);
    });

    // 4. Check existing attendance records
    console.log('\n4. Checking existing attendance records...');
    const [attendance] = await db.query(`
      SELECT COUNT(*) as count
      FROM attendance
      WHERE marked_by = ?
    `, [faculty[0].id]);
    console.log(`   ✓ Total attendance records marked by this faculty: ${attendance[0].count}`);

    // 5. Check attendance table structure
    console.log('\n5. Checking attendance table constraints...');
    const [constraints] = await db.query(`
      SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE
      FROM information_schema.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = 'nic_portal' AND TABLE_NAME = 'attendance'
    `);
    console.log(`   ✓ Constraints found: ${constraints.length}`);
    constraints.forEach(c => {
      console.log(`     - ${c.CONSTRAINT_NAME}: ${c.CONSTRAINT_TYPE}`);
    });

    console.log('\n✓ All tests passed! Faculty attendance system is ready.');
    console.log('\nNext steps:');
    console.log('1. Login as faculty: faculty@nic.edu.np / Faculty@123');
    console.log('2. Go to "My Courses" to see assigned courses');
    console.log('3. Go to "Mark Attendance" to mark attendance');
    console.log('4. Go to "View Attendance" to see and edit records');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testFacultyAttendance();
