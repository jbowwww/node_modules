"use strict";

const obj /*{ assignDefaults, inspect, promisify }*/ = require('../obj');
const inspect = obj.inspect;

module.exports = Limit;

function Limit(func, concurrency = 1) {
	let pendingPromises = [];
	return async function (...args) {
		while (pendingPromises.length >= concurrency) {
		    await Promise.race(pendingPromises).catch(() => {});
		}

	    const p = func.apply(this, args);
		pendingPromises.push(p);
		await p.catch(() => {});
		pendingPromises = pendingPromises.filter(pending => pending !== p);
		return p;
  	};
}
