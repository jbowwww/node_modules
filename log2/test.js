const log = require('./index.js');
const assert = require('assert');
const util = require('util');

console.log(`log=${util.inspect(log)}`);

describe('log', function() {
	const expectedFunctions = ['debug', 'verbose', 'info', 'warn', 'error', 'enable', 'disable'];
	it('should contain functions for ' + expectedFunctions.join(', '), function() {
		for (const level of expectedFunctions) {
			assert.ok(!!log[level] && typeof log[level] === 'function', `log is missing a function '${level}'`);
		}
	});
});
