
const inspect = require('util').inspect;
const _ = require('lodash');
// const { AsyncGeneratorFunction } = require('@jbowwww/async-generator');
const AsyncGeneratorFunction = Object.getPrototypeOf(async function*(){}).constructor;

module.exports = {

	exists: (...objs) => objs.every(obj => obj !== undefined),	//objs.forEach((obj, index, objs) => { if (obj === undefined) throw new TypeError(`object #${index} of ${objs.length} is undefined`); }),
	namesExist: (obj, ...names) => names.every(name => obj[name] !== undefined),

	// TODO: replace lodash with native calls or self implemented or ..? Would be nice to remove a dependency 
	isPlain: obj => _.isPlainObject(obj),
	isArray: obj => _.isArray(obj),
	isFunction: obj => obj instanceof Function,//_.isFunction(obj),

	isSyncIterable: obj => obj[Symbol.iterator] instanceof Function,
	isAsyncIterable: obj => obj[Symbol.asyncIterator] instanceof /*Async*/Function,
	isIterable: function(obj) { return this.isSyncIterable(obj) || this.isAsyncIterable(obj); },
	// TODO: Iterators (has a next() function), geberators (instanceof [Async]GeneratorFunction ??)
	
	isGenerator: obj => typeof obj === 'function',
	isAsyncGenerator: obj => obj instanceof AsyncGeneratorFunction/*.constructor*/, //typeof obj === 'function',
	
	generator: fn => (...args) => fn.apply({}, args),
	keys: obj => { let keys = []; for (const k in obj) keys.push(k); return keys; },
	map: (obj, fn) => Object.fromEntries(Object.entries(obj).map(fn)),
	fromEntries: Object.fromEntries,
	assign(...args) { return _.assign(...args); },
	assignDefaults(target, defaults = {}) {
		return target = _.defaults(target, defaults); //this.assign({}, defaults, target);
	},
	with(...args) { return this.assign({}, ...args); },
	without(base, ...without) { 
		let r = this.assign({}, base);
		if (without && this.isArray(without[0])) {
			without = without[0];
		}
		for (const withoutPropName of this.isArray(without) ? without : this.keys(without)) {
			delete base[withoutPropName];
		}
		return r;
	},

	clone(obj) { return this.assign({}, obj); },

	inspect: Object.assign(require('util').inspect, {
		withGetters(obj, ...objectMaps) {
			// const wrapped = _.assign({}, obj);
			return Object.assign(obj, {
				[inspect.custom]: typeof inspectFnOrOptions === 'function' ? inspectFnOrOptions
				 : inspectOptions => inspect(
				 	_.mapValues(
				 		_.omit(obj, [inspect.custom]),
						objectMaps.length && objectMaps.length > 0 &&
						typeof objectMaps[0] === 'object' ?
							(v, k) => (objectMaps[0][k] || _.identity)(v) : _.identity),
					inspectOptions)
			});
		},
		array(wrapped, inspectFnOrOptions = {}) {
			return Object.assign(wrapped, {
				[inspect.custom]: typeof inspectFnOrOptions === 'function' ? inspectFnOrOptions
				 : () => 'Array[' + wrapped.items.length + ']'
			});
		}
	}),
	
	promisify(...args) {
		if (args.length >= 1) {
			switch (typeof args[0]) {
				case 'function': return (require('util').promisify)(...args);
				case 'object' : return Object.keys(args[0]).reduce((a, k) => Object.defineProperty(a, k, { writeable: true,
					enumerable: true,
					value: args[0][k] instanceof Function ? this.promisify(args[0][k]) : args[0][k]
				}), {});
			}
		}
		throw new TypeError(`args = ${inspect(args)}`);
	},
	promisifyObject(...args) { return this.promisify(...args); }
};


