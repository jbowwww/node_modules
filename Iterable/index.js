
const obj /*{ assignDefaults, inspect, promisify }*/ = require('../obj');
const inspect = obj.inspect;
const log = require('debug')('Iterable');
const util = require('util');
const Queue = require('@jbowwww/queue');
// async functions, some work, some don't. e.g. buffer is good (combine into Buffer.js?), Concurrent is kinda borked

// TODO: how to do progress / pass on progress from an iterable passed? (e.g. FsIterable)
// do i need to make this a class? and implement the async iter manually...
// defeats the syntactic sugar tho .. can i somehow wrap it in a async BufferWrap(...args) => (async function* Buffer()).call({}, ...args)
module.exports = {
	getIterableOptions,
	Progress,
	Buffer,
	async* Queue(options, iterateFn) { return yield(iterable => Queue.Iterate(options, iterable, iterateFn)); },//.Queue.Iterate,
	AsyncToSyncIterator
};

function getIterableOptions(...args/*, defaultOptions = {}*/) {
	let iterable, options = { };
	for (const arg of args) {
		if (obj.isIterable(arg)) {
			iterable = arg;
		} else if (obj.isPlain(arg)) {
			if (arg.iterable && obj.isIterable(arg.iterable) && obj.isPlain(arg.options)) {
				options = arg.options;
				iterable = arg.iterable;
			} else {
				options = arg;
			}
		} else {
			throw new TypeError(`Unknown argument ${inspect(arg)}`);
		}
	}
	return { iterable, options };
}

async function* Parallel(/*iterable, options*/) {
	let iterable, options = { };
	for (const arg of arguments) {
		if (arg[Symbol.iterator] /*|| arg[Symbol.asyncIterator]*/) {
			iterable = arg;
		} else if (obj.isPlain(arg)) {
			options = obj.assign(arg, options);
		}
	}
	let count = 0;
	log(`Progress starting, iterable=${inspect(iterable)} options=${inspect(options)} this=${inspect(this)} options.getTotal(iterable)=${options.getTotal(iterable)}`);
	for (const value of iterable) {
		
	}
}

async function* Progress(iterable, options) {
	// let iterable;
	/*let*/ options = options || { getTotal: _iterable => _iterable.length };
	// for (const arg of arguments) {
	// 	if (arg[Symbol.iterator] || arg[Symbol.asyncIterator]) {
	// 		iterable = arg;
	// 	} else if (obj.isPlain(arg)) {
	// 		options = obj.assign(arg, options);
	// 	}
	// }

	let count = 0;
	// iterable = iterable();
	log(`Progress starting, iterable=${inspect(iterable)} options=${inspect(options)} this=${inspect(this)} options.getTotal(iterable)=${options.getTotal(iterable)}`);
	for (const value of iterable) {
		let item = {
			value: value,
			progress:  obj.inspect.withGetters({
				count: ++count,
				total: options.getTotal(iterable),//iterable.length;,
				get progress () { return this.count / this.total; },
				get progressPercent ()  { return this.progress * 100; }
			})
		};
		log(`Progress yielding item=${inspect(item)}`);
		yield item;
	}
}

async function* Buffer(iterable) {
	try {
		let items = [];
		let currentIndex = 0;
		log(`Buffer starting buffering, items = Array[${items.length}] iterable=${inspect(iterable)} this=${inspect(this)}`);
		for await (const item of iterable) {
			items.push(item);
		}
		// console.log(`Buffer awaiting items (buffer to fill), items = Array[${items.length}] items[0]=${inspect(items[0])} iterable=${inspect(iterable)}`);
		// await Promise.all(items);
		console.log(`Buffer finished buffering, items = Array[${items.length}] items[0]=${inspect(items[0])} iterable=${inspect(iterable)}`);
		// return items;
		yield* items;
		// for (const item of items) {
		// 	yield item;
		// }
		console.log(`Buffer finished streaming, items = Array[${items.length}] iterable=${inspect(iterable)}`);
	} catch (e) {
		console.error(`Buffer error: ${e.stack||e}`);
	}
}

function AsyncToSyncIterator(iterable) {
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
}
