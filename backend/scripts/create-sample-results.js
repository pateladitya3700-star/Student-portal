const db = require('../config/database');

async function createSampleResults() {
  try {
    console.log('🎓 Creating sample results for NIC11A01...\n');

    // Get student
    const [student] = await db.query(
      'SELECT id, student_id, first_name, last_name, class FROM students WHERE student_id = ?',
      ['NIC11A01']
    );

    if (student.length === 0) {
      console.log('❌ Student not found');
      process.exit(1);
    }

    const studentId = student[0].id;
    console.log(`✓ Found student: ${student[0].first_name} ${student[0].last_name}`);

    // Get courses for Class 11
    const [courses] = await db.query(
      'SELECT id, code, name FROM courses WHERE class = ? ORDER BY name',
      [student[0].class]
    );

    console.log(`✓ Found ${courses.length} subjects\n`);

    // Get admin ID
    const [admin] = await db.query('SELECT id FROM users WHERE role = ? LIMIT 1', ['admin']);
    const uploadedBy = admin[0].id;

    const terms = ['first_term', 'second_term', 'third_term'];
    
    for (const term of terms) {
      console.log(`Creating ${term.replace('_', ' ')} results...`);
      
      for (const course of courses) {
        // Generate random marks
        const theoryMarks = Math.floor(Math.random() * 15) + 45; // 45-60
        const practicalMarks = Math.floor(Math.random() * 5) + 15; // 15-20
        const internalMarks = Math.floor(Math.random() * 5) + 15; // 15-20
        const totalMarks = theoryMarks + practicalMarks + internalMarks;

        await db.query(
          `INSERT INTO results (student_id, course_id, exam_type, theory_marks, theory_total,
                                practical_marks, practical_total, internal_marks, internal_total,
                                marks_obtained, total_marks, uploaded_by)
           VALUES (?, ?, ?, ?, 60, ?, 20, ?, 20, ?, 100, ?)`,
          [studentId, course.id, term, theoryMarks, practicalMarks, internalMarks, totalMarks, uploadedBy]
        );

        const percentage = ((totalMarks / 100) * 100).toFixed(1);
        console.log(`  ${course.name}: ${totalMarks}/100 (${percentage}%)`);
      }
      console.log('');
    }

    // Calculate overall percentages
    for (const term of terms) {
      const [termResults] = await db.query(
        `SELECT SUM(marks_obtained) as total_marks, SUM(total_marks) as total_possible
         FROM results WHERE student_id = ? AND exam_type = ?`,
        [studentId, term]
      );

      const percentage = ((termResults[0].total_marks / termResults[0].total_possible) * 100).toFixed(1);
      console.log(`${term.replace('_', ' ').toUpperCase()}: ${percentage}%`);
    }

    console.log(`\n✅ Results created successfully!`);
    console.log(`\n🔑 Login with:`);
    console.log(`   Email: anish.shrestha.nic11a01@nic.edu.np`);
    console.log(`   Password: 123456`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createSampleResults();
