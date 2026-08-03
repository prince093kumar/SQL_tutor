USE practice_db;

INSERT IGNORE INTO department(id, department_name, location) VALUES
(1, 'IT', 'Bengaluru'),
(2, 'HR', 'Delhi'),
(3, 'Finance', 'Mumbai'),
(4, 'Sales', 'Pune'),
(5, 'Operations', 'Hyderabad');

INSERT IGNORE INTO employee(id, name, department, department_id, manager_id, salary, hire_date) VALUES
(1, 'Prince', 'IT', 1, NULL, 50000.00, '2022-01-10'),
(2, 'Rahul', 'HR', 2, 1, 45000.00, '2021-08-15'),
(3, 'Aman', 'Finance', 3, 1, 60000.00, '2020-04-20'),
(4, 'Neha', 'IT', 1, 1, 72000.00, '2019-11-01'),
(5, 'Sana', 'Sales', 4, 1, 52000.00, '2023-02-12'),
(6, 'Kiran', 'Operations', 5, 1, 48000.00, '2022-09-05'),
(7, 'Mehul', 'IT', 1, 4, 68000.00, '2020-07-12'),
(8, 'Ira', 'IT', 1, 4, 63000.00, '2021-05-09'),
(9, 'Devika', 'IT', 1, 4, 59000.00, '2022-12-20'),
(10, 'Vikram', 'IT', 1, 4, 81000.00, '2018-03-30');

INSERT IGNORE INTO salary(id, employee_id, amount, effective_date) VALUES
(1, 1, 50000.00, '2024-01-01'),
(2, 2, 45000.00, '2024-01-01'),
(3, 3, 60000.00, '2024-01-01'),
(4, 4, 72000.00, '2024-01-01'),
(5, 5, 52000.00, '2024-01-01'),
(6, 6, 48000.00, '2024-01-01');

INSERT IGNORE INTO customers(id, name, email, city, country, status) VALUES
(1, 'Arjun Mehta', 'arjun@example.com', 'Delhi', 'India', 'active'),
(2, 'Meera Shah', 'meera@example.com', 'Mumbai', 'India', 'active'),
(3, 'Ishaan Rao', 'ishaan@example.com', 'Bengaluru', 'India', 'inactive'),
(4, 'Tara Singh', 'tara@example.com', 'Pune', 'India', 'active');

INSERT IGNORE INTO products(id, name, category, price) VALUES
(1, 'Laptop', 'Electronics', 65000.00),
(2, 'Keyboard', 'Electronics', 2200.00),
(3, 'Desk Chair', 'Furniture', 8500.00),
(4, 'Notebook', 'Stationery', 120.00),
(5, 'Monitor', 'Electronics', 14000.00);

INSERT IGNORE INTO orders(id, customer_id, order_date, total, total_amount) VALUES
(1, 1, '2024-02-01', 67200.00, 67200.00),
(2, 2, '2024-02-03', 8500.00, 8500.00),
(3, 3, '2024-02-08', 14120.00, 14120.00),
(4, 1, '2024-02-15', 2200.00, 2200.00),
(5, 1, '2024-02-18', 1200.00, 1200.00),
(6, 1, '2024-02-20', 499.00, 499.00),
(7, 4, '2024-02-22', 1800.00, 1800.00);

INSERT IGNORE INTO order_items(id, order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 1, 65000.00),
(2, 1, 2, 1, 2200.00),
(3, 2, 3, 1, 8500.00),
(4, 3, 5, 1, 14000.00),
(5, 3, 4, 1, 120.00),
(6, 4, 2, 1, 2200.00),
(7, 5, 4, 10, 120.00),
(8, 7, 2, 1, 1800.00);

INSERT IGNORE INTO suppliers(id, name, email, status) VALUES
(1, 'Northwind Supplies', 'northwind@example.com', 'active'),
(2, 'Metro Wholesale', 'metro@example.com', 'inactive'),
(3, 'Acme Components', 'acme@example.com', 'active');

INSERT IGNORE INTO categories(id, name, parent_id) VALUES
(1, 'Catalog', NULL),
(2, 'Electronics', 1),
(3, 'Furniture', 1),
(4, 'Accessories', 2);

INSERT IGNORE INTO services(id, name, price) VALUES
(1, 'Installation', 1200.00),
(2, 'Warranty Extension', 2500.00),
(3, 'Data Migration', 5000.00);

INSERT IGNORE INTO inventory(id, product_id, quantity, warehouse) VALUES
(1, 1, 12, 'North'),
(2, 2, 80, 'North'),
(3, 3, 24, 'West'),
(4, 4, 300, 'South'),
(5, 5, 18, 'West');

INSERT IGNORE INTO payments(id, order_id, amount, payment_method, paid_at) VALUES
(1, 1, 67200.00, 'Card', '2024-02-01'),
(2, 2, 8500.00, 'UPI', '2024-02-03'),
(3, 3, 14120.00, 'Card', '2024-02-08'),
(4, 4, 2200.00, 'Cash', '2024-02-15');

INSERT IGNORE INTO students(id, name, email, grade) VALUES
(1, 'Riya', 'riya@example.com', 'A'),
(2, 'Kabir', 'kabir@example.com', 'B'),
(3, 'Ananya', 'ananya@example.com', 'A'),
(4, 'Dev', 'dev@example.com', 'C');

INSERT IGNORE INTO courses(id, title, instructor, credits) VALUES
(1, 'SQL Basics', 'Dr. Sharma', 3),
(2, 'Data Analytics', 'Prof. Iyer', 4),
(3, 'Database Design', 'Dr. Khan', 3);

INSERT IGNORE INTO enrollments(id, student_id, course_id, enrolled_at, score) VALUES
(1, 1, 1, '2024-01-10', 95.00),
(2, 1, 2, '2024-01-12', 88.00),
(3, 2, 1, '2024-01-10', 81.00),
(4, 3, 3, '2024-01-14', 92.00),
(5, 4, 2, '2024-01-15', 74.00);

INSERT IGNORE INTO authors(id, name, country) VALUES
(1, 'Chetan Bhagat', 'India'),
(2, 'Arundhati Roy', 'India'),
(3, 'George Orwell', 'United Kingdom');

INSERT IGNORE INTO books(id, title, author_id, published_year, price) VALUES
(1, 'Five Point Someone', 1, 2004, 299.00),
(2, 'The God of Small Things', 2, 1997, 499.00),
(3, '1984', 3, 1949, 399.00);

INSERT IGNORE INTO sales(id, product_id, quantity, sale_date, revenue) VALUES
(1, 1, 2, '2024-03-01', 130000.00),
(2, 2, 10, '2024-03-02', 22000.00),
(3, 5, 3, '2024-03-05', 42000.00),
(4, 4, 25, '2024-03-06', 3000.00);

INSERT IGNORE INTO employees_history(id, employee_id, old_department, new_department, changed_at) VALUES
(1, 1, 'Support', 'IT', '2023-07-01'),
(2, 3, 'Audit', 'Finance', '2022-12-10'),
(3, 5, 'Marketing', 'Sales', '2023-09-15');
