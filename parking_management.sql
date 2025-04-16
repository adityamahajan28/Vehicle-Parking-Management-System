CREATE DATABASE parking_management;

USE parking_management;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    location VARCHAR(255) NOT NULL,
    vehicle_type ENUM('2-wheeler', '4-wheeler') NOT NULL,
    vehicle_number VARCHAR(20) NOT NULL,
    booking_date DATETIME NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    region VARCHAR(100) NOT NULL,
    subdivision VARCHAR(100) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    price_2wheeler DECIMAL(10, 2) NOT NULL,
    price_4wheeler DECIMAL(10, 2) NOT NULL
);
INSERT INTO locations (region, subdivision, location_name, price_2wheeler, price_4wheeler) 
VALUES 
('Mumbai', 'Andheri', 'Andheri Station', 40.00, 80.00),
('Mumbai', 'Andheri', 'Andheri Mall', 50.00, 100.00),
('Mumbai', 'Bandra', 'Bandra Kurla Complex', 60.00, 120.00),
('Mumbai', 'Bandra', 'Linking Road', 55.00, 110.00),
('Pune', 'Kothrud', 'Kothrud Bus Stand', 30.00, 70.00),
('Pune', 'Kothrud', 'Kothrud Market', 35.00, 75.00),
('Pune', 'Hinjewadi', 'IT Park Phase 1', 45.00, 90.00),
('Pune', 'Hinjewadi', 'IT Park Phase 2', 45.00, 90.00);