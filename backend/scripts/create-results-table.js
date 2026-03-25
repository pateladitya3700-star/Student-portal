const db = require('../config/database');

async function createResultsTable() {
  try {
    console.log('Creating results table...');
    
    // Drop existing table if it exists
    await db.query('DROP TABLE IF EXISTS results');
    
    await db.query(`
      CREATE TABLE results (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        exam_type ENUM('first_term', 'second_term', 'third_term') NOT NULL,
        theory_marks DECIMAL(5,2),
        theory_total DECIMAL(5,2) DEFAULT 60,
        practical_marks DECIMAL(5,2),
        practical_total DECIMAL(5,2) DEFAULT 20,
        internal_marks DECIMAL(5,2),
        internal_total DECIMAL(5,2) DEFAULT 20,
        marks_obtained DECIMAL(5,2) NOT NULL,
        total_marks DECIMAL(5,2) NOT NULL DEFAULT 100,
        uploaded_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
      )
    `);
    
    console.log('✓ Results table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createResultsTable();
