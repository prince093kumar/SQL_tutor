export class SchemaGraph {
    constructor() {
        this.adjacencyList = new Map();
    }

    addTable(tableName) {
        if (!this.adjacencyList.has(tableName)) {
            this.adjacencyList.set(tableName, []);
        }
    }

    addRelationship(fromTable, toTable, metadata = {}) {
        this.addTable(fromTable);
        this.addTable(toTable);

        this.adjacencyList.get(fromTable).push({ table: toTable, ...metadata });
        this.adjacencyList.get(toTable).push({
            table: fromTable,
            ...metadata,
            direction: metadata.direction === 'outbound' ? 'inbound' : 'outbound'
        });
    }

    bfs(startTable) {
        if (!this.adjacencyList.has(startTable)) return [];

        const visited = new Set([startTable]);
        const queue = [startTable];
        const order = [];

        while (queue.length > 0) {
            const table = queue.shift();
            order.push(table);

            for (const neighbor of this.adjacencyList.get(table)) {
                if (!visited.has(neighbor.table)) {
                    visited.add(neighbor.table);
                    queue.push(neighbor.table);
                }
            }
        }

        return order;
    }

    dfs(startTable) {
        const order = [];
        const visited = new Set();

        const visit = table => {
            if (!this.adjacencyList.has(table) || visited.has(table)) return;
            visited.add(table);
            order.push(table);

            for (const neighbor of this.adjacencyList.get(table)) {
                visit(neighbor.table);
            }
        };

        visit(startTable);
        return order;
    }

    toReactFlow() {
        const nodes = Array.from(this.adjacencyList.keys()).map(table => ({
            id: table,
            data: { label: table },
            type: 'default'
        }));
        const seenEdges = new Set();
        const edges = [];

        for (const [source, relationships] of this.adjacencyList.entries()) {
            for (const relationship of relationships) {
                const edgeId = [source, relationship.table].sort().join('__');
                if (seenEdges.has(edgeId)) continue;
                seenEdges.add(edgeId);

                edges.push({
                    id: edgeId,
                    source,
                    target: relationship.table,
                    label: relationship.column ? `${relationship.column} -> ${relationship.referencedColumn}` : undefined
                });
            }
        }

        return { nodes, edges };
    }
}
