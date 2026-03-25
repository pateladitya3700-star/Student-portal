-- National Infotech College Portal - PostgreSQL Data Import
-- Clean data-only file (no CREATE TABLE statements)
-- All data from MySQL dump converted to PostgreSQL format

-- Insert Users
INSERT INTO users (id, email, password, role, is_active, created_at) VALUES
(1, 'student@nic.edu.np', '$2a$10$YourHashedPasswordHere1', 'student', true, NOW()),
(2, 'faculty@nic.edu.np', '$2a$10$YourHashedPasswordHere2', 'faculty', true, NOW()),
(3, 'admin@nic.edu.np', '$2a$10$YourHashedPasswordHere3', 'admin', true, NOW()),
(217, 'priya.patel@nic.edu.np', '$2a$10$YourHashedPasswordHere4', 'faculty', true, NOW()),
(218, 'amit.kumar@nic.edu.np', '$2a$10$YourHashedPasswordHere5', 'faculty', true, NOW()),
(219, 'sneha.gupta@nic.edu.np', '$2a$10$YourHashedPasswordHere6', 'faculty', true, NOW()),
(220, 'vikram.singh@nic.edu.np', '$2a$10$YourHashedPasswordHere7', 'faculty', true, NOW()),
(221, 'anjali.verma@nic.edu.np', '$2a$10$YourHashedPasswordHere8', 'faculty', true, NOW()),
(222, 'suresh.yadav@nic.edu.np', '$2a$10$YourHashedPasswordHere9', 'faculty', true, NOW()),
(223, 'kavita.joshi@nic.edu.np', '$2a$10$YourHashedPasswordHere10', 'faculty', true, NOW()),
(224, 'rahul.mehta@nic.edu.np', '$2a$10$YourHashedPasswordHere11', 'faculty', true, NOW()),
(225, 'pooja.reddy@nic.edu.np', '$2a$10$YourHashedPasswordHere12', 'faculty', true, NOW()),
(226, 'deepak.thapa@nic.edu.np', '$2a$10$YourHashedPasswordHere13', 'faculty', true, NOW()),
(227, 'meera.shah@nic.edu.np', '$2a$10$YourHashedPasswordHere14', 'faculty', true, NOW()),
(228, 'binod.karki@nic.edu.np', '$2a$10$YourHashedPasswordHere15', 'faculty', true, NOW()),
(229, 'sanjay.tamang@nic.edu.np', '$2a$10$YourHashedPasswordHere16', 'faculty', true, NOW());

-- Insert Courses
INSERT INTO courses (id, code, name, class, credits, description) VALUES
(1, 'PHY11', 'Physics', '11', 4, 'Mechanics and Thermodynamics'),
(2, 'CHEM11', 'Chemistry', '11', 4, 'Physical and Inorganic Chemistry'),
(3, 'BIO11', 'Biology', '11', 4, 'Cell Biology and Genetics'),
(4, 'MATH11', 'Mathematics', '11', 5, 'Calculus and Algebra'),
(5, 'CS11', 'Computer Science', '11', 3, 'Introduction to Programming'),
(6, 'ENG11', 'English', '11', 3, 'English Language and Literature'),
(7, 'NEP11', 'Nepali', '11', 3, 'Nepali Language and Literature'),
(8, 'PHY12', 'Physics', '12', 4, 'Electromagnetism and Modern Physics'),
(9, 'CHEM12', 'Chemistry', '12', 4, 'Organic and Physical Chemistry'),
(10, 'BIO12', 'Biology', '12', 4, 'Genetics and Evolution'),
(11, 'MATH12', 'Mathematics', '12', 5, 'Advanced Calculus and Statistics'),
(12, 'CS12', 'Computer Science', '12', 3, 'Data Structures and Algorithms'),
(13, 'ENG12', 'English', '12', 3, 'Advanced English'),
(14, 'NEP12', 'Nepali', '12', 3, 'Advanced Nepali');

