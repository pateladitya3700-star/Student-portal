-- Fee Management System
-- Create fee_payments table

CREATE TABLE IF NOT EXISTS fee_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    total_fee DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    due_amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    status ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_status (status),
    INDEX idx_academic_year (academic_year)
);

-- Insert sample fee records for existing students
INSERT INTO fee_payments (student_id, academic_year, semester, total_fee, paid_amount, due_amount, payment_date, payment_method, status, remarks)
SELECT 
    student_id,
    '2024-2025' as academic_year,
    'First Semester' as semester,
    50000.00 as total_fee,
    CASE 
        WHEN RAND() > 0.7 THEN 50000.00
        WHEN RAND() > 0.4 THEN 25000.00
        ELSE 0.00
    END as paid_amount,
    CASE 
        WHEN RAND() > 0.7 THEN 0.00
        WHEN RAND() > 0.4 THEN 25000.00
        ELSE 50000.00
    END as due_amount,
    CASE 
        WHEN RAND() > 0.7 THEN DATE_SUB(CURDATE(), INTERVAL FLOOR(RAND() * 30) DAY)
        WHEN RAND() > 0.4 THEN DATE_SUB(CURDATE(), INTERVAL FLOOR(RAND() * 60) DAY)
        ELSE NULL
    END as payment_date,
    CASE 
        WHEN RAND() > 0.5 THEN 'Cash'
        ELSE 'Bank Transfer'
    END as payment_method,
    CASE 
        WHEN RAND() > 0.7 THEN 'paid'
        WHEN RAND() > 0.4 THEN 'partial'
        ELSE 'pending'
    END as status,
    'First semester fee' as remarks
FROM students
WHERE student_id LIKE 'STU%';
