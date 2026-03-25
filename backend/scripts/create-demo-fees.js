const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDemoFees() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('🎓 Creating Demo Fee Records for Class 11-A Students...\n');

    // First, check if students exist
    const [students] = await connection.query(
      `SELECT student_id, first_name, last_name 
       FROM students 
       WHERE class = '11' AND section = 'A' 
       ORDER BY roll_number 
       LIMIT 20`
    );

    if (students.length === 0) {
      console.log('❌ No students found in Class 11-A');
      console.log('💡 Please run the student generation script first:');
      console.log('   node scripts/generate-students.js');
      return;
    }

    console.log(`✓ Found ${students.length} students in Class 11-A\n`);

    // Clear existing fee records for these students
    await connection.query(
      `DELETE FROM fee_payments 
       WHERE student_id IN (
         SELECT student_id FROM students 
         WHERE class = '11' AND section = 'A'
       )`
    );

    const totalFee = 50000; // Rs. 50,000 per semester
    const academicYear = '2024-2025';
    const semester = 'First Semester';

    // Payment distribution:
    // 6 students - Fully Paid (30%)
    // 7 students - Partially Paid (35%)
    // 5 students - Pending (25%)
    // 2 students - Overdue (10%)

    const paymentMethods = ['Cash', 'Bank Transfer', 'Online Payment', 'Cheque'];
    const remarks = [
      'First semester fee',
      'Payment received in full',
      'Partial payment - installment 1',
      'Partial payment - installment 2',
      'Payment pending - reminder sent',
      'Scholarship applied',
      'Payment plan approved'
    ];

    let feeRecords = [];
    let paidCount = 0;
    let partialCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    students.forEach((student, index) => {
      let paidAmount, status, paymentDate, paymentMethod, remark;

      if (index < 6) {
        // Fully Paid (30%)
        paidAmount = totalFee;
        status = 'paid';
        paymentDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
        paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        remark = 'Payment received in full';
        paidCount++;
      } else if (index < 13) {
        // Partially Paid (35%)
        const partialPercentages = [0.25, 0.40, 0.50, 0.60, 0.75];
        const percentage = partialPercentages[Math.floor(Math.random() * partialPercentages.length)];
        paidAmount = Math.round(totalFee * percentage);
        status = 'partial';
        paymentDate = new Date(Date.now() - Math.floor(Math.random() * 45) * 24 * 60 * 60 * 1000);
        paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        remark = `Partial payment - Rs. ${paidAmount.toLocaleString()} paid, Rs. ${(totalFee - paidAmount).toLocaleString()} remaining`;
        partialCount++;
      } else if (index < 18) {
        // Pending (25%)
        paidAmount = 0;
        status = 'pending';
        paymentDate = null;
        paymentMethod = null;
        remark = 'Payment pending - awaiting payment';
        pendingCount++;
      } else {
        // Overdue (10%)
        paidAmount = 0;
        status = 'overdue';
        paymentDate = null;
        paymentMethod = null;
        remark = 'Payment overdue - reminder sent multiple times';
        overdueCount++;
      }

      const dueAmount = totalFee - paidAmount;
      const transactionId = paidAmount > 0 ? `TXN${Date.now()}${index}` : null;

      feeRecords.push({
        student_id: student.student_id,
        name: `${student.first_name} ${student.last_name}`,
        academic_year: academicYear,
        semester: semester,
        total_fee: totalFee,
        paid_amount: paidAmount,
        due_amount: dueAmount,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        status: status,
        remarks: remark
      });
    });

    // Insert fee records
    for (const record of feeRecords) {
      await connection.query(
        `INSERT INTO fee_payments 
        (student_id, academic_year, semester, total_fee, paid_amount, due_amount, 
         payment_date, payment_method, transaction_id, status, remarks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record.student_id,
          record.academic_year,
          record.semester,
          record.total_fee,
          record.paid_amount,
          record.due_amount,
          record.payment_date,
          record.payment_method,
          record.transaction_id,
          record.status,
          record.remarks
        ]
      );
    }

    console.log('✅ Demo Fee Records Created Successfully!\n');

    // Display summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('                    FEE SUMMARY                        ');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Class: 11-A`);
    console.log(`Academic Year: ${academicYear}`);
    console.log(`Semester: ${semester}`);
    console.log(`Total Students: ${students.length}`);
    console.log(`Fee per Student: Rs. ${totalFee.toLocaleString()}`);
    console.log('───────────────────────────────────────────────────────');
    
    const totalFeeAmount = totalFee * students.length;
    const totalPaid = feeRecords.reduce((sum, r) => sum + r.paid_amount, 0);
    const totalDue = totalFeeAmount - totalPaid;
    const collectionRate = ((totalPaid / totalFeeAmount) * 100).toFixed(2);

    console.log(`\n💰 Financial Summary:`);
    console.log(`   Total Fee Amount:    Rs. ${totalFeeAmount.toLocaleString()}`);
    console.log(`   Total Collected:     Rs. ${totalPaid.toLocaleString()} (${collectionRate}%)`);
    console.log(`   Total Outstanding:   Rs. ${totalDue.toLocaleString()}`);

    console.log(`\n📊 Payment Status Distribution:`);
    console.log(`   🟢 Fully Paid:       ${paidCount} students (${((paidCount/students.length)*100).toFixed(0)}%)`);
    console.log(`   🟠 Partially Paid:   ${partialCount} students (${((partialCount/students.length)*100).toFixed(0)}%)`);
    console.log(`   🔴 Pending:          ${pendingCount} students (${((pendingCount/students.length)*100).toFixed(0)}%)`);
    console.log(`   ⚫ Overdue:           ${overdueCount} students (${((overdueCount/students.length)*100).toFixed(0)}%)`);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('\n📋 Individual Student Records:\n');

    // Display individual records
    feeRecords.forEach((record, index) => {
      const statusEmoji = {
        'paid': '🟢',
        'partial': '🟠',
        'pending': '🔴',
        'overdue': '⚫'
      };

      console.log(`${index + 1}. ${statusEmoji[record.status]} ${record.student_id} - ${record.name}`);
      console.log(`   Status: ${record.status.toUpperCase()}`);
      console.log(`   Paid: Rs. ${record.paid_amount.toLocaleString()} | Due: Rs. ${record.due_amount.toLocaleString()}`);
      if (record.payment_date) {
        console.log(`   Payment Date: ${record.payment_date.toLocaleDateString()}`);
        console.log(`   Method: ${record.payment_method} | TXN: ${record.transaction_id}`);
      }
      console.log(`   Note: ${record.remarks}`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════');
    console.log('\n✅ All demo fee records have been created!');
    console.log('\n📌 Next Steps:');
    console.log('   1. Login to admin portal: admin@nic.edu.np / Admin@123');
    console.log('   2. Click "Fee Management" in the sidebar');
    console.log('   3. View the demo fee records');
    console.log('   4. Try filtering by status');
    console.log('   5. Edit or add new records\n');

  } catch (error) {
    console.error('❌ Error creating demo fees:', error.message);
    console.error(error);
  } finally {
    await connection.end();
  }
}

createDemoFees();
