const Limit = require('@jbowwww/limit');

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
				.once(options.event||'data', (data) => resolve({ value: data, done: false}))
				.once(options.endEvent||'end', () => resolve({ done: true })).once('error', reject);
			});
		} else {
			console.log(`Could not get source iteration technique!`);
		}
		// Object.defineProperty(input, '_next', { enumerable: false, writeable: false, configurable: false, value: next });
		(function pushPr(next) {
			// wrapping in promise should allow this to handle async and non-async generators?
			let pr = Promise.resolve(next());
			p.add(pr);
			pr.then(({ done, val }) => {
				p.delete(pr);
				if (!done) {
					pushPr(next);
				}
			});
		})(next);
	}
	const r = {
		next: async () => {
			return p.size > 0 ? Promise.race(p)/*.then(value => ({ value }))*/ : Promise.resolve({ done: true });
		},
		// [Symbol.iterator]() { return this; },
		[Symbol.asyncIterator]() { return this; },
		async pipe(...fns) {
			for await (let data of this) {
				for (const fn of fns) {
					data = await fn(data);
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
