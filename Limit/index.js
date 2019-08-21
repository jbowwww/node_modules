"use strict";

const obj /*{ assignDefaults, inspect, promisify }*/ = require('../obj');
const inspect = obj.inspect;

module.exports = Limit;

function Limit(func, concurrency = 1) {
	if (!(this instanceof Limit)) {
		return new Limit(options);
	} else if (typeof options === 'string') {
		options = { path: options };
	}
	
	let pendingPromises = [];
	return async function (...args) {
		while (pendingPromises.length >= n) {
		    await Promise.race(pendingPromises).catch(() => {});
		}

	    const p = fn.apply(this, args);
		pendingPromises.push(p);
		await p.catch(() => {});
		pendingPromises = pendingPromises.filter(pending => pending !== p);
		return p;
  	};
|}