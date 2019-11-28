const log = require('debug')('stream-async');
const { inspect } = require('util');

module.exports = async (source, options, fn) => {
	const defaultOptions = { concurrency: 1, throwErrors: true, errors: [] };
	if (typeof options === 'function' && fn === undefined) {
		fn = options;
		options = defaultOptions;
	} else if (typeof options === 'object') {
		options = Object.assign({ }, defaultOptions, options);
	} else {
		throw new TypeError(`options should be an object`);
	}
	if (typeof fn !== 'function') {
		throw new TypeError(`fn should be a function`);
	}
	const p = [];
	for (const s of source.length ? source : [ source ]) {
		p.push((async function innerSource() {
			for await (const data of s) {
				try {
					const processedData = await fn.call(source, data);
				} catch (e) {
					options.errors.push(e);
					log(`streamAsync: Exception caught processing data=${inspect(data)}: ${e.stack||e}`);
					if (options.throwErrors) {
						throw e;
					}
				}
			}
		})());
	}
	await Promise.all(p);
	debug(`errors[${options.errors.length}] = ${inspect(options.errors)}`);
};
