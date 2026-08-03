-- Create separate databases for each microservice to enforce logical boundaries
CREATE DATABASE IF NOT EXISTS auth_db;
CREATE DATABASE IF NOT EXISTS sql_db;
CREATE DATABASE IF NOT EXISTS challenge_db;
CREATE DATABASE IF NOT EXISTS analytics_db;
CREATE DATABASE IF NOT EXISTS practice_db;

-- Grant privileges
GRANT ALL PRIVILEGES ON auth_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON sql_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON challenge_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON analytics_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON practice_db.* TO 'root'@'%';
FLUSH PRIVILEGES;

-- ==========================================
-- 1. AUTH SERVICE DATABASE
-- ==========================================
USE auth_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    university VARCHAR(150),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. SQL SERVICE DATABASE
-- ==========================================
USE sql_db;

CREATE TABLE IF NOT EXISTS saved_queries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- Logical FK to auth_db.users
    title VARCHAR(100) NOT NULL,
    query_text TEXT NOT NULL,
    collection VARCHAR(50) DEFAULT 'Practice',
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS query_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- Logical FK to auth_db.users
    query_text TEXT NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('success', 'error') NOT NULL,
    execution_time_ms INT
);

-- ==========================================
-- 3. CHALLENGE SERVICE DATABASE
-- ==========================================
USE challenge_db;

CREATE TABLE IF NOT EXISTS challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(120) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
    category VARCHAR(50) NOT NULL,
    operation VARCHAR(50) NOT NULL,
    tables_json JSON,
    constraints_json JSON,
    sample_test_cases JSON,
    hidden_test_cases JSON,
    expected_result JSON,
    xp INT DEFAULT 10,
    acceptance_rate DECIMAL(5,2) DEFAULT 80.00,
    submission_count INT DEFAULT 0,
    expected_query TEXT NOT NULL,
    schema_setup TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- Logical FK to auth_db.users
    challenge_id INT NOT NULL,
    query_text TEXT NOT NULL,
    status ENUM('passed', 'failed', 'error') NOT NULL,
    execution_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_scores (
    user_id INT PRIMARY KEY, -- Logical FK to auth_db.users
    total_score INT DEFAULT 0,
    challenges_completed INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS challenge_bookmarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_challenge_bookmark (user_id, challenge_id),
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
);

-- ==========================================
-- 4. ANALYTICS SERVICE DATABASE
-- ==========================================
USE analytics_db;

DROP TABLE IF EXISTS achievements;

CREATE TABLE IF NOT EXISTS daily_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- Logical FK to auth_db.users
    date DATE NOT NULL,
    challenges_solved INT DEFAULT 0,
    queries_run INT DEFAULT 0,
    UNIQUE KEY (user_id, date)
);

-- ==========================================
-- 5. PRACTICE DATABASE (For User Execution)
-- ==========================================
USE practice_db;

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
