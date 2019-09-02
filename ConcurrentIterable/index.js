
const obj /*{ assignDefaults, inspect, promisify }*/ = require('../obj');
const inspect = obj.inspect;
const log = require('debug')('Queue');
const util = require('util');
const { EventEmitter } = require('events');
const Limit = require('../Limit');

class ConcurrentIterable {
	constructor(iterable, options) {
		const self = this;
		this.options = obj.assignDefaults(
				typeof options === 'number' ? { concurrency: options } :
				typeof options === 'object' ? options :
				typeof options === 'function' ? { } : { }, { concurrency: 1 });
		this._queue = this.options.queue || [];	// should allow for custom (de)queueing strategy, just needs to implement push() and shift()? 
		this.errors = [];
		this.stats = obj.inspect.withGetters({
			active: 0, success: 0,
			get error() { self.errors.length; },
			get pending() { self._queue.length; },
			get all() { this.queued + this.pending + this.success + this.error; },
			get allCompleted() { this.success + this.error; },

			// get error() { return self.errors.length; },
			// get pending() { return self._pending.length; },
			// get all() { return this.queued + this.pending + this.success + this.error; },
			// get allCompleted() { return this.success + this.error; }
		}); 
		this._iterable = iterable;
		if (this._iterable[Symbol.iterator]) {
			for (const item of this._iterable) {
				// 	(async iterate() {
				
				// this._queue.push(item)
				// }
			}
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


// async functions, some work, some don't. e.g. buffer is good (combine into Buffer.js?), Concurrent is kinda borked

ConcurrentIterable.Buffer = async function* Buffer(iterable) {
	try {
		let items = [];
		let currentIndex = 0;
		console.log(`Buffer starting buffering, items = Array[${items.length}] iterable=${inspect(iterable)}`);
		for await (const item of iterable) {
			items.push(item);
		}
		// console.log(`Buffer awaiting items (buffer to fill), items = Array[${items.length}] items[0]=${inspect(items[0])} iterable=${inspect(iterable)}`);
		// await Promise.all(items);
		console.log(`Buffer finished buffering, items = Array[${items.length}] items[0]=${inspect(items[0])} iterable=${inspect(iterable)}`);
		yield* items;
		// for (const item of items) {
		// 	yield item;
		// }
		console.log(`Buffer finished streaming, items = Array[${items.length}] iterable=${inspect(iterable)}`);
	} catch (e) {
		console.error(`Buffer error: ${e.stack||e}`);
	}
};

ConcurrentIterable.AsyncToSyncIterator = function AsyncToSyncIterator(iterable) {
	try {
		let iterator = iterable[Symbol.asyncIterator]();
		let r = {
			[Symbol.iterator]() { 
				iterator = iterable[Symbol.asyncIterator]();
				// console.verbose(`AsyncToSyncIterator: iterable[Symbol.asyncIterator]=${inspect(iterable[Symbol.asyncIterator])} iterator=${inspect(iterator)} this=${inspect(this)}`);
				console.verbose(`AsyncToSyncIterator: this=${inspect(this)}`);
				return this;
				// return iterator;//iterable[Symbol.asyncIterator]();
			},
			next(...args) {
				let item = iterator.next(...args);
				console.verbose(`AsyncToSyncIterator.next(${inspect(args)}): item=${inspect(item)} this=${inspect(this)}`);	
				item.then(v => console.verbose(`AsyncToSyncIterator.next.then: v=${inspect(v)}`));
				return { value: item, done: false };
			}
		};
		console.verbose(`AsyncToSyncIterator: iterable[Symbol.asyncIterator]=${inspect(iterable[Symbol.asyncIterator])}\n\titerable=${inspect(iterable)}\n\titerator=${inspect(iterator)}\n\tr=${inspect(r)}\n\tthis=${inspect(this)}`);
		return r;
	} catch (e) {
		console.error(`AsyncToSyncIterator error: ${e.stack||e}`);
	}
};

ConcurrentIterable.ConcurrentAsync = async function* ConcurrentAsync(concurrency, iterable) {
	try {
		// if (concurrency < 1) throw new Error(`concurrency must be >= 1, supplied argument concurrency=${concurrency}`);
		let active = [];
		let done = false;
		let n = 0;
		console.log(`Concurrent starting iteration, active=Array[${active.length}] iterable=${inspect(iterable)}`);
		for (let item = await iterable.next(); !done; item = await iterable.next()) {	// of /*AsyncToSyncIterator*/(iterable)) {
			console.log(`Concurrent got item #${n}=${inspect(item)}, active=Array[${active.length}] iterable=${inspect(iterable)}`);
			// console.log(`Concurrent activating task #${n}, done=${done} active=Array[${active.length}] iterable=${inspect(iterable)}\n\tprItem=${prItem}`);
			active.push(prItem);//.catch(e => { throw e; }));
			prItem.then(item => {
				active = active.splice(active.getIndexOf(prItem), 1);
				done = item.done;
				console.log(`Concurrent task prItem.then: item=${inspect(item)} active=${inspect(active)} done=${done}`)
			});
			while (active.length >= concurrency && !done) {
				console.log(`Concurrent task #${n} waiting for active tasks, active=Array[${active.length}] iterable=${inspect(iterable)}`);
				await pDelay(100).race(active);
			}
			let item = await prItem;
			// done = item.done;
			yield item.value;
			n++;
		}
		console.log(`Concurrent finished iteration, active=Array[${active.length}] iterable=${inspect(iterable)}`);
	} catch (e) {
		console.error(`Concurrent error: ${e.stack||e}`);
	}
};

module.exports = ConcurrentIterable;
