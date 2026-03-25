const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = 'SELECT id, email, role, is_active, created_at FROM users';
    const params = [];
    
    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }
    
    const [users] = await db.query(query, params);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const { email, password, role, profileData } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );
    
    const userId = result.insertId;
    
    // Insert profile based on role
    if (role === 'student') {
      await db.query(
        `INSERT INTO students (user_id, student_id, first_name, last_name, 
                               phone, address, class, section, roll_number, 
                               guardian_name, guardian_phone, enrollment_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, profileData.studentId, profileData.firstName, profileData.lastName,
         profileData.phone, profileData.address, profileData.class, 
         profileData.section, profileData.rollNumber, profileData.guardianName,
         profileData.guardianPhone, profileData.enrollmentDate]
      );
    } else if (role === 'faculty') {
      await db.query(
        `INSERT INTO faculty (user_id, faculty_id, first_name, last_name, 
                              phone, department, specialization)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, profileData.facultyId, profileData.firstName, profileData.lastName,
         profileData.phone, profileData.department, profileData.specialization]
      );
    }
    
    res.status(201).json({ message: 'User created successfully', userId });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user role and status
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    // Get current user data
    const [currentUser] = await db.query('SELECT role FROM users WHERE id = ?', [id]);
    
    if (currentUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user role and status
    await db.query(
      'UPDATE users SET role = ?, is_active = ? WHERE id = ?',
      [role, isActive, id]
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [studentCount] = await db.query('SELECT COUNT(*) as count FROM students');
    const [facultyCount] = await db.query('SELECT COUNT(*) as count FROM faculty');
    const [courseCount] = await db.query('SELECT COUNT(*) as count FROM courses');
    
    let avgAttendance = 0;
    try {
      const [attendanceStats] = await db.query(
        `SELECT 
          AVG(CASE WHEN status = 'present' THEN 100 ELSE 0 END) as avg_attendance
         FROM attendance 
         WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`
      );
      avgAttendance = parseFloat(attendanceStats[0]?.avg_attendance || 0).toFixed(2);
    } catch (err) {
      console.log('Attendance query failed, using 0');
    }
    
    res.json({
      students: studentCount[0].count,
      faculty: facultyCount[0].count,
      courses: courseCount[0].count,
      avgAttendance: avgAttendance
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all students
exports.getStudents = async (req, res) => {
  try {
    const [students] = await db.query(
      `SELECT s.*, u.email 
       FROM students s
       JOIN users u ON s.user_id = u.id
       ORDER BY s.class, s.section, s.roll_number`
    );
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all faculty
exports.getFaculty = async (req, res) => {
  try {
    const [faculty] = await db.query(
      `SELECT f.*, u.email, u.is_active, u.created_at
       FROM faculty f
       JOIN users u ON f.user_id = u.id
       ORDER BY f.department, f.first_name`
    );
    res.json(faculty);
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update faculty
exports.updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, profileData } = req.body;

    // Get faculty's user_id
    const [faculty] = await db.query('SELECT user_id FROM faculty WHERE id = ?', [id]);
    
    if (faculty.length === 0) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    const userId = faculty[0].user_id;

    // Update email if provided
    if (email) {
      await db.query('UPDATE users SET email = ? WHERE id = ?', [email, userId]);
    }

    // Update faculty profile
    await db.query(
      `UPDATE faculty 
       SET first_name = ?, last_name = ?, phone = ?,
           department = ?, specialization = ?
       WHERE id = ?`,
      [
        profileData.firstName,
        profileData.lastName,
        profileData.phone,
        profileData.department,
        profileData.specialization,
        id
      ]
    );

    res.json({ message: 'Faculty updated successfully' });
  } catch (error) {
    console.error('Update faculty error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete faculty
exports.deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    // Get faculty's user_id
    const [faculty] = await db.query('SELECT user_id FROM faculty WHERE id = ?', [id]);
    
    if (faculty.length === 0) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Delete user (will cascade delete faculty due to foreign key)
    await db.query('DELETE FROM users WHERE id = ?', [faculty[0].user_id]);

    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    console.error('Delete faculty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, profileData } = req.body;

    console.log('Update student request:', { id, email, profileData });

    // Get student's user_id
    const [student] = await db.query('SELECT user_id FROM students WHERE id = ?', [id]);
    
    if (student.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const userId = student[0].user_id;

    // Update email if provided
    if (email) {
      await db.query('UPDATE users SET email = ? WHERE id = ?', [email, userId]);
    }

    // Update student profile (excluding student_id as it shouldn't change)
    await db.query(
      `UPDATE students 
       SET first_name = ?, last_name = ?, phone = ?, address = ?,
           class = ?, section = ?, roll_number = ?,
           guardian_name = ?, guardian_phone = ?
       WHERE id = ?`,
      [
        profileData.firstName,
        profileData.lastName,
        profileData.phone,
        profileData.address,
        profileData.class,
        profileData.section,
        profileData.rollNumber,
        profileData.guardianName,
        profileData.guardianPhone,
        id
      ]
    );

    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Get student's user_id
    const [student] = await db.query('SELECT user_id FROM students WHERE id = ?', [id]);
    
    if (student.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete user (will cascade delete student due to foreign key)
    await db.query('DELETE FROM users WHERE id = ?', [student[0].user_id]);

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get attendance report
exports.getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, class: classNum } = req.query;
    
    let query = `
      SELECT s.student_id, s.first_name, s.last_name, s.class, s.section,
             COUNT(*) as total_classes,
             SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present,
             ROUND((SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as percentage
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.date BETWEEN ? AND ?
    `;
    
    const params = [startDate, endDate];
    
    if (classNum) {
      query += ' AND s.class = ?';
      params.push(classNum);
    }
    
    query += ' GROUP BY s.id ORDER BY percentage DESC';
    
    const [report] = await db.query(query, params);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get performance report
exports.getPerformanceReport = async (req, res) => {
  try {
    const { class: classNum, examType } = req.query;
    
    let query = `
      SELECT s.student_id, s.first_name, s.last_name, s.class, s.section,
             c.name as course_name,
             AVG((r.marks_obtained / r.total_marks) * 100) as avg_percentage
      FROM results r
      JOIN students s ON r.student_id = s.id
      JOIN subjects sub ON r.subject_id = sub.id
      JOIN courses c ON sub.course_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (classNum) {
      query += ' AND s.class = ?';
      params.push(classNum);
    }
    
    if (examType) {
      query += ' AND r.exam_type = ?';
      params.push(examType);
    }
    
    query += ' GROUP BY s.id, c.id ORDER BY avg_percentage DESC';
    
    const [report] = await db.query(query, params);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all courses/subjects
exports.getCourses = async (req, res) => {
  try {
    const { class: classNum } = req.query;
    let query = 'SELECT * FROM courses';
    const params = [];
    
    if (classNum) {
      query += ' WHERE class = ?';
      params.push(classNum);
    }
    
    query += ' ORDER BY class, name';
    
    const [courses] = await db.query(query, params);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new course/subject
exports.createCourse = async (req, res) => {
  try {
    const { code, name, class: classNum, credits, description } = req.body;
    
    // Check if course code already exists
    const [existing] = await db.query('SELECT id FROM courses WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Course code already exists' });
    }
    
    const [result] = await db.query(
      `INSERT INTO courses (code, name, class, credits, description)
       VALUES (?, ?, ?, ?, ?)`,
      [code, name, classNum, credits, description]
    );
    
    res.status(201).json({ 
      message: 'Course created successfully',
      courseId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update course/subject
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, class: classNum, credits, description } = req.body;
    
    await db.query(
      `UPDATE courses 
       SET code = ?, name = ?, class = ?, credits = ?, description = ?
       WHERE id = ?`,
      [code, name, classNum, credits, description, id]
    );
    
    res.json({ message: 'Course updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete course/subject
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('DELETE FROM courses WHERE id = ?', [id]);
    
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================
// FEE MANAGEMENT
// ============================================

// Get all fee records
exports.getAllFees = async (req, res) => {
  try {
    const { status, academicYear, studentId } = req.query;
    
    let query = `
      SELECT 
        fp.*,
        s.first_name,
        s.last_name,
        s.class,
        s.section,
        s.roll_number,
        u.email
      FROM fee_payments fp
      JOIN students s ON fp.student_id = s.student_id
      JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND fp.status = ?';
      params.push(status);
    }
    
    if (academicYear) {
      query += ' AND fp.academic_year = ?';
      params.push(academicYear);
    }
    
    if (studentId) {
      query += ' AND fp.student_id = ?';
      params.push(studentId);
    }
    
    query += ' ORDER BY fp.created_at DESC';
    
    const [fees] = await db.query(query, params);
    res.json(fees);
  } catch (error) {
    console.error('Get fees error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get fee statistics
exports.getFeeStats = async (req, res) => {
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
    
    // Convert string values to numbers
    const result = {
      total_records: parseInt(stats[0].total_records) || 0,
      total_fee_amount: parseFloat(stats[0].total_fee_amount) || 0,
      total_paid: parseFloat(stats[0].total_paid) || 0,
      total_due: parseFloat(stats[0].total_due) || 0,
      paid_count: parseInt(stats[0].paid_count) || 0,
      partial_count: parseInt(stats[0].partial_count) || 0,
      pending_count: parseInt(stats[0].pending_count) || 0,
      overdue_count: parseInt(stats[0].overdue_count) || 0
    };
    
    res.json(result);
  } catch (error) {
    console.error('Get fee stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create fee record
exports.createFeeRecord = async (req, res) => {
  try {
    const {
      studentId,
      academicYear,
      semester,
      totalFee,
      paidAmount,
      paymentDate,
      paymentMethod,
      transactionId,
      remarks
    } = req.body;
    
    // Verify student exists
    const [student] = await db.query(
      'SELECT student_id FROM students WHERE student_id = ?',
      [studentId]
    );
    
    if (student.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const dueAmount = totalFee - (paidAmount || 0);
    let status = 'pending';
    
    if (paidAmount >= totalFee) {
      status = 'paid';
    } else if (paidAmount > 0) {
      status = 'partial';
    }
    
    const [result] = await db.query(
      `INSERT INTO fee_payments 
       (student_id, academic_year, semester, total_fee, paid_amount, due_amount,
        payment_date, payment_method, transaction_id, status, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        academicYear,
        semester,
        totalFee,
        paidAmount || 0,
        dueAmount,
        paymentDate || null,
        paymentMethod || null,
        transactionId || null,
        status,
        remarks || null
      ]
    );
    
    res.status(201).json({
      message: 'Fee record created successfully',
      feeId: result.insertId
    });
  } catch (error) {
    console.error('Create fee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update fee record
exports.updateFeeRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      totalFee,
      paidAmount,
      paymentDate,
      paymentMethod,
      transactionId,
      remarks
    } = req.body;
    
    const dueAmount = totalFee - paidAmount;
    let status = 'pending';
    
    if (paidAmount >= totalFee) {
      status = 'paid';
    } else if (paidAmount > 0) {
      status = 'partial';
    }
    
    await db.query(
      `UPDATE fee_payments 
       SET total_fee = ?, paid_amount = ?, due_amount = ?,
           payment_date = ?, payment_method = ?, transaction_id = ?,
           status = ?, remarks = ?
       WHERE id = ?`,
      [
        totalFee,
        paidAmount,
        dueAmount,
        paymentDate || null,
        paymentMethod || null,
        transactionId || null,
        status,
        remarks || null,
        id
      ]
    );
    
    res.json({ message: 'Fee record updated successfully' });
  } catch (error) {
    console.error('Update fee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete fee record
exports.deleteFeeRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('DELETE FROM fee_payments WHERE id = ?', [id]);
    
    res.json({ message: 'Fee record deleted successfully' });
  } catch (error) {
    console.error('Delete fee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
