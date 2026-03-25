const { Client } = require('pg');
const fs = require('fs');

const connectionString = 'postgresql://neondb_owner:npg_dEUjtBA5czu4@ep-empty-thunder-a12u9rl9-pooler.ap-southeast-1.aws.neon.tech/neondb';

async function backupDatabase() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('Connected to Neon database...');

    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(`Found ${tables.length} tables:`, tables);

    let sqlContent = '-- Full Database Backup\n';
    sqlContent += `-- Generated: ${new Date().toISOString()}\n\n`;

    // Get schema for each table
    for (const table of tables) {
      console.log(`Backing up table: ${table}`);
      
      // Get CREATE TABLE statement
      const schemaResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);

      sqlContent += `\n-- Table: ${table}\n`;
      sqlContent += `DROP TABLE IF EXISTS "${table}" CASCADE;\n`;
      sqlContent += `CREATE TABLE "${table}" (\n`;

      const columns = schemaResult.rows;
      columns.forEach((col, idx) => {
        let colDef = `  "${col.column_name}" ${col.data_type}`;
        if (col.column_default) colDef += ` DEFAULT ${col.column_default}`;
        if (col.is_nullable === 'NO') colDef += ` NOT NULL`;
        if (idx < columns.length - 1) colDef += ',';
        sqlContent += colDef + '\n';
      });
      sqlContent += ');\n';

      // Get data
      const dataResult = await client.query(`SELECT * FROM "${table}"`);
      
      if (dataResult.rows.length > 0) {
        const columnNames = Object.keys(dataResult.rows[0]).map(name => `"${name}"`).join(', ');
        
        dataResult.rows.forEach(row => {
          const values = Object.values(row).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (typeof val === 'boolean') return val ? '1' : '0';
            if (val instanceof Date) return `'${val.toISOString()}'`;
            return val;
          }).join(', ');
          
          sqlContent += `INSERT INTO "${table}" (${columnNames}) VALUES (${values});\n`;
        });
      }
    }

    // Write to file
    fs.writeFileSync('neon-backup-full.sql', sqlContent);
    console.log('\n✅ Backup complete: neon-backup-full.sql');
    console.log(`File size: ${(fs.statSync('neon-backup-full.sql').size / 1024).toFixed(2)} KB`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

backupDatabase();
