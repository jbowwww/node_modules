const Limit = require('@jbowwww/limit');
const debug = require('@jbowwww/debug')('source');
const { inspect } = require('util');

// TODO: Finish combining 'source' mopdule into this one by allowing 'input' param to be an array of sources instead of just a source
// definitely needs unit tests
module.exports = source;

function source(...inputs) {
	const isOptionsArg = (arg) => typeof arg === 'object'
		 &&	!arg[Symbol.asyncIterator]
		 && !arg.addEventListener
		 && !arg.on
		 && !arg.once;
	if (inputs.length === 0) throw new TypeError(`source needs to have >0 input parameters`);
	let options = { event: 'data', endEvent: 'end' };
	if (isOptionsArg(inputs[0])) {
		options = Object.assign({}, options, inputs.shift());
	} else if (isOptionsArg(inputs[inputs.length - 1])) {
		options = Object.assign({}, options, inputs.pop());
	}
	let p = new Set();
	for (let input of (!inputs.length ? [ inputs ] : inputs)) {
		let next = null;
		if (input[Symbol.asyncIterator]) {
			const it = input[Symbol.asyncIterator]();
			next = it.next.bind(it);
		} else if (input[Symbol.iterator]) {
			const it = input[Symbol.iterator]();
			next = it.next.bind(it);
		} else if (input.addEventListener || input.on || input.once) {
			next = () => new Promise((resolve, reject) => {
				input
				.once(options.event||'data', (data) => resolve({ value: data, done: false }))
				.once(options.endEvent||'end', () => resolve({ done: true })).once('error', reject);
			});
		} else {
			debug(`Could not get source iteration technique!`);
		}
		// Object.defineProperty(input, '_next', { enumerable: false, writeable: false, configurable: false, value: next });
		(function pushPr(next) {
			// wrapping in promise should allow this to handle async and non-async generators?
			let pr = Promise.resolve(next())
			.then(r => {
				if (r && !r.done) {
					pushPr(next);
				}
				return r;
			})
		.catch(e => {
				debug(`warn: Source e=${inspect(e.stack||e)}`);
				pushPr(next);
			}).finally(r => { p.delete(pr); return r; });
			p.add(pr);
		})(next);
	}
	const r = {
		next() {
			return p.size > 0 ? 
				Promise.race(p)
				// .then((value) => ({ value, done: false }))
				.catch(e => {
					debug(`warn: Source e=${inspect(e.stack||e)}`);
					return ({ done: false })
			 	})
			 : 	Promise.resolve({ done: true });
		},
		// [Symbol.iterator]() { return this; },
		[Symbol.asyncIterator]() { return this; },
		async pipe(...fns) {
			for await (let data of this) {
				try {
					for (const fn of fns) {
						data = await fn(data);
					}
				} catch (e) {
					debug(`warn: data=${inspect(data)} e=${e.stack||e}`);
				}
				// yield data;
			}
		}
	};
	return r;
}

source.pipe = sourcePipe;

async function sourcePipe(...args) {
	return await source(...args).pipe();
}
