-- National Infotech College - PostgreSQL Schema for Supabase
-- This is the PostgreSQL version of the MySQL schema

-- Users table (authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('student', 'faculty', 'admin')) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    class VARCHAR(2) CHECK (class IN ('11', '12')) NOT NULL,
    section VARCHAR(1) CHECK (section IN ('A', 'B', 'C', 'D', 'E')) NOT NULL,
    roll_number INTEGER NOT NULL,
    guardian_name VARCHAR(200),
    guardian_phone VARCHAR(20),
    enrollment_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (class, section, roll_number)
);

-- Faculty table
CREATE TABLE IF NOT EXISTS faculty (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    faculty_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    specialization VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    class VARCHAR(2) CHECK (class IN ('11', '12')) NOT NULL,
    credits INTEGER NOT NULL,
    description TEXT
);

-- Faculty courses junction table (replaces subjects)
CREATE TABLE IF NOT EXISTS faculty_courses (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE (faculty_id, course_id, academic_year)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(10) CHECK (status IN ('present', 'absent', 'late')) NOT NULL,
    marked_by INTEGER,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES faculty(id),
    UNIQUE (student_id, course_id, date)
);

-- Results table
CREATE TABLE IF NOT EXISTS results (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    term VARCHAR(20),
    exam_type VARCHAR(20) CHECK (exam_type IN ('first_term', 'second_term', 'third_term', 'weekly_test', 'assignment')) NOT NULL,
    theory_marks DECIMAL(5,2),
    theory_total DECIMAL(5,2) DEFAULT 60.00,
    practical_marks DECIMAL(5,2),
    practical_total DECIMAL(5,2) DEFAULT 20.00,
    internal_marks DECIMAL(5,2),
    internal_total DECIMAL(5,2) DEFAULT 20.00,
    marks_obtained DECIMAL(5,2) NOT NULL,
    total_marks DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    percentage DECIMAL(5,2),
    grade VARCHAR(5),
    uploaded_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES faculty(id)
);

-- Fee payments table
CREATE TABLE IF NOT EXISTS fee_payments (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    total_fee DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    due_amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('paid', 'partial', 'pending', 'overdue')) DEFAULT 'pending',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('announcement', 'test', 'result', 'general')) NOT NULL,
    target_role VARCHAR(20) CHECK (target_role IN ('all', 'student', 'faculty')) DEFAULT 'all',
    target_program VARCHAR(50) DEFAULT 'all',
    created_by INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
CREATE INDEX IF NOT EXISTS idx_students_section ON students(section);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_results_exam_date ON results(exam_date);
CREATE INDEX IF NOT EXISTS idx_notifications_active ON notifications(is_active);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_status ON fee_payments(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fee_payments_updated_at BEFORE UPDATE ON fee_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
