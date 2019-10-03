
"use strict";
const obj = require('@jbowwww/object-util');
const log = require('debug')('asyncGenerator');
const inspect = require('util').inspect;//utility.js').makeInspect({ depth: 3, compact: true });

// log('asyncGenerator: ${inspect(AsyncGeneratorFunction)}');

const AsyncGeneratorFunction = Object.getPrototypeOf(async function*(){}).constructor;

class AsyncGenerator extends AsyncGeneratorFunction {
	constructor() {
		super();
		this.pipe = AsyncGeneratorPipe;
		log(`new AsyncGenerator[${this.prototype.constructor}]: this=${inspect(this)}`);
	}

	[Symbol.asyncIterator]() {
		return this;
	}

	// async next(...args) {
	// 	return _this.iter.next(...args);
	// } 
}

async function AsyncGeneratorPipe(...pipeline) {
	log(`pipeline=${inspect(pipeline)} this=${inspect(this)}`);
	// const pipe = Array.prototype.reverse.call(pipeline);
	// if (!pipeline.every(stage =>
	// 	(obj.isPlain(stage) && obj.isFunction(stage[Symbol.asyncIterator]))
	//  ||	(/*obj.isGenerator(stage) ||*/ obj.isAsyncGenerator(stage)) )) {
	// 	throw new TypeError(`AsyncGenerator.prototype.pipe(): a stage is not an iterator or generator`);
	// }
	let iter = pipeline.reduce(async (acc, stage) => {
		log(`stage: ${stage} acc=${acc} isAG=${obj.isAsyncGenerator(stage)} isAI=${obj.isAsyncIterable(stage)} this=${this}`);
		return await stage(acc);//.call(stage, acc);// obj.isAsyncGenerator(stage) ? stage(acc) : obj.isAsyncIterable(stage) ? stage(acc) : obj.isAsyncFunction(stage) ? stage(acc) : stage;
	}, this);
	log(`pipeline=${inspect(pipeline)} iter=${inspect(iter)} iter=${iter} this=${/*inspect*/(this)}`);
	this._iter = iter;
	// await iter;
	// let done = false;
	// while (!done) {
	// 	let value = iter.next()
	// }
	for await (const item of await iter/*(this)*/) {
		log(`item=${inspect(item)}`);
		// yield item;
	}
	// return await iter;
};

module.exports = {
	AsyncGenerator,
	AsyncGeneratorFunction
};
