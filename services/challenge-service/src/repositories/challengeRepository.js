import db from '../config/db.js';

export const fallbackChallenges = [
    {
        id: 1,
        title: 'Select Basics',
        description: 'Return employee names and salaries from the employee table. Write the full query yourself.',
        difficulty: 'easy',
        category: 'Basics',
        topic: 'SELECT',
        xp: 10,
        estimated_time: '5 min',
        expected_query: 'SELECT name, salary FROM employee ORDER BY id;',
        tables: ['employee'],
        constraints: ['Use the employee table.', 'Return only name and salary.', 'Sort by id for deterministic output.'],
        expectedOutput: ['name', 'salary'],
        sampleInput: 'employee(id, name, department, department_id, salary, hire_date)',
        sampleOutput: 'Prince | 50000.00',
        successRate: 92,
        submissions: 1842,
        status: 'Solved'
    },
    {
        id: 2,
        title: 'High Salary Employees',
        description: 'Find employees with salary greater than 50000.',
        difficulty: 'easy',
        category: 'Basics',
        topic: 'WHERE',
        xp: 10,
        estimated_time: '7 min',
        expected_query: 'SELECT name, salary FROM employee WHERE salary > 50000 ORDER BY salary DESC;',
        tables: ['employee'],
        constraints: ['Use WHERE.', 'Return name and salary.'],
        expectedOutput: ['name', 'salary'],
        sampleInput: 'employee salary values',
        sampleOutput: 'Neha | 72000.00',
        successRate: 88,
        submissions: 1220,
        status: 'Not Attempted'
    },
    {
        id: 3,
        title: 'Average Salary',
        description: 'Calculate average salary for each department.',
        difficulty: 'medium',
        category: 'Functions',
        topic: 'AVG',
        xp: 20,
        estimated_time: '12 min',
        expected_query: 'SELECT department, AVG(salary) AS average_salary FROM employee GROUP BY department ORDER BY department;',
        tables: ['employee'],
        constraints: ['Use AVG and GROUP BY.', 'Alias the aggregate as average_salary.'],
        expectedOutput: ['department', 'average_salary'],
        sampleInput: 'employee(department, salary)',
        sampleOutput: 'IT | 61000.00',
        successRate: 71,
        submissions: 918,
        status: 'Attempted'
    },
    {
        id: 4,
        title: 'Employee Department Join',
        description: 'Return employee names with their department names.',
        difficulty: 'medium',
        category: 'JOINS',
        topic: 'INNER JOIN',
        xp: 20,
        estimated_time: '15 min',
        expected_query: 'SELECT e.name, d.department_name FROM employee e INNER JOIN department d ON d.id = e.department_id ORDER BY e.id;',
        tables: ['employee', 'department'],
        constraints: ['Use INNER JOIN.', 'Join on department_id.'],
        expectedOutput: ['name', 'department_name'],
        sampleInput: 'employee, department',
        sampleOutput: 'Prince | IT',
        successRate: 69,
        submissions: 1264,
        status: 'Bookmarked'
    },
    {
        id: 5,
        title: 'Salary Ranking',
        description: 'Rank employees by salary within each department.',
        difficulty: 'hard',
        category: 'Window Functions',
        topic: 'RANK',
        xp: 30,
        estimated_time: '20 min',
        expected_query: 'SELECT department, name, RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS salary_rank FROM employee ORDER BY department, salary_rank;',
        tables: ['employee'],
        constraints: ['Use a window function.', 'Partition by department.'],
        expectedOutput: ['department', 'name', 'salary_rank'],
        sampleInput: 'employee(department, name, salary)',
        sampleOutput: 'IT | Neha | 1',
        successRate: 43,
        submissions: 512,
        status: 'Not Attempted'
    }
];

class ChallengeRepository {
    async getChallenges() {
        const [rows] = await db.query('SELECT id, title, description, difficulty, expected_query, schema_setup, created_at FROM challenges ORDER BY created_at DESC');
        if (rows.length === 0) return fallbackChallenges;
        return rows.map(row => ({
            ...row,
            category: row.schema_setup?.includes('JOIN') ? 'JOINS' : 'Basics',
            topic: row.title.includes('Average') ? 'AVG' : 'SELECT',
            xp: row.difficulty === 'hard' ? 30 : row.difficulty === 'medium' ? 20 : 10,
            tables: ['employee'],
            constraints: ['Return the expected columns.', 'Match result values, not SQL text.'],
            expectedOutput: [],
            sampleInput: row.schema_setup || 'practice_db',
            sampleOutput: 'Run the query to preview sample output.',
            successRate: 80,
            submissions: 100,
            status: 'Not Attempted'
        }));
    }

    async getChallengeById(id) {
        const [rows] = await db.query('SELECT * FROM challenges WHERE id = ?', [id]);
        return rows[0] || fallbackChallenges.find(challenge => challenge.id === Number(id));
    }

    async logSubmission(userId, challengeId, queryText, status, executionTimeMs) {
        const [result] = await db.query(
            'INSERT INTO submissions (user_id, challenge_id, query_text, status, execution_time_ms) VALUES (?, ?, ?, ?, ?)',
            [userId, challengeId, queryText, status, executionTimeMs]
        );
        return result.insertId;
    }

    async updateScore(userId, isCorrect) {
        // Simple scoring: +10 per correct submission
        if (!isCorrect) return;
        
        await db.query(`
            INSERT INTO user_scores (user_id, total_score, challenges_completed)
            VALUES (?, 10, 1)
            ON DUPLICATE KEY UPDATE 
            total_score = total_score + 10,
            challenges_completed = challenges_completed + 1
        `, [userId]);
    }

    async getLeaderboardCandidates() {
        const [rows] = await db.query(`
            SELECT u.username, s.total_score, s.challenges_completed 
            FROM user_scores s
            JOIN users u ON s.user_id = u.id
        `);
        return rows;
    }

    async getLeaderboard() {
        return this.getLeaderboardCandidates();
    }

    async getWeakTopics(userId) {
        const [rows] = await db.query(`
            SELECT c.title, c.schema_setup, s.status, COUNT(*) AS attempts
            FROM submissions s
            JOIN challenges c ON c.id = s.challenge_id
            WHERE s.user_id = ? AND s.status <> 'passed'
            GROUP BY c.id, c.title, c.schema_setup, s.status
            ORDER BY attempts DESC
            LIMIT 5
        `, [userId]);

        if (rows.length === 0) {
            return [
                { topic: 'INNER JOIN', weight: 6 },
                { topic: 'AVG', weight: 4 },
                { topic: 'SELECT', weight: 2 }
            ];
        }

        return rows.map(row => ({
            topic: row.schema_setup?.includes('JOIN') || row.title.includes('Join') ? 'INNER JOIN' : row.title.includes('Average') ? 'AVG' : 'SELECT',
            weight: Number(row.attempts) + 5
        }));
    }
}

export default new ChallengeRepository();
