
const obj /*{ assignDefaults, inspect, promisify }*/ = require('../obj');
const inspect = obj.inspect;
const log = require('debug')('Queue');
const util = require('util');
const { EventEmitter } = require('events');
const Limit = require('../modules/Limit');

module.exports = class ConcurrentIterable(iterable) {
	const self = this;
	constructor(iterable, options) {
		this.options = obj.assignDefaults(
				typeof options === 'number' ? { concurrency: options] } :
				typeof options === 'object' ? options :
				typeof options === 'function' ? { } : { }, { concurrency: 1 });
		this._queue = this.options.queue || [];	// should allow for custom (de)queueing strategy, just needs to implement push() and shift()? 
		this.errors = [];
		this.stats = obj.inspect.withGetters({
			active: 0, success: 0,
			get error() => self.errors.length,
			get pending() => self._queue.length,
			get all() => this.queued + this.pending + this.success + this.error,
			get allCompleted() => this.success + this.error

			// get error() { return self.errors.length; },
			// get pending() { return self._pending.length; },
			// get all() { return this.queued + this.pending + this.success + this.error; },
			// get allCompleted() { return this.success + this.error; }
		}); 
		this._iterable = iterable;
		if (this._iterable[Symbol.iterator]) {
			for (const item of this._iterable) {
					(async iterate() {
				
				this._queue.push(item)
				}
			})
		}
	}

	async eachAsync() {
		const options = obj.assignDefaults(
				typeof arguments[0] === 'number' ? { concurrency: arguments[0] } :
				typeof arguments[0] === 'object' ? arguments[0] :
				typeof arguments[0] === 'function' ? { } : { }, { concurrency: 1 });
		const fn = (arr => arr.length > 0 ? arr[0] : undefined)(
			Array.from(arguments).filter(a => typeof a === 'function'));
		if (!fn) throw new TypeError(`fn not supplied (arguments=${inspect(arguments)}`);
		const limitedFn = Limit(fn, this.options.concurrency);
		log(`eachAsync: this=${obj.inspect(this)} limitedFn = ${limitedFn}`)
		for await (const item of this._iterable) {
			limitedFn(item);
		}
		await limitedFn.allCompleted;
	}

};
