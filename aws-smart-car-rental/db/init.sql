-- ==============================================================================
-- AASTMT Software Engineering for Cloud Applications - Term Project Database
-- Target Service: Amazon RDS (MySQL 8.0 / PostgreSQL)
-- ==============================================================================

-- 1. Create Database (Run if not auto-created by RDS)
-- CREATE DATABASE IF NOT EXISTS car_rental_db;
-- USE car_rental_db;

-- 2. Create 'cars' table for Fleet Catalog
CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    daily_rate DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image_url VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Seed initial vehicle records
INSERT INTO cars (make, model, year, category, daily_rate, description, image_url) VALUES
('Tesla', 'Model 3 Performance', 2024, 'Electric', 95.00, 'Dual Motor All-Wheel Drive, 0-60 in 2.9s, Premium Interior, Autopilot Enabled.', 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop&q=80'),
('BMW', 'M4 Competition', 2023, 'Sports', 150.00, '503 HP 3.0-liter BMW M TwinPower Turbo inline 6-cylinder engine with carbon bucket seats.', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=80'),
('Mercedes-Benz', 'G-Class G63 AMG', 2024, 'SUV', 220.00, 'Handcrafted AMG 4.0L V8 biturbo engine producing 577 hp. Unrivaled luxury SUV capability.', 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?w=800&auto=format&fit=crop&q=80'),
('Porsche', 'Taycan 4S', 2024, 'Electric', 180.00, 'Electric performance sports sedan, 800-volt architecture, active air suspension.', 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format&fit=crop&q=80'),
('Audi', 'RS7 Sportback', 2023, 'Sports', 165.00, '4.0-liter twin-turbo V8 with mild-hybrid system, quattro all-wheel drive and sport differential.', 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&auto=format&fit=crop&q=80');

-- 4. Verification Query
SELECT * FROM cars;

