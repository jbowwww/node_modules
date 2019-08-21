
const inspect = require('util').inspect;
const _ = require('lodash');

module.exports = {
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
	promisify: require('util').promisify
};
