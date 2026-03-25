const db = require('../config/database');

// Get faculty profile
exports.getProfile = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT f.*, u.email FROM faculty f 
       JOIN users u ON f.user_id = u.id 
       WHERE f.user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Faculty profile not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get assigned courses
exports.getCourses = async (req, res) => {
  try {
    const faculty = await db.query('SELECT id FROM faculty WHERE user_id = $1', [req.user.id]);
    
    if (faculty.rows.length === 0) {
      return res.json([]);
    }

    const courses = await db.query(
      `SELECT c.*, fc.academic_year
       FROM faculty_courses fc
       JOIN courses c ON fc.course_id = c.id
       WHERE fc.faculty_id = $1`,
      [faculty.rows[0].id]
    );

    res.json(courses.rows);
  } catch (error) {
    console.error('Error in getCourses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get students by class and section
exports.getStudentsByClass = async (req, res) => {
  try {
    const { classNum, section } = req.params;
    
    const result = await db.query(
      `SELECT s.id, s.student_id, s.first_name, s.last_name, s.class, s.section, s.roll_number
       FROM students s
       WHERE s.class = $1 AND s.section = $2
       ORDER BY s.roll_number`,
      [classNum, section]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error in getStudentsByClass:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark attendance
exports.markAttendance = async (req, res) => {
  try {
    const { courseId, classNum, section, date, attendanceData } = req.body;
    
    const faculty = await db.query('SELECT id FROM faculty WHERE user_id = $1', [req.user.id]);
    
    if (faculty.rows.length === 0) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Verify faculty is assigned to this course
    const assigned = await db.query(
      'SELECT id FROM faculty_courses WHERE faculty_id = $1 AND course_id = $2',
      [faculty.rows[0].id, courseId]
    );

    if (assigned.rows.length === 0) {
      return res.status(403).json({ message: 'Not authorized to mark attendance for this course' });
    }

    // Insert or update attendance records (PostgreSQL UPSERT)
    for (const record of attendanceData) {
      await db.query(
        `INSERT INTO attendance (student_id, course_id, date, status, marked_by)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (student_id, course_id, date) 
         DO UPDATE SET status = $4, marked_by = $5`,
        [record.studentId, courseId, date, record.status, faculty.rows[0].id]
      );
    }

    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Error in markAttendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get attendance records with filters
exports.getAttendanceRecords = async (req, res) => {
  try {
    const { courseId, classNum, section, date, startDate, endDate } = req.query;
    
    const faculty = await db.query('SELECT id FROM faculty WHERE user_id = $1', [req.user.id]);
    
    if (faculty.rows.length === 0) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    let query = `
      SELECT a.*, s.student_id, s.first_name, s.last_name, s.class, s.section, s.roll_number,
             c.name as course_name, c.code as course_code
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN courses c ON a.course_id = c.id
      WHERE a.marked_by = $1
    `;
    
    const params = [faculty.rows[0].id];
    let paramCount = 2;

    if (courseId) {
      query += ` AND a.course_id = $${paramCount}`;
      params.push(courseId);
      paramCount++;
    }

    if (classNum) {
      query += ` AND s.class = $${paramCount}`;
      params.push(classNum);
      paramCount++;
    }

    if (section) {
      query += ` AND s.section = $${paramCount}`;
      params.push(section);
      paramCount++;
    }

    if (date) {
      query += ` AND a.date = $${paramCount}`;
      params.push(date);
    } else if (startDate && endDate) {
      query += ` AND a.date BETWEEN $${paramCount} AND $${paramCount + 1}`;
      params.push(startDate, endDate);
    }

    query += ' ORDER BY a.date DESC, s.roll_number';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error in getAttendanceRecords:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update attendance record
exports.updateAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { status } = req.body;
    
    const faculty = await db.query('SELECT id FROM faculty WHERE user_id = $1', [req.user.id]);
    
    if (faculty.rows.length === 0) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Verify this attendance record belongs to this faculty
    const attendance = await db.query(
      'SELECT id FROM attendance WHERE id = $1 AND marked_by = $2',
      [attendanceId, faculty.rows[0].id]
    );

    if (attendance.rows.length === 0) {
      return res.status(403).json({ message: 'Not authorized to update this attendance record' });
    }

    await db.query(
      'UPDATE attendance SET status = $1 WHERE id = $2',
      [status, attendanceId]
    );

    res.json({ message: 'Attendance updated successfully' });
  } catch (error) {
    console.error('Error in updateAttendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload grades
exports.uploadGrades = async (req, res) => {
  try {
    const { subjectId, examType, examDate, grades } = req.body;
    
    const faculty = await db.query('SELECT id FROM faculty WHERE user_id = $1', [req.user.id]);
    
    for (const grade of grades) {
      await db.query(
        `INSERT INTO results (student_id, subject_id, exam_type, exam_date, 
                             marks_obtained, total_marks, remarks, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [grade.studentId, subjectId, examType, examDate, grade.marksObtained, 
         grade.totalMarks, grade.remarks || null, faculty.rows[0].id]
      );
    }

    res.json({ message: 'Grades uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get attendance summary for export
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { courseId, classNum, section } = req.query;
    
    const faculty = await db.query('SELECT id FROM faculty WHERE user_id = $1', [req.user.id]);
    
    if (faculty.rows.length === 0) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Verify faculty is assigned to this course
    const assigned = await db.query(
      'SELECT id FROM faculty_courses WHERE faculty_id = $1 AND course_id = $2',
      [faculty.rows[0].id, courseId]
    );

    if (assigned.rows.length === 0) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get attendance summary
    const summary = await db.query(`
      SELECT 
        s.student_id,
        s.first_name,
        s.last_name,
        s.roll_number,
        COUNT(a.id) as total_days,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_days,
        ROUND((SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(a.id), 0)) * 100, 2) as percentage
      FROM students s
      LEFT JOIN attendance a ON s.id = a.student_id AND a.course_id = $1
      WHERE s.class = $2 AND s.section = $3
      GROUP BY s.id
      ORDER BY s.roll_number
    `, [courseId, classNum, section]);

    res.json(summary.rows);
  } catch (error) {
    console.error('Error in getAttendanceSummary:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get results analysis for a class/section
exports.getResultsAnalysis = async (req, res) => {
  try {
    const { courseId, classNum, section, term } = req.query;
    
    const faculty = await db.query('SELECT id FROM faculty WHERE user_id = $1', [req.user.id]);
    
    if (faculty.rows.length === 0) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Get results analysis
    const results = await db.query(`
      SELECT 
        s.student_id,
        s.first_name,
        s.last_name,
        s.roll_number,
        r.term,
        r.theory_marks,
        r.practical_marks,
        r.total_marks,
        r.percentage,
        r.grade
      FROM students s
      LEFT JOIN results r ON s.id = r.student_id AND r.course_id = $1 AND r.term = $2
      WHERE s.class = $3 AND s.section = $4
      ORDER BY s.roll_number
    `, [courseId, term, classNum, section]);

    // Calculate grade distribution
    const gradeDistribution = {
      'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'F': 0, 'N/A': 0
    };

    results.rows.forEach(r => {
      if (r.grade) {
        gradeDistribution[r.grade]++;
      } else {
        gradeDistribution['N/A']++;
      }
    });

    res.json({
      students: results.rows,
      gradeDistribution
    });
  } catch (error) {
    console.error('Error in getResultsAnalysis:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload marks for students
exports.uploadMarks = async (req, res) => {
  try {
    const { courseId, classNum, section, term, marks } = req.body;
    
    const faculty = await db.query('SELECT id FROM faculty WHERE user_id = $1', [req.user.id]);
    
    if (faculty.rows.length === 0) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Verify faculty is assigned to this course
    const assigned = await db.query(
      'SELECT id FROM faculty_courses WHERE faculty_id = $1 AND course_id = $2',
      [faculty.rows[0].id, courseId]
    );

    if (assigned.rows.length === 0) {
      return res.status(403).json({ message: 'Not authorized to upload marks for this course' });
    }

    // Calculate grade based on percentage
    const getGrade = (percentage) => {
      if (percentage >= 90) return 'A+';
      if (percentage >= 80) return 'A';
      if (percentage >= 70) return 'B+';
      if (percentage >= 60) return 'B';
      if (percentage >= 50) return 'C+';
      if (percentage >= 40) return 'C';
      return 'F';
    };

    // Insert or update marks (PostgreSQL UPSERT)
    for (const mark of marks) {
      const totalMarks = parseFloat(mark.theoryMarks) + parseFloat(mark.practicalMarks);
      const percentage = totalMarks;
      const grade = getGrade(percentage);

      await db.query(`
        INSERT INTO results (student_id, course_id, term, theory_marks, practical_marks, total_marks, percentage, grade, uploaded_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (student_id, course_id, term) 
        DO UPDATE SET 
          theory_marks = $4, 
          practical_marks = $5, 
          total_marks = $6, 
          percentage = $7, 
          grade = $8,
          uploaded_by = $9
      `, [
        mark.studentId, courseId, term, mark.theoryMarks, mark.practicalMarks, totalMarks, percentage, grade, faculty.rows[0].id
      ]);
    }

    res.json({ message: 'Marks uploaded successfully' });
  } catch (error) {
    console.error('Error in uploadMarks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send announcement
exports.sendAnnouncement = async (req, res) => {
  try {
    const { title, message, type, targetProgram } = req.body;
    
    await db.query(
      `INSERT INTO notifications (title, message, type, target_role, target_program, created_by)
       VALUES ($1, $2, $3, 'student', $4, $5)`,
      [title, message, type, targetProgram || 'all', req.user.id]
    );

    res.json({ message: 'Announcement sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
