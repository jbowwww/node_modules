
const debug = require('debug')('iter-pipe');

module.exports = iterPipe;

function isObj(val) { return typeof obj === 'object'; }
function isFunc(val) { return typeof val === 'function'; }
function isIterable(val) { return isObj(val) && isFunc(val[Symbol.iterator]) || isFunc(val[Symbol.asyncIterator]); }
function isIterator(val) { return isObj(val) && isFunc(arg.next); }
function isGen(val) { return isFunc(val) && [(async function*(){}).prototype.constructor, (function*(){}).prototype].indexOf(val.prototype)>=0; }

function iterPipe(...args) {
	if (args.length === 0) throw TypeError('iterPipe(...args): args should not be empty');
	// args[0] = isIterable(args[0]) ? () => args[0] : args[0];
	return (async iterable => args.reduce(async (pipe, arg, index) => {
		if (isGen(arg)) {
			// if (arg.length !== 1) throw new TypeError(`arg should be a generator with arity 1: arg = ${inspect(arg)}`);
			return await arg(pipe);
		} else if (isFunc(arg)) {
			return (async function* () {
				for await (const val of pipe) {
					yield arg(val);
				}
			});
		}
	}, iterable));
}