class DoublyLinkedNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

export class LRUCache {
    constructor(capacity = 100) {
        this.capacity = capacity;
        this.items = new Map();
        this.head = new DoublyLinkedNode(null, null);
        this.tail = new DoublyLinkedNode(null, null);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    get(key) {
        const node = this.items.get(key);
        if (!node) return undefined;

        this.moveToFront(node);
        return node.value;
    }

    put(key, value) {
        const existing = this.items.get(key);
        if (existing) {
            existing.value = value;
            this.moveToFront(existing);
            return;
        }

        const node = new DoublyLinkedNode(key, value);
        this.items.set(key, node);
        this.addAfterHead(node);

        if (this.items.size > this.capacity) {
            const leastUsed = this.tail.prev;
            this.remove(leastUsed);
            this.items.delete(leastUsed.key);
        }
    }

    has(key) {
        return this.items.has(key);
    }

    delete(key) {
        const node = this.items.get(key);
        if (!node) return false;

        this.remove(node);
        return this.items.delete(key);
    }

    clear() {
        this.items.clear();
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    moveToFront(node) {
        this.remove(node);
        this.addAfterHead(node);
    }

    addAfterHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }

    remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
}
