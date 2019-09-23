
const inspect = require('util').inspect;
const _ = require('lodash');

module.exports = {

	exists: (...objs) => objs.every(obj => obj !== undefined),	//objs.forEach((obj, index, objs) => { if (obj === undefined) throw new TypeError(`object #${index} of ${objs.length} is undefined`); }),

	// TODO: replace lodash with native calls or self implemented or ..? Would be nice to remove a dependency 
	isPlain: obj => _.isPlainObject(obj),
	isArray: obj => _.isArray(obj),
	isFunction: obj => obj instanceof Function,//_.isFunction(obj),

	isSyncIterable: obj => obj[Symbol.iterator] instanceof Function,
	isAsyncIterable: obj => obj[Symbol.asyncIterator] instanceof /*Async*/Function,
	isIterable: function(obj) { return this.isSyncIterable(obj) || this.isAsyncIterable(obj); },
	// TODO: Iterators (has a next() function), geberators (instanceof [Async]GeneratorFunction ??)
	
	isGenerator: obj => typeof obj === 'Generator',
	isAsyncGenerator: obj => typeof obj === 'AsyncGenerator',
	
	assign(...args) { return _.assign(...args); },
	assignDefaults(target, defaults = {}) {
		return target = _.defaults(target, defaults);
	},
	
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
	
	promisify: require('util').promisify,
	promisifyObject(o) { 
		return Object.keys(o).reduce((a, k) => Object.defineProperty(a, k, { writeable: true,
			enumerable: true,
			value: o[k] instanceof Function ? this.promisify(o[k]) : o[k]
		}), {});
	}
};
