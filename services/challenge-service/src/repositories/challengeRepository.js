import db from '../config/db.js';
import { SQLTrie } from '../../../../packages/algorithms/index.js';

class ChallengeRepository {
    async getChallenges(filters = {}, userId = null) {
        await this.ensureChallengeSchema();
        const where = [];
        const params = [];

        if (filters.difficulty) {
            this.addListFilter(where, params, 'c.difficulty', filters.difficulty);
        }
        if (filters.category) {
            const categories = this.toList(filters.category).map(category => this.normalizeCategoryFilter(category));
            where.push(`LOWER(c.category) IN (${categories.map(() => 'LOWER(?)').join(', ')})`);
            params.push(...categories);
        }
        if (filters.operation) {
            const operations = this.toList(filters.operation);
            where.push(`LOWER(REPLACE(REPLACE(c.operation, " ", "_"), "/", "_")) IN (${operations.map(() => 'LOWER(?)').join(', ')})`);
            params.push(...operations);
        }
        if (filters.search) {
            where.push('(c.title LIKE ? OR c.description LIKE ? OR c.category LIKE ? OR c.operation LIKE ?)');
            const search = `%${filters.search}%`;
            params.push(search, search, search, search);
        }

        const statusSelect = userId
            ? `CASE
                WHEN EXISTS (SELECT 1 FROM challenge_bookmarks b WHERE b.challenge_id = c.id AND b.user_id = ?) THEN 'Bookmarked'
                WHEN EXISTS (SELECT 1 FROM submissions s WHERE s.challenge_id = c.id AND s.user_id = ? AND s.status = 'passed') THEN 'Solved'
                WHEN EXISTS (SELECT 1 FROM submissions s WHERE s.challenge_id = c.id AND s.user_id = ?) THEN 'Attempted'
                ELSE 'Unsolved'
            END`
            : `'Unsolved'`;
        const statusParams = userId ? [userId, userId, userId] : [];
        const statusFilters = filters.status ? this.toList(filters.status).map(status => this.normalizeStatus(status)) : [];
        const having = statusFilters.length ? `HAVING status IN (${statusFilters.map(() => '?').join(', ')})` : '';
        const havingParams = statusFilters;

        const [rows] = await db.query(`
            SELECT
                c.*,
                ${statusSelect} AS status
            FROM challenges c
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            ${having}
            ORDER BY c.id
        `, [...statusParams, ...params, ...havingParams]);

        return rows.map(row => this.mapChallenge(row));
    }

    async getChallengeById(id) {
        await this.ensureChallengeSchema();
        const [rows] = await db.query('SELECT * FROM challenges WHERE id = ?', [id]);
        return rows[0] ? this.mapChallenge(rows[0]) : null;
    }

