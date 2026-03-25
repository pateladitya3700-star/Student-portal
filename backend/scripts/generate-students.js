const bcrypt = require('bcryptjs');
const db = require('../config/database');

// Sample Nepali names
const firstNames = [
  'Aarav', 'Aayush', 'Anish', 'Bibek', 'Bishal', 'Dipesh', 'Kiran', 'Manish', 'Nabin', 'Prakash',
  'Rajesh', 'Rohan', 'Sagar', 'Sandesh', 'Suraj', 'Aashish', 'Bikash', 'Dinesh', 'Krishna', 'Ramesh',
  'Akriti', 'Anjali', 'Anita', 'Binita', 'Diksha', 'Kabita', 'Kritika', 'Manisha', 'Nisha', 'Pooja',
  'Priya', 'Rina', 'Sabina', 'Sita', 'Sunita', 'Aarti', 'Bina', 'Gita', 'Kamala', 'Radha'
];

const lastNames = [
  'Sharma', 'Thapa', 'Shrestha', 'Gurung', 'Tamang', 'Rai', 'Limbu', 'Magar', 'Karki', 'Adhikari',
  'Poudel', 'Khadka', 'Bhattarai', 'Pandey', 'Ghimire', 'Subedi', 'Regmi', 'Bhandari', 'Acharya', 'Koirala'
];

const guardianNames = [
  'Ram Bahadur', 'Shyam Kumar', 'Hari Prasad', 'Krishna Bahadur', 'Gopal Singh',
  'Mohan Lal', 'Sohan Kumar', 'Rajan Singh', 'Kiran Bahadur', 'Suresh Kumar',
  'Mahesh Prasad', 'Naresh Bahadur', 'Rajendra Kumar', 'Surendra Singh', 'Devendra Lal'
];

const addresses = [
  'Birgunj-1', 'Birgunj-2', 'Birgunj-3', 'Birgunj-4', 'Birgunj-5',
  'Birgunj-6', 'Birgunj-7', 'Birgunj-8', 'Birgunj-9', 'Birgunj-10',
  'Birgunj-11', 'Birgunj-12', 'Birgunj-13', 'Birgunj-14', 'Birgunj-15'
];

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generatePhone() {
  return '98' + Math.floor(10000000 + Math.random() * 90000000);
}

async function generateStudents() {
  try {
    console.log('🎓 Generating 200 students...\n');

    const password = await bcrypt.hash('Student@123', 10);
    let studentCount = 0;
    let userIdStart = 4; // Starting after admin, faculty, and demo student

    // Generate for Class 11 and 12
    for (const classNum of ['11', '12']) {
      console.log(`\n📚 Generating Class ${classNum} students...`);
      
      // Generate for sections A, B, C, D, E
      for (const section of ['A', 'B', 'C', 'D', 'E']) {
        console.log(`  Section ${section}:`);
        
        // Generate 20 students per section
        for (let roll = 1; roll <= 20; roll++) {
          const firstName = getRandomItem(firstNames);
          const lastName = getRandomItem(lastNames);
          const studentId = `NIC${classNum}${section}${String(roll).padStart(2, '0')}`;
          const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${studentId.toLowerCase()}@nic.edu.np`;
          const phone = generatePhone();
          const address = getRandomItem(addresses);
          const guardianName = `${getRandomItem(guardianNames)} ${lastName}`;
          const guardianPhone = generatePhone();
          const enrollmentDate = '2024-01-15';

          // Insert user
          const [userResult] = await db.query(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [email, password, 'student']
          );

          const userId = userResult.insertId;

          // Insert student
          await db.query(
            `INSERT INTO students (user_id, student_id, first_name, last_name, phone, address, 
                                   class, section, roll_number, guardian_name, guardian_phone, enrollment_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, studentId, firstName, lastName, phone, address, classNum, section, roll, 
             guardianName, guardianPhone, enrollmentDate]
          );

          studentCount++;
          process.stdout.write(`    Roll ${roll}: ${firstName} ${lastName} (${studentId})\n`);
        }
      }
    }

    console.log(`\n✅ Successfully generated ${studentCount} students!`);
    console.log(`\n📊 Summary:`);
    console.log(`   Class 11: 100 students (5 sections × 20 students)`);
    console.log(`   Class 12: 100 students (5 sections × 20 students)`);
    console.log(`   Total: 200 students`);
    console.log(`\n🔑 All students can login with password: Student@123`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating students:', error);
    process.exit(1);
  }
}

generateStudents();
