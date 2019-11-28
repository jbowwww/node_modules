
const delay = ms => new Promise((resolve, reject) => setTimeout(resolve, ms));

const event = (emitter, options = {}) => {
	options = { event: 'data', error: 'error', end: 'end' /*+ 'close'?*/, ...options };
	return new Promise((resolve, reject) => {
		const resolveEvents = 
			(options.event.length > 0 ? options.event : [ options.event ])
			.concat(options.end.length > 0 ? options.end : [ options.end ]);
		for (const event in resolveEvents) {
			if (typeof event === 'string') {
				emitter.once(event, resolve);
			}
		}
		for (const error in options.error.length > 0 ? options.error : [ options.error ]) {
			if (typeof error === 'string') {
				emitter.once(error, reject);
			}
		}
		
	});
};

const map = (array, asyncMapFn) => Promise.all(array.map(asyncMapFn));

const module.exports = {
	delay,
	event,
	map
};
