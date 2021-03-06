"use strict";

const obj /*{ assignDefaults, inspect, promisify }*/ = require('../obj');
const inspect = obj.inspect;

function Limit(...args/*fn, options = {}*/) {
	let options = { concurrency: 1 }, fn;
	for (let arg of args) {
		if (typeof arg === 'function' || typeof arg === 'AsyncFunction') {
			fn = arg;
		} else if (typeof arg === 'object') {
			options = obj.assign(options, arg);
		}
	}
	const limitedFunction = async function limFn(...args) {
		while (/*limitedFunction*/limFn.pending.length >= options.concurrency) {
		    await Promise.race(/*limitedFunction*/limFn.pending).catch(() => {});
		}
	    const p = fn.apply(this, args);
		/*limitedFunction*/limFn.pending.push(p);
		await p;//.catch(() => {});
		/*limitedFunction*/limFn.pending.splice(/*limitedFunction*/limFn.pending.indexOf(p), 1);// = /*limitedFunction*/limFn.pending.filter(pending => pending !== p);
		return p;
  	};
  	return Object.defineProperties(limitedFunction, {
  		name: { value: (fn.name || 'anonFunc') + '_limited' },
  		pending: { value: [], writeable: true },
  		allCompleted: { get: () => Promise.all(limitedFunction.pending) }
  	});
};

Limit.asGenerator = function limitAsGenerator(/*options, fn*/) {
	let fn, options = { concurrency: 1 };
	for (const arg of arguments) {
		if (typeof arg === 'object') {
			options = obj.assignDefaults(arg, options);
		} else if (typeof arg === 'function') {
			fn = arg;
		} else {
			throw new TypeError(`arg '${inspect(arg)}' was not an object or a function`);
		}
	}
	return async function* (iterable) {
		const limitedFn = Limit(fn, options);
		for await (const value of iterable) {
			yield limitedFn(value);
		}
	};
}

module.exports = Limit;