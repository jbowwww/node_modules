
const inspect = require('util').inspect;
const _ = require('lodash');

module.exports = {

	isArray(obj) {
		return _.isArray(obj);
	},

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
