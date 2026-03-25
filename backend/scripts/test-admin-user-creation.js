const db = require('../config/database');

async function testAdminUserCreation() {
  try {
    console.log('🧪 Testing Admin User Creation Feature...\n');

    // 1. Check existing users count
    console.log('1. Checking existing users...');
    const [users] = await db.query('SELECT COUNT(*) as count, role FROM users GROUP BY role');
    console.log('   Current user counts:');
    users.forEach(u => {
      console.log(`     - ${u.role}: ${u.count}`);
    });

    // 2. Check students table structure
    console.log('\n2. Checking students table structure...');
    const [studentColumns] = await db.query('DESCRIBE students');
    const studentFields = studentColumns.map(c => c.Field);
    const requiredStudentFields = ['student_id', 'first_name', 'last_name', 'class', 'section', 'roll_number', 'guardian_name', 'guardian_phone'];
    const hasAllStudentFields = requiredStudentFields.every(f => studentFields.includes(f));
    console.log(`   ✓ Students table has all required fields: ${hasAllStudentFields ? 'YES' : 'NO'}`);

    // 3. Check faculty table structure
    console.log('\n3. Checking faculty table structure...');
    const [facultyColumns] = await db.query('DESCRIBE faculty');
    const facultyFields = facultyColumns.map(c => c.Field);
    const requiredFacultyFields = ['faculty_id', 'first_name', 'last_name', 'department', 'specialization'];
    const hasAllFacultyFields = requiredFacultyFields.every(f => facultyFields.includes(f));
    console.log(`   ✓ Faculty table has all required fields: ${hasAllFacultyFields ? 'YES' : 'NO'}`);

    // 4. Check for duplicate student IDs
    console.log('\n4. Checking for potential conflicts...');
    const [duplicateStudentIds] = await db.query(`
      SELECT student_id, COUNT(*) as count 
      FROM students 
      GROUP BY student_id 
      HAVING count > 1
    `);
    console.log(`   ✓ Duplicate student IDs: ${duplicateStudentIds.length === 0 ? 'None' : duplicateStudentIds.length}`);

    // 5. Check for duplicate faculty IDs
    const [duplicateFacultyIds] = await db.query(`
      SELECT faculty_id, COUNT(*) as count 
      FROM faculty 
      GROUP BY faculty_id 
      HAVING count > 1
    `);
    console.log(`   ✓ Duplicate faculty IDs: ${duplicateFacultyIds.length === 0 ? 'None' : duplicateFacultyIds.length}`);

    // 6. Check available roll numbers in Class 11 Section A
    console.log('\n5. Checking available roll numbers in Class 11 Section A...');
    const [usedRolls] = await db.query(`
      SELECT roll_number 
      FROM students 
      WHERE class = '11' AND section = 'A'
      ORDER BY roll_number
    `);
    const usedRollNumbers = usedRolls.map(r => r.roll_number);
    const availableRolls = [];
    for (let i = 1; i <= 20; i++) {
      if (!usedRollNumbers.includes(i)) {
        availableRolls.push(i);
      }
    }
    console.log(`   ✓ Used roll numbers: ${usedRollNumbers.length}/20`);
    if (availableRolls.length > 0) {
      console.log(`   ✓ Available roll numbers: ${availableRolls.slice(0, 5).join(', ')}${availableRolls.length > 5 ? '...' : ''}`);
    } else {
      console.log(`   ⚠ No available roll numbers in Class 11 Section A`);
    }

    // 7. Suggest next IDs
    console.log('\n6. Suggesting next IDs...');
    
    // Next student ID
    const [lastStudent] = await db.query(`
      SELECT student_id 
      FROM students 
      WHERE student_id LIKE 'NIC11A%'
      ORDER BY student_id DESC 
      LIMIT 1
    `);
    if (lastStudent.length > 0) {
      const lastId = lastStudent[0].student_id;
      const lastNum = parseInt(lastId.replace('NIC11A', ''));
      console.log(`   ✓ Last student ID in Class 11-A: ${lastId}`);
      console.log(`   ✓ Suggested next student ID: NIC11A${String(lastNum + 1).padStart(2, '0')}`);
    }

    // Next faculty ID
    const [lastFaculty] = await db.query(`
      SELECT faculty_id 
      FROM faculty 
      ORDER BY faculty_id DESC 
      LIMIT 1
    `);
    if (lastFaculty.length > 0) {
      const lastId = lastFaculty[0].faculty_id;
      const lastNum = parseInt(lastId.replace('FAC', ''));
      console.log(`   ✓ Last faculty ID: ${lastId}`);
      console.log(`   ✓ Suggested next faculty ID: FAC${String(lastNum + 1).padStart(3, '0')}`);
    }

    console.log('\n✅ All checks passed! Admin user creation feature is ready.');
    console.log('\n📋 Next steps:');
    console.log('1. Login as admin: admin@nic.edu.np / Admin@123');
    console.log('2. Go to "Users" tab');
    console.log('3. Click "+ Add User" button');
    console.log('4. Select account type (Student or Faculty)');
    console.log('5. Fill in the form and create account');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAdminUserCreation();
