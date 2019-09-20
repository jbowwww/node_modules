
"use strict";
const obj = require('obj.js');
const log = require('debug')('asyncGenerator');

module.exports = AsyncGenerator.prototype.pipe = async function* AsyncGeneratorPipe(...pipeline) {
	// const pipe = Array.prototype.reverse.call(pipeline);
	if (!pipeline.every((stage, i, pipeline) =>
		(obj.isPlain(stage) && obj.isFunction(stage[Symbol.asyncIterator]))
	 ||	(/*obj.isGenerator(stage) ||*/ obj.isAsyncGenerator(stage)) )) {
		throw new TypeError(`AsyncGenerator.prototype.pipe(): stage #${i} of ${pipeline.length} is not an iterator or generator`);
	}
	let iter = pipeline.reduce((acc, stage) => obj.isPlain(stage) ? stage : stage(acc), this);
	log(`pipeline=${inspect(pipeline)} iter=${inspect(iter)} this=${inspect(this)}`);
	// let done = false;
	// while (!done) {
	// 	let value = iter.next()
	// }
	for await (const item of iter) {
		log(`item=${inspect(item)}`);
		yield item;
	}
};
