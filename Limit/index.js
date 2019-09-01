"use strict";

const obj /*{ assignDefaults, inspect, promisify }*/ = require('../obj');
const inspect = obj.inspect;

module.exports = function Limit(fn, options = { }) {
	options = obj.assignDefaults(options, { concurrency: 1 });
	if (typeof fn !== 'function' && typeof options === 'function') {
		let tmp = fn;
		fn = options;
		options = fn;
	}
	const limitedFunction = async function(...args) {
		while (limitedFunction.pending.length >= options.concurrency) {
		    await Promise.race(limitedFunction.pending).catch(() => {});
		}
	    const p = fn.apply(this, args);
		limitedFunction.pending.push(p);
		await p.catch(() => {});
		limitedFunction.pending = limitedFunction.pending.filter(pending => pending !== p);
		return p;
  	};
  	return Object.defineProperties(limitedFunction, {
  		name: { value: (fn.name || 'anonFunc') + '_limited' },
  		pending: { value: [] },
  		allCompleted: { get: () => Promise.all(limitedFunction.pending) }
  	});
}