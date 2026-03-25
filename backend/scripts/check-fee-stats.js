const db = require('../config/database');

async function checkFeeStats() {
  try {
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
    
    console.log('Fee Statistics:');
    console.log(JSON.stringify(stats[0], null, 2));
    
    // Also check a sample student
    const [sampleStudent] = await db.query(`
      SELECT student_id FROM fee_payments LIMIT 1
    `);
    
    if (sampleStudent.length > 0) {
      console.log('\nSample Student ID:', sampleStudent[0].student_id);
      
      const [studentFees] = await db.query(`
        SELECT * FROM fee_payments WHERE student_id = ?
      `, [sampleStudent[0].student_id]);
      
      console.log('Student Fee Records:', studentFees.length);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkFeeStats();
