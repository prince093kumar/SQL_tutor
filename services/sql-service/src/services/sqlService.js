import queryRepository from '../repositories/queryRepository.js';

import { LRUCache, SchemaGraph, SQLTrie } from '../../../../packages/algorithms/index.js';

class SqlService {
    constructor() {
        this.trie = new SQLTrie();
        this.schemaCache = new LRUCache(5);
        this.readOnlyQueryCache = new LRUCache(50);
        this._initKeywords();
    }

    _initKeywords() {
        const keywords = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT'];
        keywords.forEach(kw => this.trie.insert(kw, { type: 'keyword', label: kw }));
    }

    async getAutocompleteSuggestions(prefix = '') {
        const autocompleteTrie = new SQLTrie();
        this._getSqlDictionary().forEach(item => autocompleteTrie.insert(item.word, item));

        try {
            const schema = await this.getSchema();
            schema.tables.forEach(table => {
                autocompleteTrie.insert(table.name, { type: 'table', label: table.name });
                table.columns.forEach(column => {
                    autocompleteTrie.insert(column.name, { type: 'column', label: `${table.name}.${column.name}` });
                });
            });

            return this._dedupeSuggestions(autocompleteTrie.searchPrefix(prefix, 30)).slice(0, 20);
        } catch (error) {
            console.error("Autocomplete Schema Error", error);
            return this.trie.searchPrefix(prefix, 20);
        }
    }

    _getSqlDictionary() {
        return [
            'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'JOIN', 'INNER',
            'LEFT', 'RIGHT', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'COUNT',
            'SUM', 'AVG', 'MIN', 'MAX'
        ].map(word => ({ word, type: 'keyword', label: word }));
    }

