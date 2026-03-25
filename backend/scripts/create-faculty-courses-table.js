const db = require('../config/database');

async function createFacultyCourses() {
  try {
    console.log('Creating faculty_courses table...');

    await db.query(`
      CREATE TABLE IF NOT EXISTS faculty_courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        faculty_id INT NOT NULL,
        course_id INT NOT NULL,
        academic_year VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE KEY unique_faculty_course (faculty_id, course_id, academic_year)
      )
    `);

    console.log('✓ faculty_courses table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createFacultyCourses();
