const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

console.log('🔄 Converting MySQL dump to PostgreSQL...\n');

// Read the MySQL dump
const mysqlDump = fs.readFileSync('nic_portal.sql', 'utf8');

// Convert MySQL syntax to PostgreSQL
function convertToPostgreSQL(sql) {
  let converted = sql;
  
  // Remove MySQL-specific comments and settings
  converted = converted.replace(/\/\*!.*?\*\//gs, '');
  converted = converted.replace(/SET SQL_MODE.*?;/g, '');
  converted = converted.replace(/START TRANSACTION;/g, '');
  converted = converted.replace(/SET time_zone.*?;/g, '');
  converted = converted.replace(/SET @.*?;/g, '');
  converted = converted.replace(/-- phpMyAdmin.*?\n/g, '');
  converted = converted.replace(/-- Server version.*?\n/g, '');
  converted = converted.replace(/-- PHP Version.*?\n/g, '');
  converted = converted.replace(/-- Host:.*?\n/g, '');
  converted = converted.replace(/-- Generation Time:.*?\n/g, '');
  
  // Remove backticks
  converted = converted.replace(/`/g, '');
  
  // Convert ENGINE and CHARSET
  converted = converted.replace(/\) ENGINE=.*?;/g, ');');
  
  // Convert AUTO_INCREMENT to SERIAL (in CREATE TABLE)
  converted = converted.replace(/int\(\d+\) NOT NULL AUTO_INCREMENT/gi, 'SERIAL');
  converted = converted.replace(/int\(\d+\) NOT NULL,/gi, 'INTEGER NOT NULL,');
  converted = converted.replace(/int\(\d+\)/gi, 'INTEGER');
  
  // Convert varchar
  converted = converted.replace(/varchar\((\d+)\)/gi, 'VARCHAR($1)');
  
  // Convert text types
  converted = converted.replace(/\btext\b/gi, 'TEXT');
  converted = converted.replace(/\blongtext\b/gi, 'TEXT');
  
  // Convert date/time types
  converted = converted.replace(/datetime/gi, 'TIMESTAMP');
  converted = converted.replace(/timestamp NOT NULL DEFAULT current_timestamp\(\)/gi, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  
  // Convert decimal
  converted = converted.replace(/decimal\((\d+),(\d+)\)/gi, 'DECIMAL($1,$2)');
  
  // Convert enum to CHECK constraint
  converted = converted.replace(/enum\((.*?)\)/gi, (match, values) => {
    const vals = values.split(',').map(v => v.trim()).join(', ');
    return `VARCHAR(20) CHECK (column_name IN (${vals}))`;
  });
  
  // Convert boolean
  converted = converted.replace(/tinyint\(1\)/gi, 'BOOLEAN');
  
  // Remove UNIQUE KEY and KEY definitions (we'll handle indexes separately)
  converted = converted.replace(/,\s*UNIQUE KEY.*?\n/g, ',\n');
  converted = converted.replace(/,\s*KEY.*?\n/g, ',\n');
  
  // Remove trailing commas before closing parenthesis
  converted = converted.replace(/,(\s*)\)/g, '$1)');
  
  // Convert ALTER TABLE for primary keys
  converted = converted.replace(/ALTER TABLE (\w+)\s+ADD PRIMARY KEY \((\w+)\);/gi, 
    '-- Primary key for $1 already defined in CREATE TABLE');
  
  // Convert ALTER TABLE for auto increment
  converted = converted.replace(/ALTER TABLE (\w+)\s+MODIFY (\w+) int\(\d+\) NOT NULL AUTO_INCREMENT;/gi, 
    '-- Auto increment for $1.$2 already defined as SERIAL');
  
  // Remove COMMIT
  converted = converted.replace(/COMMIT;/g, '');
  
  return converted;
}

async function importToSupabase() {
  console.log('📝 Converting SQL syntax...');
  const postgresSQL = convertToPostgreSQL(mysqlDump);
  
  // Save converted SQL for inspection
  fs.writeFileSync('nic_portal_postgres.sql', postgresSQL);
  console.log('✅ Converted SQL saved to nic_portal_postgres.sql\n');
  
  console.log('🔌 Connecting to Supabase...');
  const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });
  
  const client = await pool.connect();
  
  try {
    console.log('✅ Connected!\n');
    
    console.log('⚠️  Note: This conversion is complex. Let me try a different approach...\n');
    console.log('Instead, I will:');
    console.log('1. Create tables using PostgreSQL schema');
    console.log('2. Extract and import only the data from your MySQL dump\n');
    
    // First create tables
    console.log('📋 Creating tables...');
    const schema = fs.readFileSync('../database/schema-postgresql.sql', 'utf8');
    await client.query(schema);
    console.log('✅ Tables created\n');
    
    console.log('📥 Extracting data from MySQL dump...');
    
    // Extract INSERT statements
    const insertRegex = /INSERT INTO `(\w+)`.*?VALUES\s+(.*?);/gs;
    let match;
    let imported = 0;
    
    while ((match = insertRegex.exec(mysqlDump)) !== null) {
      const tableName = match[1];
      const valuesStr = match[2];
      
      console.log(`Importing ${tableName}...`);
      
      try {
        // Convert MySQL INSERT to PostgreSQL
        let pgInsert = `INSERT INTO ${tableName} VALUES ${valuesStr}`;
        pgInsert = pgInsert.replace(/`/g, '');
        
        await client.query(pgInsert);
        imported++;
      } catch (err) {
        console.log(`  ⚠️  Skipped (${err.message})`);
      }
    }
    
    console.log(`\n✅ Imported ${imported} data sets\n`);
    
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
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

importToSupabase();
