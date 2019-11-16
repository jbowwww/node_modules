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
	let processFn = Limit({ concurrency: 4 }, fn);
	for await (const data of source) {
		try {
			const processedData = await fn.call(source, data);
		} catch (e) {
			options.errors.push(e);
			if (options.throwErrors) {
				throw e;
			}
		}
	}
	console.log(`errors[${errors.length}] = ${inspect(errors)}`);
};
