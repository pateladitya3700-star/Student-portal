const db = require('../config/database');

async function createAttendanceTable() {
  try {
    console.log('Creating attendance table...');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        date DATE NOT NULL,
        status ENUM('present', 'absent', 'late') NOT NULL,
        marked_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (marked_by) REFERENCES users(id)
      )
    `);
    
    console.log('✓ Attendance table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAttendanceTable();
