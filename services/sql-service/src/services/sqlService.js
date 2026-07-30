import queryRepository from '../repositories/queryRepository.js';

import { SQLTrie } from '../autocomplete/SQLTrie.js';

class SqlService {
    constructor() {
        this.trie = new SQLTrie();
        this._initKeywords();
    }

    _initKeywords() {
        const keywords = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT'];
        keywords.forEach(kw => this.trie.insert(kw, { type: 'keyword', label: kw }));
    }

    async getAutocompleteSuggestions(prefix = '') {
        // Hybrid Approach: Trie (keywords) + Live Schema (tables/columns)
        
        // 1. Get Keywords from Trie
        let suggestions = prefix ? this.trie.searchPrefix(prefix) : [];
        
        // 2. Get Live Schema Data
        try {
            const schema = await this.getSchema();
            // schema is array of { TABLE_NAME, COLUMN_NAME }
            const schemaSuggestions = [];
            
            const tables = [...new Set(schema.map(col => col.TABLE_NAME))];
            
            tables.forEach(table => {
                if (table.toLowerCase().startsWith(prefix.toLowerCase())) {
                    schemaSuggestions.push({ word: table, type: 'table', label: table });
                }
            });
            
            schema.forEach(col => {
                if (col.COLUMN_NAME.toLowerCase().startsWith(prefix.toLowerCase())) {
                    schemaSuggestions.push({ word: col.COLUMN_NAME, type: 'column', label: `${col.TABLE_NAME}.${col.COLUMN_NAME}` });
                }
            });
            
            suggestions = [...suggestions, ...schemaSuggestions];
            
            // Deduplicate
            const uniqueSuggestions = Array.from(new Set(suggestions.map(a => a.word)))
                .map(word => {
                return suggestions.find(a => a.word === word)
            });

            return uniqueSuggestions.slice(0, 20); // Return top 20
        } catch (error) {
            console.error("Autocomplete Schema Error", error);
            return suggestions.slice(0, 20);
        }
    }
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
