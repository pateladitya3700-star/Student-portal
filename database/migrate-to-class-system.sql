-- Migration script to convert from program/semester to class/section system
-- For +2 Science only with Class 11 and 12

USE nic_portal;

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Drop dependent tables first
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS subjects;

-- Drop and recreate students table
DROP TABLE IF EXISTS students;
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    class ENUM('11', '12') NOT NULL,
    section ENUM('A', 'B', 'C', 'D', 'E') NOT NULL,
    roll_number INT NOT NULL,
    enrollment_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_class_section_roll (class, section, roll_number)
);

-- Drop and recreate courses table
DROP TABLE IF EXISTS courses;
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    class ENUM('11', '12') NOT NULL,
    credits INT NOT NULL,
    description TEXT
);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Create indexes
CREATE INDEX idx_students_class ON students(class);
CREATE INDEX idx_students_section ON students(section);

-- Insert courses for Class 11
INSERT INTO courses (code, name, class, credits, description) VALUES
('PHY11', 'Physics', '11', 4, 'Mechanics and Thermodynamics'),
('CHEM11', 'Chemistry', '11', 4, 'Physical and Inorganic Chemistry'),
('BIO11', 'Biology', '11', 4, 'Cell Biology and Genetics'),
('MATH11', 'Mathematics', '11', 5, 'Calculus and Algebra'),
('CS11', 'Computer Science', '11', 3, 'Introduction to Programming'),
('ENG11', 'English', '11', 3, 'English Language and Literature'),
('NEP11', 'Nepali', '11', 3, 'Nepali Language and Literature');

-- Insert courses for Class 12
INSERT INTO courses (code, name, class, credits, description) VALUES
('PHY12', 'Physics', '12', 4, 'Electromagnetism and Modern Physics'),
('CHEM12', 'Chemistry', '12', 4, 'Organic and Physical Chemistry'),
('BIO12', 'Biology', '12', 4, 'Genetics and Evolution'),
('MATH12', 'Mathematics', '12', 5, 'Advanced Calculus and Statistics'),
('CS12', 'Computer Science', '12', 3, 'Data Structures and Algorithms'),
('ENG12', 'English', '12', 3, 'Advanced English'),
('NEP12', 'Nepali', '12', 3, 'Advanced Nepali');

-- Recreate dependent tables
CREATE TABLE IF NOT EXISTS subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    faculty_id INT,
    academic_year VARCHAR(10) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    enrollment_date DATE NOT NULL,
    status ENUM('active', 'dropped', 'completed') DEFAULT 'active',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late') NOT NULL,
    marked_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    exam_type ENUM('weekly_test', 'monthly_test', 'terminal', 'final') NOT NULL,
    exam_date DATE NOT NULL,
    marks_obtained DECIMAL(5,2) NOT NULL,
    total_marks DECIMAL(5,2) NOT NULL,
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('announcement', 'test', 'result', 'event') NOT NULL,
    target_role ENUM('all', 'student', 'faculty') DEFAULT 'all',
    target_program VARCHAR(50) DEFAULT 'all',
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

SELECT 'Migration completed successfully!' as status;
