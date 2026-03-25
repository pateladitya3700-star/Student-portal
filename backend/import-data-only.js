const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

console.log('📥 Importing data from MySQL dump...\n');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Parse MySQL INSERT statements
function parseInserts(sql) {
  const inserts = [];
  const lines = sql.split('\n');
  
  let currentTable = null;
  let currentInsert = '';
  
  for (const line of lines) {
    // Match INSERT INTO statement
    const insertMatch = line.match(/INSERT INTO `(\w+)`/);
    if (insertMatch) {
      currentTable = insertMatch[1];
      currentInsert = line;
      
      // Check if it's a complete statement
      if (line.trim().endsWith(';')) {
        inserts.push({ table: currentTable, sql: currentInsert });
        currentInsert = '';
      }
    } else if (currentInsert) {
      currentInsert += '\n' + line;
      if (line.trim().endsWith(';')) {
        inserts.push({ table: currentTable, sql: currentInsert });
        currentInsert = '';
      }
    }
  }
  
  return inserts;
}

async function importData() {
  const client = await pool.connect();
  
  try {
    console.log('✅ Connected to Supabase\n');
    
    // Read MySQL dump
    console.log('📖 Reading MySQL dump...');
    const mysqlDump = fs.readFileSync('nic_portal.sql', 'utf8');
    
    // Parse INSERT statements
    console.log('🔍 Parsing INSERT statements...');
    const inserts = parseInserts(mysqlDump);
    console.log(`Found ${inserts.length} INSERT statements\n`);
    
    // Clear existing data (in correct order to avoid foreign key issues)
    console.log('🗑️  Clearing existing data...');
    await client.query('TRUNCATE TABLE attendance, results, fee_payments, faculty_courses, students, faculty, courses, users CASCADE');
    console.log('✅ Data cleared\n');
    
    // Import data in correct order (respecting foreign keys)
    console.log('📥 Importing data...\n');
    let imported = 0;
    let failed = 0;
    
    const importOrder = ['users', 'students', 'faculty', 'courses', 'faculty_courses', 'attendance', 'results', 'fee_payments', 'notifications'];
    
    for (const tableName of importOrder) {
      const tableInserts = inserts.filter(i => i.table === tableName);
      
      for (const insert of tableInserts) {
        try {
          // Convert MySQL syntax to PostgreSQL
          let pgSQL = insert.sql;
          
          // Remove backticks
          pgSQL = pgSQL.replace(/`/g, '');
          
          // Convert 0/1 to false/true for boolean fields
          if (insert.table === 'users') {
            pgSQL = pgSQL.replace(/,\s*([01])\s*,\s*'[\d-]+\s+[\d:]+'/g, (match, bool) => {
              return match.replace(bool, bool === '1' ? 'true' : 'false');
            });
          }
          
          console.log(`  Importing ${insert.table}...`);
          await client.query(pgSQL);
          imported++;
          
        } catch (err) {
          console.log(`  ❌ Failed ${insert.table}: ${err.message}`);
          failed++;
        }
      }
    }
    
    console.log(`\n✅ Imported: ${imported}`);
    console.log(`❌ Failed: ${failed}\n`);
    
    // Reset sequences (auto-increment)
    console.log('🔄 Resetting sequences...');
    const tables = ['users', 'students', 'faculty', 'courses', 'faculty_courses', 'attendance', 'results', 'fee_payments', 'notifications'];
    
    for (const table of tables) {
      try {
        await client.query(`
          SELECT setval(pg_get_serial_sequence('${table}', 'id'), 
          COALESCE((SELECT MAX(id) FROM ${table}), 1), true)
        `);
      } catch (err) {
        // Ignore if table is empty or doesn't have id column
      }
    }
    console.log('✅ Sequences reset\n');
    
    // Show summary
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM students) as students,
        (SELECT COUNT(*) FROM faculty) as faculty,
        (SELECT COUNT(*) FROM courses) as courses,
        (SELECT COUNT(*) FROM attendance) as attendance,
        (SELECT COUNT(*) FROM results) as results,
        (SELECT COUNT(*) FROM fee_payments) as fee_payments
    `);
    
    console.log('📊 Database Summary:');
    console.log('- Users:', counts.rows[0].users);
    console.log('- Students:', counts.rows[0].students);
    console.log('- Faculty:', counts.rows[0].faculty);
    console.log('- Courses:', counts.rows[0].courses);
    console.log('- Attendance:', counts.rows[0].attendance);
    console.log('- Results:', counts.rows[0].results);
    console.log('- Fee Payments:', counts.rows[0].fee_payments);
    console.log('');
    
    console.log('🎉 Import complete!');
    console.log('');
    console.log('Next: npm start');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

importData();