-- Insert Faculty
INSERT INTO faculty (id, user_id, faculty_id, first_name, last_name, phone, department, specialization) VALUES
(1, 2, 'FAC001', 'Rajesh', 'Sharma', '9841234567', 'Computer Science', 'Data Structures'),
(2, 217, 'FAC002', 'Priya', 'Patel', '9841234568', 'Physics', 'Optics and Modern Physics'),
(3, 218, 'FAC003', 'Amit', 'Kumar', '9841234569', 'Chemistry', 'Organic Chemistry'),
(4, 219, 'FAC004', 'Sneha', 'Gupta', '9841234570', 'Chemistry', 'Inorganic and Physical Chemistry'),
(5, 220, 'FAC005', 'Vikram', 'Singh', '9841234571', 'Biology', 'Botany and Plant Sciences'),
(6, 221, 'FAC006', 'Anjali', 'Verma', '9841234572', 'Biology', 'Zoology and Human Biology'),
(7, 222, 'FAC007', 'Suresh', 'Yadav', '9841234573', 'Mathematics', 'Calculus and Algebra'),
(8, 223, 'FAC008', 'Kavita', 'Joshi', '9841234574', 'Mathematics', 'Statistics and Probability'),
(9, 224, 'FAC009', 'Rahul', 'Mehta', '9841234575', 'Computer Science', 'Programming and Data Structures'),
(10, 225, 'FAC010', 'Pooja', 'Reddy', '9841234576', 'Computer Science', 'Database and Web Technologies'),
(11, 226, 'FAC011', 'Deepak', 'Thapa', '9841234577', 'English', 'Literature and Communication'),
(12, 227, 'FAC012', 'Meera', 'Shah', '9841234578', 'English', 'Grammar and Composition'),
(13, 228, 'FAC013', 'Binod', 'Karki', '9841234579', 'Nepali', 'Nepali Literature and Language'),
(14, 229, 'FAC014', 'Sanjay', 'Tamang', '9841234580', 'Physical Education', 'Sports and Fitness');

-- Insert Faculty Courses
INSERT INTO faculty_courses (id, faculty_id, course_id, academic_year, created_at) VALUES
(1, 1, 1, '2025-2026', NOW()),
(2, 1, 8, '2025-2026', NOW());

-- Insert Fee Payments
INSERT INTO fee_payments (id, student_id, academic_year, semester, total_fee, paid_amount, due_amount, payment_date, payment_method, transaction_id, status, remarks, created_at, updated_at) VALUES
(1, 'NIC11A01', '2024-2025', 'First Semester', 50000.00, 50000.00, 0.00, '2026-03-25', 'Bank Transfer', 'TXN17742638000190', 'paid', 'Payment received in full', NOW(), NOW()),
(2, 'NIC11A02', '2024-2025', 'First Semester', 50000.00, 50000.00, 0.00, '2026-03-07', 'Cash', 'TXN17742638000191', 'paid', 'Payment received in full', NOW(), NOW()),
(3, 'NIC11A03', '2024-2025', 'First Semester', 50000.00, 50000.00, 0.00, '2026-03-02', 'Cheque', 'TXN17742638000192', 'paid', 'Payment received in full', NOW(), NOW()),
(4, 'NIC11A04', '2024-2025', 'First Semester', 50000.00, 50000.00, 0.00, '2026-03-18', 'Online Payment', 'TXN17742638000193', 'paid', 'Payment received in full', NOW(), NOW()),
(5, 'NIC11A05', '2024-2025', 'First Semester', 50000.00, 50000.00, 0.00, '2026-03-14', 'Online Payment', 'TXN17742638000194', 'paid', 'Payment received in full', NOW(), NOW()),
(6, 'NIC11A06', '2024-2025', 'First Semester', 50000.00, 50000.00, 0.00, '2026-03-20', 'Cash', 'TXN17742638000195', 'paid', 'Payment received in full', NOW(), NOW()),
(7, 'NIC11A07', '2024-2025', 'First Semester', 50000.00, 20000.00, 30000.00, '2026-03-15', 'Bank Transfer', 'TXN17742638000626', 'partial', 'Partial payment - Rs. 20,000 paid, Rs. 30,000 remaining', NOW(), NOW()),
(8, 'NIC11A08', '2024-2025', 'First Semester', 50000.00, 25000.00, 25000.00, '2026-03-11', 'Cash', 'TXN17742638000627', 'partial', 'Partial payment - Rs. 25,000 paid, Rs. 25,000 remaining', NOW(), NOW()),
(9, 'NIC11A09', '2024-2025', 'First Semester', 50000.00, 12500.00, 37500.00, '2026-02-18', 'Cash', 'TXN17742638000628', 'partial', 'Partial payment - Rs. 12,500 paid, Rs. 37,500 remaining', NOW(), NOW()),
(10, 'NIC11A10', '2024-2025', 'First Semester', 50000.00, 25000.00, 25000.00, '2026-02-25', 'Cash', 'TXN17742638000639', 'partial', 'Partial payment - Rs. 25,000 paid, Rs. 25,000 remaining', NOW(), NOW()),
(11, 'NIC11A11', '2024-2025', 'First Semester', 50000.00, 37500.00, 12500.00, '2026-02-13', 'Cheque', 'TXN177426380006310', 'partial', 'Partial payment - Rs. 37,500 paid, Rs. 12,500 remaining', NOW(), NOW()),
(12, 'NIC11A12', '2024-2025', 'First Semester', 50000.00, 37500.00, 12500.00, '2026-02-28', 'Cheque', 'TXN177426380006311', 'partial', 'Partial payment - Rs. 37,500 paid, Rs. 12,500 remaining', NOW(), NOW()),
(13, 'NIC11A13', '2024-2025', 'First Semester', 50000.00, 25000.00, 25000.00, '2026-03-20', 'Cash', 'TXN177426380006312', 'partial', 'Partial payment - Rs. 25,000 paid, Rs. 25,000 remaining', NOW(), NOW()),
(14, 'NIC11A14', '2024-2025', 'First Semester', 50000.00, 0.00, 50000.00, NULL, NULL, NULL, 'pending', 'Payment pending - awaiting payment', NOW(), NOW()),
(15, 'NIC11A15', '2024-2025', 'First Semester', 50000.00, 0.00, 50000.00, NULL, NULL, NULL, 'pending', 'Payment pending - awaiting payment', NOW(), NOW()),
(16, 'NIC11A16', '2024-2025', 'First Semester', 50000.00, 0.00, 50000.00, NULL, NULL, NULL, 'pending', 'Payment pending - awaiting payment', NOW(), NOW()),
(17, 'NIC11A17', '2024-2025', 'First Semester', 50000.00, 0.00, 50000.00, NULL, NULL, NULL, 'pending', 'Payment pending - awaiting payment', NOW(), NOW()),
(18, 'NIC11A18', '2024-2025', 'First Semester', 50000.00, 0.00, 50000.00, NULL, NULL, NULL, 'pending', 'Payment pending - awaiting payment', NOW(), NOW()),
(19, 'NIC11A19', '2024-2025', 'First Semester', 50000.00, 0.00, 50000.00, NULL, NULL, NULL, 'overdue', 'Payment overdue - reminder sent multiple times', NOW(), NOW()),
(20, 'NIC11A20', '2024-2025', 'First Semester', 50000.00, 0.00, 50000.00, NULL, NULL, NULL, 'overdue', 'Payment overdue - reminder sent multiple times', NOW(), NOW());

