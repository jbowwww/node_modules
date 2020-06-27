
"use strict";
const obj = require('@jbowwww/object-util');
const log = require('debug')('asyncGenerator');
const inspect = require('util').inspect;//utility.js').makeInspect({ depth: 3, compact: true });

// TODO: Make a wrapper class/fn that encapsulates an async gen, giving it a this object, and defining tap,map,etc funcs
// use would be like AsyncGenerator(async function* generatorFn() { }).map().filter().tap().pipe().run()
const AsyncGeneratorPrototype = Object.getPrototypeOf(async function*(){});//.constructor;

// TODO: Unit tests.

// Not entirely sure if this will work on any old async function*
// generator declared somewhere in code (with/without require()ing this file)
// or whether such a generator would need to be written as a class that inherits from 
// AsyncGeneratorPrototype, or something else, or what ..?

// TODO: tap, map, filter should also be exposed as standalone functoins (not on a prototype),
// so they can be used inside other chains (not sure though if these standalone funcs
// should return async functions, or async function*s, ..? maybe either, maybe depending on context or not ..?)

// Tap forms a nested chain, awaiting its own completeion before resolving with the original unchanged item. 
AsyncGeneratorPrototype.tap = async function* tap(tapFn) {
	for await (const item of this) {
		await tapFn(item);
		yield item;
	}
};

// Dup is like tap, but doesn't await it's own completeion, so its inner chain runs simultaneously
AsyncGeneratorPrototype.dup = async function* dup(dupFn) {
	for await (const item of this) {
		dupFn(item);
		yield item;
	}
};

// standard map
AsyncGeneratorPrototype.map = async function* map(mapFn) {
	for await (const item of this) {
		yield await mapFn(item) || item;
	}	
};

// standard filter
AsyncGeneratorPrototype.filter = async function* filter(filterFn) {
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
AsyncGeneratorPrototype.pipe = async function* pipe(...pipeline) {
	try {
		log(`pipeline=${inspect(pipeline)} this=${inspect(this)}`);
		try {
			let itemCount = 0;
			for await (let item of this) {
				let stageCount = 0;
				log(`item #${++itemCount}: ${inspect(item)}`);
				for (let stage of pipeline) {
					item = await stage(item);
					log (`\tstage #${++stageCount} ${stage.name}: ${inspect(item)}`);
				}
				yield item;
			}
		} catch (e) {
			log(`Error Inner, continuing: ${e.stack||e}`);
		}
	} catch (e) {
		log(`Error Outer, stopping: ${e.stack||e}`);
	}
	// what about errors, exceptions, warnings ..?? closing (e.g. on writeable file)?
};

// set options (neater than parsing ...args)
AsyncGeneratorPrototype.options = function options(options) {

};

// run a 
AsyncGeneratorPrototype.run = async function run(options) {
	for await (let item of this) {

	}
};

log(`asyncGenerator: ${inspect(AsyncGeneratorPrototype)}`);

class AsyncGenerator extends AsyncGeneratorPrototype.constructor {

	constructor() {
		super();
		// this.pipe = AsyncGeneratorPipe;
		log(`new AsyncGenerator[${AsyncGenerator.prototype.constructor}]`);//: this=${inspect(this)}`);
	}

	[Symbol.asyncIterator]() {
		return this;
	}

}


module.exports = {
	AsyncGenerator,
	AsyncGeneratorPrototype
};
