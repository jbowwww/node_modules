const { event } = require('@jbowwww/promise');
const Limit = require('@jbowwww/limit');
const debug = require('@jbowwww/debug')('@jbowwww/Source2');
const { inspect } = require('util');

module.exports = {
	emitter,
	combine
};

function emitter(emitter, options, mapFn) {
	if (!emitter.once) {	// let options optionally go first
		if (typeof options.once === 'function') {
			const swap = emitter;
			emitter = options;
			options = swap; 
		} else {
			throw new TypeError(`Arguments must include one emitter with a .once() method, before any mapFn`);
		}
	} else if (typeof options === 'function') {
		const swap = mapFn;
		mapFn = options;
		options = swap;	// could be undefined
	}
	options = { event: 'data', error: 'error', end: 'end', ...(options || {}) };
	if (!mapFn) {
		mapFn = data => ({ value: data, done: false });
	}
	if (typeof mapFn !== 'function') {
		throw new TypeError(`Unknown argument(s)`);
	}
	debug(`emitter: emitter=${inspect(emitter)} options=${inspect(options)} mapFn=${inspect(mapFn)}`);
	const emitEndPr = new Promise((resolve, reject) => {
		emitter.once(options.end, resolve);
		emitter.once(options.error, reject);
	});
	return {
		next: () => Promise.race([
			emitEndPr.then(() => ({ done: true })),
			new Promise((resolve, reject) => {
				emitter.once(options.event, resolve);
				emitter.once(options.error, reject);
			})
			.then(mapFn)
			.then(data =>
				 typeof data !== 'object'
			 ||  typeof data.value === null
			 ||  typeof data.done !== 'boolean'
			 ?	 ({ value: data, done: false })
			 : 	 data)
		]),
		[Symbol.asyncIterator]() { return this; }
	};
}

function combine(...inputs) {
	const p = new Set();
	for (const input of inputs) {
		debug(`combine: input=${inspect(input)}`);
		const it = typeof input[Symbol.asyncIterator] === 'function'
			? input[Symbol.asyncIterator]() : input[Symbol.iterator]();
		(async function pushNext(next) {
			const pr =
				Promise.resolve(next())
				.then(({ value, done }) => {
					p.delete(pr);
					if (!done) {
						pushNext(next);
					}
					return ({ value, done });
				}).catch(e => {
					p.delete(pr);
					debug(`warn: combine input=${inspect(input)} caught exception: ${e.stack||e}`);
					pushNext(next);
				});
			p.add(pr);
		})(it.next.bind(it));
	}
	return {
		[Symbol.asyncIterator]() { return this; },
		next: () => p.size > 0 ? Promise.race(Array.from(p)) : Promise.resolve({ done: true })
	};
}
