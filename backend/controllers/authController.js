const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = 1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, role, profileData } = req.body;

    console.log('Registration request received:', { email, role, profileData });

    // Validate input
    if (!email || !password || !role || !profileData) {
      console.log('Validation failed: Missing fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate role
    if (!['student', 'faculty'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Only student and faculty can register.' });
    }

    // Check if user already exists
    const existingResult = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await db.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, role]
    );

    const userId = result.rows[0].id;

    // Insert profile based on role
    if (role === 'student') {
      const { studentId, firstName, lastName, phone, address, class: studentClass, section, rollNumber, guardianName, guardianPhone, enrollmentDate } = profileData;
      
      // Check if student ID already exists
      const existingStudent = await db.query(
        'SELECT id FROM students WHERE student_id = $1',
        [studentId]
      );

      if (existingStudent.rows.length > 0) {
        // Rollback user creation
        await db.query('DELETE FROM users WHERE id = $1', [userId]);
        return res.status(400).json({ message: 'Student ID already exists' });
      }

      // Check if class/section/roll combination already exists
      const existingRoll = await db.query(
        'SELECT id FROM students WHERE class = $1 AND section = $2 AND roll_number = $3',
        [studentClass, section, rollNumber]
      );

      if (existingRoll.rows.length > 0) {
        // Rollback user creation
        await db.query('DELETE FROM users WHERE id = $1', [userId]);
        return res.status(400).json({ message: 'Roll number already taken in this class and section' });
      }

      await db.query(
        `INSERT INTO students (user_id, student_id, first_name, last_name, 
                               phone, address, class, section, roll_number, 
                               guardian_name, guardian_phone, enrollment_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [userId, studentId, firstName, lastName, phone, address, studentClass, section, rollNumber, guardianName, guardianPhone, enrollmentDate]
      );
    } else if (role === 'faculty') {
      const { facultyId, firstName, lastName, phone, department, specialization } = profileData;
      
      // Check if faculty ID already exists
      const existingFaculty = await db.query(
        'SELECT id FROM faculty WHERE faculty_id = $1',
        [facultyId]
      );

      if (existingFaculty.rows.length > 0) {
        // Rollback user creation
        await db.query('DELETE FROM users WHERE id = $1', [userId]);
        return res.status(400).json({ message: 'Faculty ID already exists' });
      }

      await db.query(
        `INSERT INTO faculty (user_id, faculty_id, first_name, last_name, 
                              phone, department, specialization)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, facultyId, firstName, lastName, phone, department, specialization || null]
      );
    }

    res.status(201).json({ 
      message: 'Registration successful',
      user: {
        id: userId,
        email,
        role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, role, is_active, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Get current user
    const result = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, req.user.id]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
