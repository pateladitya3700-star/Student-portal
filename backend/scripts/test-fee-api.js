const db = require('../config/database');

async function testFeeAPI() {
  try {
    console.log('Testing Fee API endpoints...\n');
    
    // Test the stats query directly
    console.log('1. Testing stats query directly:');
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_records,
        SUM(total_fee) as total_fee_amount,
        SUM(paid_amount) as total_paid,
        SUM(due_amount) as total_due,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count,
        SUM(CASE WHEN status = 'partial' THEN 1 ELSE 0 END) as partial_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_count
      FROM fee_payments
    `);
    
    console.log('Stats result:', stats[0]);
    console.log('\nData types:');
    console.log('- total_fee_amount:', typeof stats[0].total_fee_amount, stats[0].total_fee_amount);
    console.log('- total_paid:', typeof stats[0].total_paid, stats[0].total_paid);
    console.log('- paid_count:', typeof stats[0].paid_count, stats[0].paid_count);
    
    // Test student fee query
    console.log('\n2. Testing student fee query:');
    const [students] = await db.query('SELECT student_id FROM students LIMIT 1');
    if (students.length > 0) {
      const studentId = students[0].student_id;
      console.log('Testing with student ID:', studentId);
      
      const [feeHistory] = await db.query(
        `SELECT * FROM fee_payments WHERE student_id = ?`,
        [studentId]
      );
      
      console.log('Fee records found:', feeHistory.length);
      if (feeHistory.length > 0) {
        console.log('Sample record:', feeHistory[0]);
      }
      
      const [studentStats] = await db.query(
        `SELECT 
          SUM(total_fee) as total_fee,
          SUM(paid_amount) as total_paid,
          SUM(due_amount) as total_due
         FROM fee_payments 
         WHERE student_id = ?`,
        [studentId]
      );
      
      console.log('Student stats:', studentStats[0]);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testFeeAPI();
