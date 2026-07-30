-- Create databases for app data and practice data
CREATE DATABASE IF NOT EXISTS sqllab_app;
CREATE DATABASE IF NOT EXISTS sqllab_practice;

-- Grant privileges (in a real production app we'd use separate users with restricted privileges)
GRANT ALL PRIVILEGES ON sqllab_app.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON sqllab_practice.* TO 'root'@'%';
FLUSH PRIVILEGES;

-- Use app database to create users table
USE sqllab_app;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saved_queries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    query_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS query_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    query_text TEXT NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('success', 'error') NOT NULL,
    execution_time_ms INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
    expected_query TEXT NOT NULL,
    schema_setup TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_id INT NOT NULL,
    query_text TEXT NOT NULL,
    status ENUM('passed', 'failed', 'error') NOT NULL,
    execution_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_scores (
    user_id INT PRIMARY KEY,
    total_score INT DEFAULT 0,
    challenges_completed INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed some practice data into the practice database
USE sqllab_practice;

CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    department VARCHAR(50),
    salary DECIMAL(10, 2),
    hire_date DATE
);

INSERT IGNORE INTO employees (id, first_name, last_name, department, salary, hire_date) VALUES
(1, 'John', 'Doe', 'Engineering', 85000.00, '2020-01-15'),
(2, 'Jane', 'Smith', 'Marketing', 75000.00, '2019-11-20'),
(3, 'Bob', 'Johnson', 'Sales', 65000.00, '2021-03-10'),
(4, 'Alice', 'Williams', 'Engineering', 92000.00, '2018-07-01'),
(5, 'Charlie', 'Brown', 'HR', 60000.00, '2022-02-14');

CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    location VARCHAR(50) NOT NULL
);

INSERT IGNORE INTO departments (id, name, location) VALUES
(1, 'Engineering', 'San Francisco'),
(2, 'Marketing', 'New York'),
(3, 'Sales', 'Chicago'),
(4, 'HR', 'Austin');
