const mysql = require('mysql2/promise');
require('dotenv').config();

async function createFeeTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Creating fee_payments table...');

    // Create table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fee_payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id VARCHAR(20) NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        semester VARCHAR(20) NOT NULL,
        total_fee DECIMAL(10, 2) NOT NULL,
        paid_amount DECIMAL(10, 2) DEFAULT 0,
        due_amount DECIMAL(10, 2) NOT NULL,
        payment_date DATE,
        payment_method VARCHAR(50),
        transaction_id VARCHAR(100),
        status ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
        INDEX idx_student_id (student_id),
        INDEX idx_status (status),
        INDEX idx_academic_year (academic_year)
      )
    `);

    console.log('✓ Fee payments table created');

    // Insert sample data
    console.log('Inserting sample fee records...');
    
    const [students] = await connection.query(
      "SELECT student_id FROM students WHERE student_id LIKE 'STU%'"
    );

    for (const student of students) {
      const rand = Math.random();
      let paidAmount, dueAmount, status, paymentDate, paymentMethod;

      if (rand > 0.7) {
        // Fully paid
        paidAmount = 50000;
        dueAmount = 0;
        status = 'paid';
        paymentDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
        paymentMethod = Math.random() > 0.5 ? 'Cash' : 'Bank Transfer';
      } else if (rand > 0.4) {
        // Partially paid
        paidAmount = 25000;
        dueAmount = 25000;
        status = 'partial';
        paymentDate = new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000);
        paymentMethod = Math.random() > 0.5 ? 'Cash' : 'Bank Transfer';
      } else {
        // Not paid
        paidAmount = 0;
        dueAmount = 50000;
        status = 'pending';
        paymentDate = null;
        paymentMethod = null;
      }

      await connection.query(
        `INSERT INTO fee_payments 
        (student_id, academic_year, semester, total_fee, paid_amount, due_amount, 
         payment_date, payment_method, status, remarks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          student.student_id,
          '2024-2025',
          'First Semester',
          50000,
          paidAmount,
          dueAmount,
          paymentDate,
          paymentMethod,
          status,
          'First semester fee'
        ]
      );
    }

    console.log(`✓ Inserted fee records for ${students.length} students`);

    // Show summary
    const [summary] = await connection.query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total_fee) as total_fee,
        SUM(paid_amount) as total_paid,
        SUM(due_amount) as total_due
      FROM fee_payments
      GROUP BY status
    `);

    console.log('\n=== Fee Summary ===');
    summary.forEach(row => {
      console.log(`${row.status}: ${row.count} students, Paid: Rs.${row.total_paid}, Due: Rs.${row.total_due}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

createFeeTable();
