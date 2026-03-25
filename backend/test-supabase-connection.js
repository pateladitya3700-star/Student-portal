const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 Testing Supabase Connection...\n');

console.log('Configuration:');
console.log('- Host:', process.env.DB_HOST);
console.log('- Port:', process.env.DB_PORT);
console.log('- Database:', process.env.DB_NAME);
console.log('- User:', process.env.DB_USER);
console.log('- SSL:', process.env.DB_SSL);
console.log('- Password:', process.env.DB_PASSWORD ? '***SET***' : '❌ NOT SET');
console.log('');

if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD === 'YOUR_DATABASE_PASSWORD_HERE') {
  console.error('❌ ERROR: Database password not set!');
  console.error('');
  console.error('Please update backend/.env with your Supabase database password:');
  console.error('1. Go to https://supabase.com/dashboard/project/pkupecytvrxggjrngkdf/settings/database');
  console.error('2. Find your database password (or reset it)');
  console.error('3. Update DB_PASSWORD in backend/.env');
  console.error('');
  process.exit(1);
}

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
});

async function testConnection() {
  try {
    console.log('⏳ Connecting to Supabase...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!\n');

    // Test query
    console.log('⏳ Running test query...');
    const result = await client.query('SELECT version()');
    console.log('✅ Query successful!');
    console.log('PostgreSQL Version:', result.rows[0].version.split(' ')[0], result.rows[0].version.split(' ')[1]);
    console.log('');

    // Check if tables exist
    console.log('⏳ Checking for tables...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    if (tables.rows.length === 0) {
      console.log('⚠️  No tables found!');
      console.log('');
      console.log('You need to run the database schema:');
      console.log('1. Go to https://supabase.com/dashboard/project/pkupecytvrxggjrngkdf/editor');
      console.log('2. Click "New Query"');
      console.log('3. Copy content from database/schema-postgresql.sql');
      console.log('4. Paste and click "Run"');
      console.log('');
    } else {
      console.log('✅ Found', tables.rows.length, 'tables:');
      tables.rows.forEach(row => {
        console.log('  -', row.table_name);
      });
      console.log('');
    }

    client.release();
    
    console.log('🎉 Connection test complete!');
    console.log('');
    console.log('Next steps:');
    if (tables.rows.length === 0) {
      console.log('1. Run schema-postgresql.sql in Supabase SQL Editor');
      console.log('2. Start backend: npm start');
      console.log('3. Start frontend: cd ../frontend && npm run dev');
    } else {
      console.log('1. Start backend: npm start');
      console.log('2. Start frontend: cd ../frontend && npm run dev');
      console.log('3. Login with admin credentials');
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.message.includes('password authentication failed')) {
      console.error('💡 Solution: Your database password is incorrect');
      console.error('1. Go to https://supabase.com/dashboard/project/pkupecytvrxggjrngkdf/settings/database');
      console.error('2. Click "Reset Database Password"');
      console.error('3. Update DB_PASSWORD in backend/.env');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('💡 Solution: Cannot reach database host');
      console.error('1. Check your internet connection');
      console.error('2. Verify DB_HOST in backend/.env is correct');
    } else if (error.message.includes('SSL')) {
      console.error('💡 Solution: SSL connection issue');
      console.error('1. Make sure DB_SSL=true in backend/.env');
    } else {
      console.error('💡 Check your configuration in backend/.env');
    }
    
    console.error('');
    await pool.end();
    process.exit(1);
  }
}

testConnection();
