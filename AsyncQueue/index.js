
/**
 * @returns a Promise for an Array with the elements
 * in `asyncIterable`
 */
async function takeAsync(asyncIterable, count=Infinity) {
    const result = [];
    const iterator = asyncIterable[Symbol.asyncIterator]();
    while (result.length < count) {
        const {value,done} = await iterator.next();
        if (done) break;
        result.push(value);
    }
    return result;
};

module.exports = class AsyncQueue {

    constructor(options = {}) {
        this.options = obj.assignDefaults(options, { innerQueueType: Array })
        this._values = new options.innerQueueType();    // enqueues > dequeues
        this._settlers = new options.innerQueueType();              // dequeues > enqueues
        this._closed = false;
    }

    [Symbol.asyncIterator]() {
        return this;
    }
    
    push(value) {
        if (this._closed) {
            throw new Error('Closed');
        }
        if (this._settlers.length > 0) {
            if (this._values.length > 0) {
                throw new Error('Illegal internal state');
            }
            const settler = this._settlers.shift();
            if (value instanceof Error) {
                settler.reject(value);
            } else {
                settler.resolve({value});
            }
        } else {
            this._values.push(value);
        }
    }

    /**
     * @returns a Promise for an IteratorResult
     */
    next() {
        if (this._values.length > 0) {
            const value = this._values.shift();
            if (value instanceof Error) {
                return Promise.reject(value);
            } else {
                return Promise.resolve({value});
            }
        }
        if (this._closed) {
            if (this._settlers.length > 0) {
                throw new Error('Illegal internal state');
            }
            return Promise.resolve({done: true});
        }
        // Wait for new values to be enqueued
        return new Promise((resolve, reject) => {
            this._settlers.push({resolve, reject});
        });
    }

    close() {
        while (this._settlers.length > 0) {
            this._settlers.shift().resolve({done: true});
        }
        this._closed = true;
    }

}
