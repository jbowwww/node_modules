const Limit = require('@jbowwww/limit');

// TODO: Finish combining 'source' mopdule into this one by allowing 'input' param to be an array of sources instead of just a source
// definitely needs unit tests
module.exports = (inputs, options = {}, fn) => {
	const defaultOptions = { concurrency: 1 };
	if (typeof options === 'function' && fn === undefined) {
		fn = options;
		options = defaultOptions;
	} else if (typeof options === 'object') {
		options = { ...defaultOptions, ...options };// Object.assign({ }, defaultOptions, options);
	} else {
		throw new TypeError(`options should be an object`);
	}
	if (!!fn) {
		if (typeof fn !== 'function') {
			throw new TypeError(`fn should be a function`);
		}
		if (typeof options.concurrency === 'number') {
			fn = Limit(fn);
		}
	}
	const p = [];
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
				input.once(options.event||'data', (data) => resolve({ value: data, done: false})).once('end', () => resolve({ done: true })).once('error', reject); });
		} else {
			console.log(`Could not get source iteration technique!`);
		}
		// Object.defineProperty(input, '_next', { enumerable: false, writeable: false, configurable: false, value: next });
		(function pushPr(next) {
			let pr = Promise.resolve(typeof fn === 'function' ? fn.call(input, next()) : next());
			p.push(pr);
			pr.then(({ done, val }) => {
				p.splice(p.indexOf(pr));
				if (!done) {
					pushPr();
				}
			});
		})(next);
	}
	const r = {
		next: async () => {
			return p.length > 0 ? Promise.race(p) : Promise.resolve({ done: true });
		},
		[Symbol.iterator]() { return this; },
		[Symbol.asyncIterator]() { return this; } 
	};
	return r;
;}