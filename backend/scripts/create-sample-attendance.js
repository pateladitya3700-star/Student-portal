const db = require('../config/database');

async function createSampleAttendance() {
  try {
    console.log('🎓 Creating sample attendance for NIC11A01...\n');

    // Get student ID
    const [student] = await db.query(
      'SELECT id, student_id, first_name, last_name, class FROM students WHERE student_id = ?',
      ['NIC11A01']
    );

    if (student.length === 0) {
      console.log('❌ Student NIC11A01 not found');
      process.exit(1);
    }

    const studentId = student[0].id;
    console.log(`✓ Found student: ${student[0].first_name} ${student[0].last_name} (ID: ${studentId})`);

    // Get all courses for Class 11
    const [courses] = await db.query(
      'SELECT id, code, name FROM courses WHERE class = ? ORDER BY name',
      [student[0].class]
    );

    console.log(`✓ Found ${courses.length} subjects for Class ${student[0].class}\n`);

    // Get faculty ID (we'll use admin as the one marking attendance)
    const [admin] = await db.query('SELECT id FROM users WHERE role = ? LIMIT 1', ['admin']);
    const markedBy = admin[0].id;

    // Generate dates from March 22, 2026 to April 22, 2026 (30 days)
    const startDate = new Date('2026-03-22');
    const endDate = new Date('2026-04-22');
    
    // Create array of dates (excluding Sundays - weekly holiday)
    const dates = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // Skip Sundays (0 = Sunday)
      if (currentDate.getDay() !== 0) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`📅 Total school days (excluding Sundays): ${dates.length}`);

    // We want 20 present and 10 absent
    // Randomly select 10 dates to be absent
    const absentDates = [];
    const shuffledDates = [...dates].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 10 && i < shuffledDates.length; i++) {
      absentDates.push(shuffledDates[i].toISOString().split('T')[0]);
    }

    let totalRecords = 0;
    let presentCount = 0;
    let absentCount = 0;

    // For each date, create attendance for each subject
    for (const date of dates) {
      const dateStr = date.toISOString().split('T')[0];
      const isAbsent = absentDates.includes(dateStr);
      const status = isAbsent ? 'absent' : 'present';

      // Mark attendance for each subject on this date
      for (const course of courses) {
        await db.query(
          `INSERT INTO attendance (student_id, course_id, date, status, marked_by)
           VALUES (?, ?, ?, ?, ?)`,
          [studentId, course.id, dateStr, status, markedBy]
        );
        
        totalRecords++;
        if (status === 'present') {
          presentCount++;
        } else {
          absentCount++;
        }
      }

      console.log(`  ${dateStr}: ${status.toUpperCase()} (${courses.length} subjects)`);
    }

    const percentage = ((presentCount / totalRecords) * 100).toFixed(1);

    console.log(`\n✅ Attendance created successfully!`);
    console.log(`\n📊 Summary:`);
    console.log(`   Total Records: ${totalRecords}`);
    console.log(`   Present: ${presentCount}`);
    console.log(`   Absent: ${absentCount}`);
    console.log(`   Overall Percentage: ${percentage}%`);
    console.log(`\n   Days Present: ${dates.length - absentDates.length} days`);
    console.log(`   Days Absent: ${absentDates.length} days`);
    console.log(`   Total School Days: ${dates.length} days`);
    
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

createSampleAttendance();
