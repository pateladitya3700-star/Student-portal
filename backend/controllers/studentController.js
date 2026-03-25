const db = require('../config/database');

// Get student profile
exports.getProfile = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, u.email FROM students s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get enrolled courses
exports.getCourses = async (req, res) => {
  try {
    const student = await db.query('SELECT id, class FROM students WHERE user_id = $1', [req.user.id]);
    
    if (student.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get all courses for the student's class
    const courses = await db.query(
      `SELECT c.* 
       FROM courses c
       WHERE c.class = $1
       ORDER BY c.name`,
      [student.rows[0].class]
    );

    res.json(courses.rows || []);
  } catch (error) {
    console.error('Get courses error:', error);
    // Return empty array instead of error for better UX
    res.json([]);
  }
};

// Get attendance
exports.getAttendance = async (req, res) => {
  try {
    const student = await db.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    
    if (student.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const attendance = await db.query(
      `SELECT a.*, c.name as course_name, c.code as course_code
       FROM attendance a
       JOIN courses c ON a.course_id = c.id
       WHERE a.student_id = $1
       ORDER BY a."DATE" DESC`,
      [student.rows[0].id]
    );

    // Calculate attendance percentage
    const stats = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
       FROM attendance WHERE student_id = $1`,
      [student.rows[0].id]
    );

    const percentage = stats.rows[0].total > 0 
      ? ((stats.rows[0].present / stats.rows[0].total) * 100).toFixed(2)
      : 0;

    res.json({
      attendance: attendance.rows || [],
      stats: {
        total: parseInt(stats.rows[0].total) || 0,
        present: parseInt(stats.rows[0].present) || 0,
        percentage
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    // Return empty data instead of error
    res.json({
      attendance: [],
      stats: { total: 0, present: 0, percentage: 0 }
    });
  }
};

// Get results
exports.getResults = async (req, res) => {
  try {
    const student = await db.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    
    if (student.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const results = await db.query(
      `SELECT r.*, c.name as course_name, c.code as course_code
       FROM results r
       JOIN courses c ON r.course_id = c.id
       WHERE r.student_id = $1
       ORDER BY r.exam_type, c.name`,
      [student.rows[0].id]
    );

    res.json(results.rows || []);
  } catch (error) {
    console.error('Get results error:', error);
    // Return empty array instead of error
    res.json([]);
  }
};

// Get notifications
exports.getNotifications = async (req, res) => {
  try {
    const student = await db.query('SELECT class FROM students WHERE user_id = $1', [req.user.id]);
    
    const notifications = await db.query(
      `SELECT * FROM notifications 
       WHERE is_active = 1 
       AND (target_role IN ('all', 'student'))
       AND (target_program = 'all' OR target_program = $1)
       ORDER BY created_at DESC
       LIMIT 20`,
      [student.rows[0]?.class || 'all']
    );

    res.json(notifications.rows || []);
  } catch (error) {
    console.error('Get notifications error:', error);
    // Return empty array instead of error
    res.json([]);
  }
};

// Get fee history
exports.getFeeHistory = async (req, res) => {
  try {
    const student = await db.query(
      'SELECT student_id FROM students WHERE user_id = $1',
      [req.user.id]
    );
    
    if (student.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const feeHistory = await db.query(
      `SELECT * FROM fee_payments 
       WHERE student_id = $1
       ORDER BY created_at DESC`,
      [student.rows[0].student_id]
    );

    // Calculate total statistics
    const stats = await db.query(
      `SELECT 
        SUM(total_fee) as total_fee,
        SUM(paid_amount) as total_paid,
        SUM(due_amount) as total_due
       FROM fee_payments 
       WHERE student_id = $1`,
      [student.rows[0].student_id]
    );

    res.json({
      feeHistory: feeHistory.rows || [],
      stats: {
        totalFee: parseFloat(stats.rows[0]?.total_fee || 0),
        totalPaid: parseFloat(stats.rows[0]?.total_paid || 0),
        totalDue: parseFloat(stats.rows[0]?.total_due || 0)
      }
    });
  } catch (error) {
    console.error('Get fee history error:', error);
    res.json({
      feeHistory: [],
      stats: { totalFee: 0, totalPaid: 0, totalDue: 0 }
    });
  }
};