    async toggleBookmark(userId, challengeId) {
        await this.ensureChallengeSchema();
        const [existing] = await db.query(
            'SELECT id FROM challenge_bookmarks WHERE user_id = ? AND challenge_id = ?',
            [userId, challengeId]
        );

        if (existing.length) {
            await db.query('DELETE FROM challenge_bookmarks WHERE user_id = ? AND challenge_id = ?', [userId, challengeId]);
            return { challengeId: Number(challengeId), bookmarked: false };
        }

        await db.query('INSERT INTO challenge_bookmarks (user_id, challenge_id) VALUES (?, ?)', [userId, challengeId]);
        return { challengeId: Number(challengeId), bookmarked: true };
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
            SELECT u.username, u.full_name, u.university, s.total_score, s.challenges_completed 
            FROM user_scores s
            JOIN auth_db.users u ON s.user_id = u.id
        `);
        return rows;
    }

    async getLeaderboard() {
        return this.getLeaderboardCandidates();
    }

    async getWeakTopics(userId) {
        const [rows] = await db.query(`
            SELECT c.title, c.operation, c.category, s.status, COUNT(*) AS attempts
            FROM submissions s
            JOIN challenges c ON c.id = s.challenge_id
            WHERE s.user_id = ? AND s.status <> 'passed'
            GROUP BY c.id, c.title, c.operation, c.category, s.status
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
            topic: row.operation || row.category,
            weight: Number(row.attempts) + 5
        }));
    }

    async getProfileStats(userId) {
        await this.ensureChallengeSchema();
        const [summaryRows] = await db.query(`
            SELECT
                COUNT(DISTINCT CASE WHEN s.status = 'passed' THEN s.challenge_id END) AS solved,
                COUNT(s.id) AS attempts,
                SUM(s.status = 'passed') AS accepted
            FROM submissions s
            WHERE s.user_id = ?
        `, [userId]);
        const [difficultyRows] = await db.query(`
            SELECT c.difficulty, COUNT(*) AS total,
                COUNT(DISTINCT CASE WHEN s.status = 'passed' THEN c.id END) AS solved
            FROM challenges c
            LEFT JOIN submissions s ON s.challenge_id = c.id AND s.user_id = ?
            GROUP BY c.difficulty
        `, [userId]);
        const [topicRows] = await db.query(`
            SELECT c.operation, COUNT(s.id) AS attempts, SUM(s.status = 'passed') AS accepted
            FROM challenges c
            LEFT JOIN submissions s ON s.challenge_id = c.id AND s.user_id = ?
            GROUP BY c.operation
            ORDER BY c.operation
        `, [userId]);
        const [recentRows] = await db.query(`
            SELECT c.title, s.status, s.execution_time_ms
            FROM submissions s
            JOIN challenges c ON c.id = s.challenge_id
            WHERE s.user_id = ?
            ORDER BY s.created_at DESC
            LIMIT 8
        `, [userId]);
        const [activityRows] = await db.query(`
            SELECT activity_date, SUM(solved_count) AS solved, SUM(query_count) AS queries
            FROM (
                SELECT DATE(created_at) AS activity_date,
                    SUM(status = 'passed') AS solved_count,
                    0 AS query_count
                FROM submissions
                WHERE user_id = ? AND created_at >= CURRENT_DATE - INTERVAL 83 DAY
                GROUP BY DATE(created_at)
                UNION ALL
                SELECT DATE(executed_at) AS activity_date,
                    0 AS solved_count,
                    COUNT(*) AS query_count
                FROM sql_db.query_history
                WHERE user_id = ? AND executed_at >= CURRENT_DATE - INTERVAL 83 DAY
                GROUP BY DATE(executed_at)
            ) activity
            GROUP BY activity_date
            ORDER BY activity_date
        `, [userId, userId]);
        const [scoreRows] = await db.query('SELECT total_score FROM user_scores WHERE user_id = ?', [userId]);

        const summary = summaryRows[0] || {};
        const attempts = Number(summary.attempts || 0);
        const accepted = Number(summary.accepted || 0);
        const totalSolved = Number(summary.solved || 0);

        return {
            solved: totalSolved,
            xp: Number(scoreRows[0]?.total_score || totalSolved * 10 || 1240),
            accuracy: attempts ? Math.round((accepted / attempts) * 100) : 87,
            ranking: 21,
            streak: 18,
            difficulties: difficultyRows.map(row => ({
                difficulty: row.difficulty,
                solved: Number(row.solved || 0),
                total: Number(row.total || 0)
            })),
            skills: topicRows.map(row => ({
                topic: row.operation,
                strength: Number(row.attempts || 0) ? Math.round((Number(row.accepted || 0) / Number(row.attempts)) * 100) : this.defaultSkill(row.operation)
            })),
            recentSubmissions: recentRows.map(row => ({
                challenge: row.title,
                status: row.status === 'passed' ? 'Accepted' : 'Failed',
                runtime: `${row.execution_time_ms || 0}ms`
            })),
            activity: activityRows.map(row => ({
                date: row.activity_date,
                solved: Number(row.solved || 0),
                queries: Number(row.queries || 0)
            }))
        };
    }

    async globalSearch(query, userId) {
        await this.ensureChallengeSchema();
        const term = String(query || '').trim();
        if (!term) return { challenges: [], tables: [], savedQueries: [], suggestions: [] };

        const [challenges] = await db.query(`
            SELECT id, slug, title, difficulty, category, operation
            FROM challenges
            WHERE title LIKE ? OR description LIKE ? OR category LIKE ? OR operation LIKE ?
            ORDER BY id
            LIMIT 8
        `, [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]);
        const [columns] = await db.query(`
            SELECT TABLE_NAME, COLUMN_NAME
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = 'practice_db'
              AND (TABLE_NAME LIKE ? OR COLUMN_NAME LIKE ?)
            ORDER BY TABLE_NAME, ORDINAL_POSITION
            LIMIT 30
        `, [`%${term}%`, `%${term}%`]);
        const [savedQueries] = await db.query(`
            SELECT id, title, collection
            FROM sql_db.saved_queries
            WHERE user_id = ? AND (title LIKE ? OR query_text LIKE ? OR collection LIKE ?)
            ORDER BY created_at DESC
            LIMIT 8
        `, [userId, `%${term}%`, `%${term}%`, `%${term}%`]);

        const trie = new SQLTrie();
        this.sqlDictionary().forEach(item => trie.insert(item.word, item));
        challenges.forEach(challenge => {
            trie.insert(challenge.title, { type: 'challenge', label: challenge.title });
            trie.insert(challenge.category, { type: 'category', label: challenge.category });
            trie.insert(challenge.operation, { type: 'operation', label: challenge.operation });
        });
        columns.forEach(column => {
            trie.insert(column.TABLE_NAME, { type: 'table', label: column.TABLE_NAME });
            trie.insert(column.COLUMN_NAME, { type: 'column', label: `${column.TABLE_NAME}.${column.COLUMN_NAME}` });
        });

        const tables = Array.from(new Map(columns.map(column => [column.TABLE_NAME, {
            name: column.TABLE_NAME,
            columns: columns.filter(item => item.TABLE_NAME === column.TABLE_NAME).map(item => item.COLUMN_NAME)
        }])).values());

        return {
            challenges: challenges.map(row => this.mapSearchChallenge(row)),
            tables,
            savedQueries,
            suggestions: this.dedupeSuggestions(trie.searchPrefix(term, 12))
        };
    }

    normalizeStatus(status) {
        const normalized = String(status).toLowerCase();
        if (normalized === 'solved') return 'Solved';
        if (normalized === 'attempted') return 'Attempted';
        if (normalized === 'bookmarked') return 'Bookmarked';
        return 'Unsolved';
    }

    toList(value) {
        return String(value).split(',').map(item => item.trim()).filter(Boolean);
    }

    addListFilter(where, params, column, value) {
        const values = this.toList(value);
        where.push(`${column} IN (${values.map(() => '?').join(', ')})`);
        params.push(...values);
    }

    normalizeCategoryFilter(category) {
        const normalized = String(category).toLowerCase().replace(/_/g, ' ');
        const aliases = {
            join: 'Joins',
            joins: 'Joins',
            aggregate: 'Aggregate',
            aggregation: 'Aggregate',
            grouping: 'Grouping',
            subquery: 'Subquery',
            subqueries: 'Subquery',
            window: 'Window',
            'window functions': 'Window',
            cte: 'CTE',
            advanced: 'Advanced',
            basics: 'Basics',
            basic: 'Basics',
            sorting: 'Sorting'
        };
        return aliases[normalized] || category;
    }

    mapChallenge(row) {
        return {
            id: row.id,
            slug: row.slug || `challenge-${row.id}`,
            title: row.title,
            description: row.description,
            difficulty: row.difficulty,
            category: row.category,
            operation: row.operation,
            topic: row.operation,
            xp: row.xp,
            estimated_time: row.estimated_time || '15 min',
            expected_query: row.expected_query,
            tables: this.parseJson(row.tables_json, []),
            constraints: this.parseJson(row.constraints_json, []),
            sampleTestCases: this.parseJson(row.sample_test_cases, []),
            hiddenTestCases: this.parseJson(row.hidden_test_cases, []),
            expectedResult: this.parseJson(row.expected_result, {}),
            expectedOutput: this.parseJson(row.expected_result, {}).columns || [],
            sampleInput: row.schema_setup || 'practice_db',
            sampleOutput: 'Run the query to preview sample output.',
            successRate: Number(row.acceptance_rate || 0),
            acceptanceRate: Number(row.acceptance_rate || 0),
            submissions: Number(row.submission_count || 0),
            submissionCount: Number(row.submission_count || 0),
            status: row.status || 'Unsolved'
        };
    }

    parseJson(value, fallback) {
        if (!value) return fallback;
        if (typeof value === 'object') return value;
        try {
            return JSON.parse(value);
        } catch {
            return fallback;
        }
    }

    defaultSkill(operation) {
        const defaults = { SELECT: 95, WHERE: 90, 'INNER JOIN': 78, 'LEFT JOIN': 74, 'GROUP BY': 82, Scalar: 65, RANK: 48, ROW_NUMBER: 55, WITH: 40, 'Recursive CTE': 36 };
        return defaults[operation] || 50;
    }

    sqlDictionary() {
        return [
            'SELECT', 'WHERE', 'DISTINCT', 'ORDER BY', 'LIMIT', 'COUNT', 'SUM', 'AVG',
            'MIN', 'MAX', 'GROUP BY', 'HAVING', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN',
            'Subquery', 'CREATE VIEW', 'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LAG',
            'LEAD', 'WITH', 'Recursive CTE', 'CASE', 'UNION'
        ].map(word => ({ word, type: 'keyword', label: word }));
    }

    dedupeSuggestions(suggestions) {
        const seen = new Set();
        return suggestions.filter(suggestion => {
            const key = `${suggestion.type}:${String(suggestion.word || suggestion.label).toLowerCase()}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    mapSearchChallenge(row) {
        return {
            id: row.id,
            slug: row.slug,
            title: row.title,
            difficulty: row.difficulty,
            category: row.category,
            operation: row.operation
        };
    }

    async ensureChallengeSchema() {
        await this.addColumnIfMissing('challenges', 'slug', 'VARCHAR(120)');
        await db.query('UPDATE challenges SET slug = CONCAT("challenge-", id) WHERE slug IS NULL OR slug = ""');
        await db.query('ALTER TABLE challenges MODIFY COLUMN slug VARCHAR(120) NOT NULL');
        try {
            await db.query('ALTER TABLE challenges ADD UNIQUE KEY unique_challenges_slug (slug)');
        } catch (error) {
            if (error.code !== 'ER_DUP_KEYNAME') throw error;
        }
        await this.addColumnIfMissing('challenges', 'category', 'VARCHAR(50) NOT NULL DEFAULT "Basics"');
        await this.addColumnIfMissing('challenges', 'operation', 'VARCHAR(50) NOT NULL DEFAULT "SELECT"');
        await this.addColumnIfMissing('challenges', 'tables_json', 'JSON');
        await this.addColumnIfMissing('challenges', 'constraints_json', 'JSON');
        await this.addColumnIfMissing('challenges', 'sample_test_cases', 'JSON');
        await this.addColumnIfMissing('challenges', 'hidden_test_cases', 'JSON');
        await this.addColumnIfMissing('challenges', 'expected_result', 'JSON');
        await this.addColumnIfMissing('challenges', 'xp', 'INT DEFAULT 10');
        await this.addColumnIfMissing('challenges', 'acceptance_rate', 'DECIMAL(5,2) DEFAULT 80.00');
        await this.addColumnIfMissing('challenges', 'submission_count', 'INT DEFAULT 0');
        await db.query(`
            CREATE TABLE IF NOT EXISTS challenge_bookmarks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                challenge_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user_challenge_bookmark (user_id, challenge_id),
                FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
            )
        `);
    }

    async addColumnIfMissing(tableName, columnName, definition) {
        const [rows] = await db.query(`
            SELECT COUNT(*) AS column_count
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = ?
              AND COLUMN_NAME = ?
        `, [tableName, columnName]);

        if (Number(rows[0]?.column_count || 0) === 0) {
            await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
        }
    }
}

export default new ChallengeRepository();
