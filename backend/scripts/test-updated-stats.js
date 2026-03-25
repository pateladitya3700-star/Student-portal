const adminController = require('../controllers/adminController');
const db = require('../config/database');

async function testUpdatedStats() {
  try {
    console.log('Testing updated getFeeStats function...\n');
    
    // Mock request and response objects
    const req = {};
    const res = {
      json: (data) => {
        console.log('Response data:');
        console.log(JSON.stringify(data, null, 2));
        console.log('\nData types:');
        console.log('- total_fee_amount:', typeof data.total_fee_amount, data.total_fee_amount);
        console.log('- total_paid:', typeof data.total_paid, data.total_paid);
        console.log('- paid_count:', typeof data.paid_count, data.paid_count);
        console.log('- partial_count:', typeof data.partial_count, data.partial_count);
        process.exit(0);
      },
      status: (code) => ({
        json: (data) => {
          console.error('Error response:', code, data);
          process.exit(1);
        }
      })
    };
    
    await adminController.getFeeStats(req, res);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testUpdatedStats();
