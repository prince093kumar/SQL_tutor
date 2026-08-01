# SQLLab DSA Architecture

SQLLab uses five DSA concepts only where they solve real product problems.

| DSA concept | Feature | Implementation |
| --- | --- | --- |
| Trie | SQL autocomplete | `packages/algorithms/trie/SQLTrie.js` powers keyword, table, column, and function prefix lookup. |
| LRU cache | Schema and safe read-query cache | `packages/algorithms/cache/LRUCache.js` caches schema metadata and repeat read-only `SELECT` results. |
| Max heap | Leaderboard Top-K | `packages/algorithms/heap/LeaderboardHeap.js` ranks leaderboard candidates without sorting in service code. |
| Graph with BFS/DFS | ER diagram relationships | `packages/algorithms/graph/SchemaGraph.js` turns foreign keys into traversal and React Flow data. |
| Priority queue | Challenge recommendations | `packages/algorithms/heap/PriorityQueue.js` ranks challenge candidates by weak topic, difficulty fit, unfinished status, and recency. |

## Service Mapping

- `sql-service` uses `SQLTrie` for `/autocomplete`.
- `sql-service` uses `LRUCache` for schema metadata and cacheable read-only query responses.
- `sql-service` uses `SchemaGraph` for `/schema/graph`.
- `challenge-service` uses `MaxHeap` for `/leaderboard`.
- `challenge-service` uses `PriorityQueue` for `/recommended`.

## Caching Rule

Only safe read-only `SELECT` queries are cached. Mutating SQL and schema-changing statements clear query and schema caches because their results require invalidation.
