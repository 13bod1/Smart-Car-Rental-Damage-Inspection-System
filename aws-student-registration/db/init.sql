-- ==============================================================================
-- Database Schema for Student Registration Website
-- Target: Amazon RDS for MySQL
-- Database: STUDENT_REGISTRATION
-- Table: students
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS STUDENT_REGISTRATION;
USE STUDENT_REGISTRATION;

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    department VARCHAR(50) DEFAULT 'Engineering',
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial records
INSERT INTO students (full_name, email, student_id, department, photo_url) VALUES
('Ahmed Mohamed', 'ahmed.m@aast.edu', '21100123', 'Computer Engineering', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'),
('Sara El-Sayed', 'sara.e@aast.edu', '21100456', 'Software Engineering', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200'),
('Omar Khaled', 'omar.k@aast.edu', '21100789', 'Computer Science', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200');

SELECT * FROM students;

