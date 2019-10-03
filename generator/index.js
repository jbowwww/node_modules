"use strict";
const obj /*{ assignDefaults, inspect, promisify }*/ = require('../obj');
const inspect = obj.inspect;
const log = require('debug')('Generator');
const util = require('util');

const AsyncGeneratorFunction = Object.getPrototypeOf(async function*(){}).constructor;

// returns { iter, ...args }
function getIter(genOrIter, ...args) {
	let iter =
		genOrIter instanceof AsyncGeneratorFunction ?
			genOrIter(..args) : iter;

}

// Calls a generator function with this set to a new object, for setting custom props on
// (so inside gen() function, can reference itself with this. , and caller can read props set by gen e.g. progress)
// (if that doesn't work, might have to call the gen func and manually pass a new {} as a standard arg
function makeGenObject(genFunc, ...args) {
	return genFunc.apply({}, args);
}
function makeGenFunc(genFunc, ...args) {
	return {
		_innerIter: genFunc.apply(this, args),	
		[Symbol.asyncIterator]() {
			return this;
		},
		next(...args) {
			return _innerIter.next.apply(this, args);
		}
	};
}

module.exports = obj.map({

	// todo: gather & combine previous ideas and gen's from other modules here,
	// but all implemented as generators ie async function*()'s
	// Include Buffer, progress(rewrite/rethink?), ..?
	// Include Limit & implement very similar ..  just as a async*
	async* Buffer(genOrIter, ...args) {
		// try {
			let items = [];
			log(`Buffer starting buffering, items = Array[${items.length}] iterable=${inspect(iterable)} this=${inspect(this)}`);
			for await (const item of iterable) {
				items.push(item);
			}
			// console.log(`Buffer awaiting items (buffer to fill), items = Array[${items.length}] items[0]=${inspect(items[0])} iterable=${inspect(iterable)}`);
			// await Promise.all(items);
			console.log(`Buffer finished buffering, items = Array[${items.length}] items[0]=${inspect(items[0])} iterable=${inspect(iterable)}`);
			return items;
			// yield* items;
			// for (const item of items) {
			// 	yield item;
			// }
			console.log(`Buffer finished streaming, items = Array[${items.length}] iterable=${inspect(iterable)}`);
		// } catch (e) {
		// 	console.error(`Buffer error: ${e.stack||e}`);
		// }
	}

}, func => makeGenFunc(func));
