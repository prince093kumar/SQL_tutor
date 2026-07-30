USE challenge_db;

INSERT IGNORE INTO challenges (id, title, description, difficulty, expected_query, schema_setup) VALUES
(1, 'Find All Engineering Employees', 'Write a query to retrieve all employees who work in the Engineering department.', 'easy', 'SELECT * FROM employees WHERE department = ''Engineering'';', 'practice_db.employees'),
(2, 'Department Average Salary', 'Write a query to find the average salary for each department. Return department and average salary.', 'medium', 'SELECT department, AVG(salary) as avg_salary FROM employees GROUP BY department;', 'practice_db.employees'),
(3, 'Highest Paid Employee', 'Write a query to find the highest paid employee in the company. Return first_name, last_name, and salary.', 'hard', 'SELECT first_name, last_name, salary FROM employees ORDER BY salary DESC LIMIT 1;', 'practice_db.employees');
