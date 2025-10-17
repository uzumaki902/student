-- Seed script to create database and tables
CREATE DATABASE IF NOT EXISTS studentdb;
USE studentdb;

CREATE TABLE IF NOT EXISTS students_final (
  id INT AUTO_INCREMENT PRIMARY KEY,
  number_courses INT,
  time_study DECIMAL(5,2),
  Marks DECIMAL(5,2)
);

-- Optionally insert sample rows
INSERT INTO students_final (number_courses, time_study, Marks) VALUES
(3, 4.51, 19.20),
(4, 0.10, 7.73),
(6, 7.00, 53.02);