-- Insert Notifications
INSERT INTO notifications (id, title, message, type, target_role, created_at) VALUES
(1, 'Welcome to NIC Portal', 'Welcome to National Infotech College Portal. Please update your profile.', 'announcement', 'all', NOW()),
(2, 'Attendance Reminder', 'Please maintain regular attendance for better academic performance.', 'announcement', 'student', NOW()),
(3, 'Fee Payment Due', 'Your semester fee payment is due. Please pay at the earliest.', 'announcement', 'student', NOW()),
(4, 'Exam Schedule Released', 'Final exam schedule has been released. Check your dashboard for details.', 'announcement', 'student', NOW()),
(5, 'Result Published', 'Your test results have been published. Check your results section.', 'result', 'student', NOW());

-- Insert Results (Sample data)
INSERT INTO results (id, student_id, course_id, term, exam_type, theory_marks, theory_total, practical_marks, practical_total, total_marks, total_marks_max, percentage, grade, created_at) VALUES
(1, 1, 1, 'First Term', 'first_term', 45.00, 60.00, 18.00, 20.00, 63.00, 80.00, 78.75, 'A', NOW()),
(2, 1, 2, 'First Term', 'first_term', 42.00, 60.00, 17.00, 20.00, 59.00, 80.00, 73.75, 'B+', NOW()),
(3, 1, 3, 'First Term', 'first_term', 48.00, 60.00, 19.00, 20.00, 67.00, 80.00, 83.75, 'A', NOW());

-- Insert Attendance (Sample data - just a few records)
INSERT INTO attendance (id, student_id, course_id, date, status, marked_by, created_at) VALUES
(1, 1, 1, '2026-03-23', 'present', 1, NOW()),
(2, 1, 2, '2026-03-23', 'present', 1, NOW()),
(3, 1, 3, '2026-03-23', 'present', 1, NOW()),
(4, 1, 4, '2026-03-23', 'absent', 1, NOW()),
(5, 1, 5, '2026-03-23', 'present', 1, NOW()),
(6, 1, 6, '2026-03-23', 'present', 1, NOW()),
(7, 1, 7, '2026-03-23', 'present', 1, NOW()),
(8, 1, 8, '2026-03-23', 'late', 1, NOW());

-- Done! All data imported successfully
