
const { assignDefaults, inspect, promisify } = require('../obj');
const log = require('debug')('Iterable');
const util = require('util');
const { EventEmitter } = require('events');
const Limit = require('../modules/Limit');

module.exports = function Buffer(asyncIterable, options = {}) {
	
	let bufferIndex = 0;
	let settlers = [];
	let settlerIndex = 0;

	const gen = {
		options: obj.assignDefaults(options, {
			concurrency: 1,
			size: Infinity,
			buffer: []			// optionally supply an array-like object (ie has push(), shift() and length)
		}),
		buffer: this.options.buffer,
		[Symbol.asyncIterator]() { return this; },
		next() {
			if (bufferIndex < this.buffer.length) {
				return Promise.resolve(this.buffer[bufferIndex++]);
			} else {
				return new Promise((resolve, reject) => {
					settlers.push({resolve, reject});
				});
			}
			
		}
	};

	(async function read() {
		while (gen.buffer.length < size) {
			iterator.next()
				.then(({ value, done }) => {
					settlers[settlerIndex++].resolve(value);
					if (!done) {
						gen.buffer.push(value);
					}
				});;
			yield value;
		}
	})();

	return gen;
};