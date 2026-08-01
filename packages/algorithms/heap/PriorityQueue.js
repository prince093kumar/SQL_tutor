export class PriorityQueue {
    constructor(prioritySelector = item => item.priority ?? 0) {
        this.prioritySelector = prioritySelector;
        this.items = [];
    }

    enqueue(item) {
        this.items.push(item);
        this.bubbleUp(this.items.length - 1);
    }

    dequeue() {
        if (this.items.length === 0) return null;
        if (this.items.length === 1) return this.items.pop();

        const highestPriority = this.items[0];
        this.items[0] = this.items.pop();
        this.bubbleDown(0);
        return highestPriority;
    }

    toArray(limit = this.items.length) {
        const copy = new PriorityQueue(this.prioritySelector);
        copy.items = [...this.items];
        const results = [];

        while (results.length < limit && copy.items.length > 0) {
            results.push(copy.dequeue());
        }

        return results;
    }

    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.priority(index) <= this.priority(parentIndex)) break;

            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }

    bubbleDown(index) {
        while (true) {
            const leftIndex = index * 2 + 1;
            const rightIndex = index * 2 + 2;
            let highestIndex = index;

            if (leftIndex < this.items.length && this.priority(leftIndex) > this.priority(highestIndex)) {
                highestIndex = leftIndex;
            }
            if (rightIndex < this.items.length && this.priority(rightIndex) > this.priority(highestIndex)) {
                highestIndex = rightIndex;
            }
            if (highestIndex === index) break;

            this.swap(index, highestIndex);
            index = highestIndex;
        }
    }

    priority(index) {
        return this.prioritySelector(this.items[index]);
    }

    swap(firstIndex, secondIndex) {
        [this.items[firstIndex], this.items[secondIndex]] = [this.items[secondIndex], this.items[firstIndex]];
    }
}
