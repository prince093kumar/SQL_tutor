import queryRepository from '../repositories/queryRepository.js';

class SqlService {
    async executeQuery(userId, sql) {
        const startTime = Date.now();
        let status = 'success';
        let result = null;
        let errorMessage = null;
        
        // Basic sanitization
        const queryText = sql.trim();
        
        try {
            // Prevent dangerous queries (for MVP)
            const upperQuery = queryText.toUpperCase();
            if (upperQuery.includes('DROP DATABASE') || upperQuery.includes('ALTER USER')) {
                throw new Error('Query not allowed');
            }

            result = await queryRepository.executeQuery(queryText);
        } catch (error) {
            status = 'error';
            errorMessage = error.message;
        }

        const executionTimeMs = Date.now() - startTime;
        
        // Log history asynchronously
        if (userId) {
            queryRepository.logHistory(userId, queryText, status, executionTimeMs).catch(err => {
                console.error('Failed to log query history:', err);
            });
        }

        if (status === 'error') {
            throw new Error(errorMessage);
        }

        return {
            ...result,
            executionTimeMs
        };
    }

    async getHistory(userId) {
        return queryRepository.getHistory(userId);
    }

    async getSchema() {
        return queryRepository.getSchema();
    }

    async analyzeQuery(sql) {
        try {
            // Only SELECT queries are safe for EXPLAIN
            if (!sql.trim().toUpperCase().startsWith('SELECT')) {
                return { error: 'Analysis is only available for SELECT queries.' };
            }

            const explainRows = await queryRepository.getExplainPlan(sql);
            if (!explainRows || explainRows.length === 0) return { error: 'No execution plan generated' };
            
            const rawPlan = explainRows[0].EXPLAIN;
            
            // Generate basic optimization suggestions
            const suggestions = [];
            
            // Simple heuristic based on the JSON string since parsing complex EXPLAIN output can be tricky
            const planStr = typeof rawPlan === 'string' ? rawPlan : JSON.stringify(rawPlan);
            
            if (planStr.includes('"access_type": "ALL"')) {
                suggestions.push({
                    type: 'warning',
                    message: 'Full Table Scan detected. Consider adding an index on the columns used in WHERE or JOIN clauses.'
                });
            }
            if (!planStr.includes('"using_index": true') && planStr.includes('"using_where": true')) {
                suggestions.push({
                    type: 'info',
                    message: 'Query is filtering rows after fetching them. An index might help speed this up.'
                });
            }

            return { plan: rawPlan, suggestions };
        } catch (error) {
            return { error: error.message };
        }
    }

    async saveQuery(userId, title, sql) {
        if (!title || !sql) {
            throw new Error('Title and query text are required');
        }
        const id = await queryRepository.saveQuery(userId, title, sql);
        return { id, title, queryText: sql };
    }

    async getSavedQueries(userId) {
        return queryRepository.getSavedQueries(userId);
    }
}

export default new SqlService();
