
"use strict";
const obj = require('@jbowwww/object-util');
const log = require('debug')('asyncGenerator');
const inspect = require('util').inspect;//utility.js').makeInspect({ depth: 3, compact: true });

const AsyncGeneratorFunction = Object.getPrototypeOf(async function*(){}).constructor;
log('asyncGenerator: ${inspect(AsyncGeneratorFunction)}');

// TODO: Unit tests.

// Not entirely sure if this will work on any old async function*
// generator declared somewhere in code (with/without require()ing this file)
// or whether such a generator would need to be written as a class that inherits from 
// AsyncGeneratorFunction, or something else, or what ..?

// TODO: tap, map, filter should also be exposed as standalone functoins (not on a prototype),
// so they can be used inside other chains (not sure though if these standalone funcs
// should return async functions, or async function*s, ..? maybe either, maybe depending on context or not ..?)

// Tap forms a nested chain, awaiting its own completeion before resolving with the original unchanged item. 
AsyncGeneratorFunction.prototype.tap = async function* tap(tapFn) {
	for await (const item of this) {
		await tapFn(item);
		yield item;
	}
};

// Dup is like tap, but doesn't await it's own completeion, so its inner chain runs simultaneously
AsyncGeneratorFunction.prototype.dup = async function* dup(dupFn) {
	for await (const item of this) {
		await tapFn(item);
		yield item;
	}
};

// standard map
AsyncGeneratorFunction.prototype.map = async function* map(mapFn) {
	for await (const item of this) {
		yield await mapFn(item);
	}	
};

// standard filter
AsyncGeneratorFunction.prototype.filter = async function* filter(filterFn) {
	for await (const item of this) {
		if (await filterFn(item)) {
			yield item;
		}
	}
};

// AFAIK there is no standard convention for writeables implemented as generators
// See if there is one or proposals for such a thing, and go with that.
// Otherwise, maybe start with just supporting toObject being an asyncGenerator
// and if you find a real need for it, add additional detection for it being a stream.Writeable 

// toObject: not sure if this is technically a generator or an iterable
// produced by instantiating a generator. But going to use its [Symbol.asyncIterator]
// method to get the iterable/iterator (again, not sure :/ - the one with next())
// and then iterate this, passing each value to the iterable/ator's next()
// * No wait scratch that, the caller should call the generator() and toObject
// will be the iterable/ator instance
AsyncGeneratorFunction.prototype.pipe = async function* pipe(toObject) {
	for await (let item of this) {
		await toObject.next(item);	// the writeable iterable shuld yield a promise that resolves when it's ready for another value
	}
	// what about errors, exceptions, warnings ..?? closing (e.g. on writeable file)?
};

// set options (neater than parsing ...args)
AsyncGeneratorFunction.prototype.options = function options(options) {

};

// run a 
AsyncGeneratorFunction.prototype.run = async function run(options) {

};

AsyncGeneratorFunction.prototype.pipe = async function (...pipeline) {
	log(`pipeline=${inspect(pipeline)} this=${inspect(this)}`);
	// const pipe = Array.prototype.reverse.call(pipeline);
	// if (!pipeline.every(stage =>
	// 	(obj.isPlain(stage) && obj.isFunction(stage[Symbol.asyncIterator]))
	//  ||	(/*obj.isGenerator(stage) ||*/ obj.isAsyncGenerator(stage)) )) {
	// 	throw new TypeError(`AsyncGenerator.prototype.pipe(): a stage is not an iterator or generator`);
	// }
	let iter = pipeline.reduce(async (acc, stage) => {
		log(`stage: ${stage} acc=${acc} isAG=${obj.isAsyncGenerator(stage)} isAI=${obj.isAsyncIterable(stage)} this=${this}`);
		return obj.isAsyncGenerator(stage) ? stage : async func* {
			for await (const input of acc) {
				yield map(input);
			}
		})(f);		/*.bind(acc)*//*(f));//.*/call(stage, acc);// obj.isAsyncGenerator(stage) ? stage(acc) : obj.isAsyncIterable(stage) ? stage(acc) : obj.isAsyncFunction(stage) ? stage(acc) : stage;
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

class AsyncGenerator extends AsyncGeneratorFunction {
	constructor() {
		super();
		// this.pipe = AsyncGeneratorPipe;
		log(`new AsyncGenerator[${this.prototype.constructor}]: this=${inspect(this)}`);
	}

	[Symbol.asyncIterator]() {
		return this;
	}

	// async next(...args) {
	// 	return _this.iter.next(...args);
	// } 
}


module.exports = {
	AsyncGenerator,
	AsyncGeneratorFunction
};
