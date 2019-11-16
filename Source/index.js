module.exports = (input, options = {}) => {
	let next = null;
	if (input[Symbol.iterator]) {
		const it = input[Symbol.iterator]();
		next = it.next.bind(it);
	} else if (input[Symbol.asyncIterator]) {
		const it = input[Symbol.asyncIterator]();
		next = it.next.bind(it);
	} else if (input.addEventListener || input.on || input.once) {
		next = () => new Promise((resolve, reject) => {
			input.once(options.event||'data', (data) => resolve({ value: data, done: false})).once('end', () => resolve({ done: true })).once('error', reject); });
	} else {
		console.log(`Could not get source iteration technique!`);
	}
	const r = {
		next,
		[Symbol.iterator]() { return this; },
		[Symbol.asyncIterator]() { return this; } 
	};
	return r;
;}