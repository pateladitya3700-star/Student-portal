const db = require('../config/database');

async function assignFacultyCourses() {
  try {
    console.log('Assigning courses to faculty...');

    // Get the faculty member
    const [faculty] = await db.query('SELECT id FROM faculty WHERE faculty_id = ?', ['FAC001']);
    
    if (faculty.length === 0) {
      console.log('No faculty found');
      return;
    }

    const facultyId = faculty[0].id;

    // Assign Physics (Class 11 & 12) to the faculty
    const coursesToAssign = [
      { courseId: 1, courseName: 'Physics - Class 11' },  // PHY11
      { courseId: 8, courseName: 'Physics - Class 12' }   // PHY12
    ];

    for (const course of coursesToAssign) {
      // Check if already assigned
      const [existing] = await db.query(
        'SELECT id FROM faculty_courses WHERE faculty_id = ? AND course_id = ?',
        [facultyId, course.courseId]
      );

      if (existing.length === 0) {
        await db.query(
          'INSERT INTO faculty_courses (faculty_id, course_id, academic_year) VALUES (?, ?, ?)',
          [facultyId, course.courseId, '2025-2026']
        );
        console.log(`✓ Assigned ${course.courseName} to faculty`);
      } else {
        console.log(`- ${course.courseName} already assigned`);
      }
    }

    console.log('\n✓ Faculty course assignments completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

assignFacultyCourses();
