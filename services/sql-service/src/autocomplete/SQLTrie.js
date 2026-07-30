export class TrieNode {
    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
        this.value = null; // Can store metadata like type ('keyword', 'table', 'column')
    }
}

export class SQLTrie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word, metadata = { type: 'keyword' }) {
        let node = this.root;
        for (const char of word.toLowerCase()) {
            if (!node.children.has(char)) {
                node.children.set(char, new TrieNode());
            }
            node = node.children.get(char);
        }
        node.isEndOfWord = true;
        node.value = { word, ...metadata };
    }

    searchPrefix(prefix) {
        let node = this.root;
        for (const char of prefix.toLowerCase()) {
            if (!node.children.has(char)) {
                return [];
            }
            node = node.children.get(char);
        }
        
        return this._collectAllWords(node);
    }

    _collectAllWords(node) {
        let results = [];
        if (node.isEndOfWord) {
            results.push(node.value);
        }
        
        for (const [char, childNode] of node.children.entries()) {
            results = results.concat(this._collectAllWords(childNode));
        }
        
        return results;
    }
}
