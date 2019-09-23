
"use strict";
const obj = require('@jbowwww/object-util');
const log = require('debug')('asyncGenerator');

const AsyncGeneratorFunction = Object.getPrototypeOf(async function*(){}).constructor;

/*module.exports = */AsyncGeneratorFunction.prototype.pipe = AsyncGeneratorPipe;

// module.exports = AsyncGenerator;

module.exports = class AsyncGenerator {
	constructor() {
		this.pipe = AsyncGeneratorPipe
	}
}

async function* AsyncGeneratorPipe(...pipeline) {
	log(`pipeline=${obj.inspect(pipeline)} this=${obj.inspect(this)}`);
	// const pipe = Array.prototype.reverse.call(pipeline);
	if (!pipeline.every(stage =>
		(obj.isPlain(stage) && obj.isFunction(stage[Symbol.asyncIterator]))
	 ||	(/*obj.isGenerator(stage) ||*/ obj.isAsyncGenerator(stage)) )) {
		throw new TypeError(`AsyncGenerator.prototype.pipe(): a stage is not an iterator or generator`);
	}
	let iter = pipeline.reduce((acc, stage) => obj.isPlain(stage) ? stage : stage(acc), this);
	log(`pipeline=${obj.inspect(pipeline)} iter=${obj.inspect(iter)} this=${obj.inspect(this)}`);
	// let done = false;
	// while (!done) {
	// 	let value = iter.next()
	// }
	// for await (const item of iter) {
	// 	log(`item=${inspect(item)}`);
	// 	yield item;
	// }
	return iter;
};
