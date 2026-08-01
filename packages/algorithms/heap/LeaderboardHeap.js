export class MaxHeap {
    constructor(scoreSelector = item => item.score ?? item.total_score ?? 0) {
        this.scoreSelector = scoreSelector;
        this.items = [];
    }

    insert(item) {
        this.items.push(item);
        this.bubbleUp(this.items.length - 1);
    }

    peek() {
        return this.items[0] || null;
    }

    extractMax() {
        if (this.items.length === 0) return null;
        if (this.items.length === 1) return this.items.pop();

        const max = this.items[0];
        this.items[0] = this.items.pop();
        this.bubbleDown(0);
        return max;
    }

    top(k) {
        const copy = new MaxHeap(this.scoreSelector);
        copy.items = [...this.items];
        const results = [];

        while (results.length < k && copy.items.length > 0) {
            results.push(copy.extractMax());
        }

        return results;
    }

    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.score(index) <= this.score(parentIndex)) break;

            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }

    bubbleDown(index) {
        while (true) {
            const leftIndex = index * 2 + 1;
            const rightIndex = index * 2 + 2;
            let largestIndex = index;

            if (leftIndex < this.items.length && this.score(leftIndex) > this.score(largestIndex)) {
                largestIndex = leftIndex;
            }
            if (rightIndex < this.items.length && this.score(rightIndex) > this.score(largestIndex)) {
                largestIndex = rightIndex;
            }
            if (largestIndex === index) break;

            this.swap(index, largestIndex);
            index = largestIndex;
        }
    }

    score(index) {
        return this.scoreSelector(this.items[index]);
    }

    swap(firstIndex, secondIndex) {
        [this.items[firstIndex], this.items[secondIndex]] = [this.items[secondIndex], this.items[firstIndex]];
    }
}
