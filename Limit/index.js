"use strict";

const obj /*{ assignDefaults, inspect, promisify }*/ = require('../obj');
const inspect = obj.inspect;

module.exports = Limit;

function Limit(func, concurrency = 1) {
	async function limitedFunction(...args) {
		while (limitedFunction.pending.length >= concurrency) {
		    await Promise.race(limitedFunction.pending).catch(() => {});
		}

	    const p = func.apply(this, args);
		limitedFunction.pending.push(p);
		await p.catch(() => {});
		limitedFunction.pending = limitedFunction.pending.filter(pending => pending !== p);
		return p;
  	};
  	limitedFunction.pending = [];
  	Object.defineProperty(limitedFunction, 'allCompleted', { get: () => Promise.all(limitedFunction.pending) });
  	return limitedFunction;
}
