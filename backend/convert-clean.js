const fs = require('fs');
const path = require('path');

console.log('📖 Reading MySQL dump...');
let content = fs.readFileSync(path.join(__dirname, 'nic_portal.sql'), 'utf8');

console.log('🔄 Converting to PostgreSQL...');

// 1. Remove MySQL-specific syntax
content = content.replace(/^SET .*?;/gm, '');
content = content.replace(/^\/\*!.*?\*\/;?/gm, '');
content = content.replace(/^START TRANSACTION;/gm, '');

// 2. Convert backticks to double quotes
content = content.replace(/`/g, '"');

// 3. Convert data types
content = content.replace(/\bint\(11\)\b/gi, 'INTEGER');
content = content.replace(/\bint\(/gi, 'INTEGER');
content = content.replace(/\bint\b/gi, 'INTEGER');
content = content.replace(/\btinyint\(/gi, 'INTEGER');
content = content.replace(/\bvarchar\(/gi, 'VARCHAR(');
content = content.replace(/\btext\b/gi, 'TEXT');
content = content.replace(/\bdate\b/gi, 'DATE');
content = content.replace(/\btimestamp\b/gi, 'TIMESTAMP');
content = content.replace(/\bdecimal\(/gi, 'DECIMAL(');
content = content.replace(/\benum\(/gi, 'VARCHAR(');

// 4. Remove MySQL table options
content = content.replace(/\s+ENGINE=.*?;/gi, ';');
content = content.replace(/\s+DEFAULT CHARSET=.*?;/gi, ';');
content = content.replace(/\s+COLLATE=.*?;/gi, ';');

// 5. Convert ENUM values to VARCHAR
content = content.replace(/VARCHAR\('([^']+(?:','[^']+)*)'\)/g, 'VARCHAR(50)');

// 6. Fix current_timestamp
content = content.replace(/current_timestamp\(\)/gi, 'CURRENT_TIMESTAMP');
content = content.replace(/\s+ON UPDATE CURRENT_TIMESTAMP/gi, '');

// 7. REMOVE ALL ALTER TABLE ADD KEY/INDEX/PRIMARY KEY statements
// This is the key fix - just delete these lines entirely
content = content.replace(/^ALTER TABLE.*?ADD (?:PRIMARY KEY|UNIQUE KEY|KEY|INDEX|CONSTRAINT).*?;$/gm, '');

// 8. Keep only FOREIGN KEY constraints
// (they're in separate ALTER TABLE statements)

// 9. Clean up extra blank lines
content = content.replace(/\n\n\n+/g, '\n\n');

// 10. Add header
const header = `-- NIC Portal Full Production Database
-- Converted from MySQL to PostgreSQL
-- Generated: ${new Date().toISOString()}

`;

content = header + content;

// Write output
const outputPath = path.join(__dirname, 'nic_portal_full_production.sql');
fs.writeFileSync(outputPath, content);

const fileSize = fs.statSync(outputPath).size;
console.log(`\n✅ Conversion complete!`);
console.log(`📁 File: ${outputPath}`);
console.log(`📊 Size: ${(fileSize / 1024).toFixed(2)} KB`);
console.log(`\n📋 Ready to import into Neon!`);
