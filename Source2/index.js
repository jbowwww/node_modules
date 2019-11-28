const { event } = require('@jbowwww/promise');
const Limit = require('@jbowwww/limit');
const debug = require('debug')('@jbowwww/Source2');

async function* emitter(emitter, options, mapFn) {
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
		mapFn = data => data;
	}
	if (typeof mapFn !== 'function') {
		throw new TypeError(`Unknown argument(s)`);
	}
	debug(`emitter: emitter=${inspect(emitter)} options=${inspect(options)} mapFn=${inspect(mapFn)}`);
	return {
		next() {
			return Promise.race(
				event(emitter, options).then(mapFn);
		},
		[Symbol.asyncIterator]() {
			return this;
		}
	};
}

function combine(...inputs) {
	const p = new Set();
	for (const input in inputs) {
		debug(`combine: input=${inspect(input)}`);
		const it = typeof input[Symbol.asyncIterator] === 'function'
			? input[Symbol.asyncIterator]() : input[Symbol.iterator]();
		(async pushNext(next) => {
			const pr = Promise.resolve(next());
			p.add(pr);
			pr.then(({ value, done }) => {
				p.delete(pr);
				if (!done) {
					pushNext(next);
				}
			}.catch(e => {
				p.delete(pr);
				debug(`warn: combine input=${inspect(input)} caught exception: ${e.stack||e}`);
				pushNext(next);
			});
		})(it.next);
		return {
			[Symbol.asyncIterator]() { return this; },
			next: () => p.size > 0 ? Promise.race(p.toArray()) : Promise.resolve({ done: true });
		};
	}
}
