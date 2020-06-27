
const debug = require('debug')('promise-pipe');

module.exports = promisePipe;

function isObj(val) { return typeof obj === 'object'; }
function isFunc(val) { return typeof val === 'function'; }
function isIterable(val) { return isObj(val) && isFunc(val[Symbol.iterator]) || isFunc(val[Symbol.asyncIterator]); }
function isIterator(val) { return isObj(val) && isFunc(arg.next); }
// function isGen(val) { return isFunc(val) && [(async function*(){}).prototype.constructor, (function*(){}).prototype].indexOf(val.prototype)>=0; }

function promisePipe(...stages) {
	if (args.length === 0) throw TypeError('iterPipe(...args): args should not be empty');
	// args[0] = isIterable(args[0]) ? () => args[0] : args[0];
	return (async data => args.reduce(async (pipe, arg, index) => {
		if (isFunc(arg)) {
			return (async data => await arg(pipe));
		}
	}, data));
}