-- Drop and recreate results table with correct structure
DROP TABLE IF EXISTS results CASCADE;

CREATE TABLE results (
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

CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
