export class TrieNode {
    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
        this.value = null;
    }
}

export class SQLTrie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word, metadata = {}) {
        if (!word) return;

        let node = this.root;
        for (const char of word.toLowerCase()) {
            if (!node.children.has(char)) {
                node.children.set(char, new TrieNode());
            }
            node = node.children.get(char);
        }

        node.isEndOfWord = true;
        node.value = { word, label: word, ...metadata };
    }

    searchPrefix(prefix = '', limit = 20) {
        let node = this.root;
        for (const char of prefix.toLowerCase()) {
            if (!node.children.has(char)) return [];
            node = node.children.get(char);
        }

        return this.collect(node, [], limit);
    }

    collect(node, results, limit) {
        if (results.length >= limit) return results;
        if (node.isEndOfWord) results.push(node.value);

        for (const child of node.children.values()) {
            this.collect(child, results, limit);
            if (results.length >= limit) break;
        }

        return results;
    }
}