    _dedupeSuggestions(suggestions) {
        const seen = new Set();
        return suggestions.filter(suggestion => {
            const key = `${suggestion.type}:${suggestion.word.toLowerCase()}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    mapMysqlError(error) {
        const errorMap = {
            ER_NO_SUCH_TABLE: {
                code: 'TABLE_NOT_FOUND',
                message: "Table doesn't exist.",
                hint: 'Create the table or reset the practice database.'
            },
            ER_BAD_FIELD_ERROR: {
                code: 'COLUMN_NOT_FOUND',
                message: "Column doesn't exist.",
                hint: 'Check the column name in the Explorer schema.'
            },
            ER_PARSE_ERROR: {
                code: 'SQL_SYNTAX_ERROR',
                message: 'SQL syntax error.',
                hint: 'Check SQL keywords, commas, and clause order.'
            },
            ER_DUP_ENTRY: {
                code: 'DUPLICATE_VALUE',
                message: 'Duplicate value.',
                hint: 'Use a unique primary key or omit auto-increment id values.'
            },
            ER_NO_REFERENCED_ROW: {
                code: 'FOREIGN_KEY_FAILED',
                message: 'Foreign key constraint failed.',
                hint: 'Insert the referenced parent row before inserting this record.'
            },
            ER_NO_REFERENCED_ROW_2: {
                code: 'FOREIGN_KEY_FAILED',
                message: 'Foreign key constraint failed.',
                hint: 'Insert the referenced parent row before inserting this record.'
            }
        };

        return errorMap[error.code] || {
            code: error.code || 'SQL_ERROR',
            message: error.sqlMessage || error.message || 'Query failed.',
            hint: 'Review the query and database schema, then try again.'
        };
    }

    async executeQuery(userId, sql) {
        const startTime = Date.now();
        let status = 'success';
        
        // Basic sanitization
        const queryText = sql.trim();
        
        try {
            // Prevent dangerous queries (for MVP)
            const upperQuery = queryText.toUpperCase();
            if (upperQuery.includes('DROP DATABASE') || upperQuery.includes('ALTER USER')) {
                throw new Error('Query not allowed');
            }

            const cacheKey = `${userId || 'anonymous'}:${queryText}`;
            if (this._isCacheableReadQuery(queryText)) {
                const cachedResult = this.readOnlyQueryCache.get(cacheKey);
                if (cachedResult) {
                    const executionTime = Date.now() - startTime;
                    if (userId) {
                        queryRepository.logHistory(userId, queryText, status, executionTime).catch(err => {
                            console.error('Failed to log query history:', err);
                        });
                    }

                    return {
                        ...cachedResult,
                        cache: { hit: true, strategy: 'LRU' },
                        executionTime,
                        executionTimeMs: executionTime
                    };
                }
            }

            const result = await queryRepository.executeQuery(queryText);
            const executionTime = Date.now() - startTime;
            const rowCount = Array.isArray(result.rows) && result.rows.length > 0
                ? result.rows.length
                : result.affectedRows;

            if (userId) {
                queryRepository.logHistory(userId, queryText, status, executionTime).catch(err => {
                    console.error('Failed to log query history:', err);
                });
            }

            const response = {
                success: true,
                rows: result.rows,
                fields: result.fields,
                executionTime,
                executionTimeMs: executionTime,
                rowCount,
                affectedRows: result.affectedRows,
                insertId: result.insertId,
                warningStatus: result.warningStatus
            };

            if (this._isCacheableReadQuery(queryText)) {
                this.readOnlyQueryCache.put(cacheKey, response);
            } else {
                this.readOnlyQueryCache.clear();
                this.schemaCache.clear();
            }

            return response;
        } catch (error) {
            status = 'error';
            const executionTime = Date.now() - startTime;
            if (userId) {
                queryRepository.logHistory(userId, queryText, status, executionTime).catch(err => {
                console.error('Failed to log query history:', err);
            });
            }

            return {
                success: false,
                error: this.mapMysqlError(error),
                executionTime,
                executionTimeMs: executionTime,
                rowCount: 0
            };
        }
    }

    async getHistory(userId) {
        return queryRepository.getHistory(userId);
    }

    async getSchema() {
        const cachedSchema = this.schemaCache.get('practice_db');
        if (cachedSchema) return { ...cachedSchema, cache: { hit: true, strategy: 'LRU' } };

        const schema = await queryRepository.getSchema();
        this.schemaCache.put('practice_db', schema);
        return schema;
    }

    async getSchemaGraph(startTable) {
        const schema = await this.getSchema();
        const graph = new SchemaGraph();

        schema.tables.forEach(table => graph.addTable(table.name));
        (schema.relationships || []).forEach(relationship => {
            graph.addRelationship(relationship.table, relationship.referencedTable, {
                column: relationship.column,
                referencedColumn: relationship.referencedColumn,
                direction: 'outbound'
            });
        });

        const firstTable = startTable || schema.tables[0]?.name;
        return {
            database: schema.database,
            relationships: schema.relationships || [],
            traversal: firstTable ? {
                startTable: firstTable,
                bfs: graph.bfs(firstTable),
                dfs: graph.dfs(firstTable)
            } : null,
            reactFlow: graph.toReactFlow()
        };
    }

    async resetPracticeDatabase() {
        const schema = await queryRepository.resetPracticeDatabase();
        this.schemaCache.clear();
        this.readOnlyQueryCache.clear();
        return schema;
    }

    _isCacheableReadQuery(sql) {
        const normalized = sql.trim().replace(/;$/, '').toUpperCase();
        return normalized.startsWith('SELECT') && !/\b(NOW|RAND|UUID|CURRENT_TIMESTAMP)\s*\(/.test(normalized);
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

    async saveQuery(userId, title, sql, collection = 'Practice', notes = '') {
        if (!title || !sql) {
            throw new Error('Title and query text are required');
        }
        const id = await queryRepository.saveQuery(userId, title, sql, collection, notes);
        return { id, title, queryText: sql, collection, notes };
    }

    async getSavedQueries(userId) {
        return queryRepository.getSavedQueries(userId);
    }

    async updateSavedQuery(userId, id, data) {
        if (!data.title || !data.query) {
            throw new Error('Title and query text are required');
        }
        return queryRepository.updateSavedQuery(userId, id, data);
    }

    async deleteSavedQuery(userId, id) {
        return queryRepository.deleteSavedQuery(userId, id);
    }
}

export default new SqlService();
