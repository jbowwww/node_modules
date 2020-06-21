const debug = require('debug');
const path = require('path');
const cluster = require('cluster');

function _log(...args) {
	return log.info(...args)
};

const fileName = module.parent.filename.replace(new RegExp('^' + path.dirname(require.main.filename)), '');
const moduleName = fileName.replace(/\.js$/i, '');
console.log({ __filename, __dirname, requireMainFilename: require.main.filename, fileName, moduleName });
delete require.cache[__filename];	// delete so module.parent repopulated at next require()

const log = {
	debug: debug(`${moduleName}:debug`),
	verbose: debug(`${moduleName}:verbose`),
	info: debug(`${moduleName}:info`),
	warn: debug(`${moduleName}:warn`),
	error: debug(`${moduleName}:error`)
};
log.log = log.info;

// for (const p of Object.keys(global.Object)) {
// 	console.log(`Object.${p}: ${Object[p]}`);
// }
// console.log(`Object.entries: ${Object.entries}\nObject.fromEntries: ${Object.fromEntries}\nObject props: ${Object.keys(Object)}`);
// const debug = require('debug');
// function _outerLog(...args) {
	const r = Object.assign(_log, {
		...({
			__config: {},
			config() { return this.__config; },
			enabled(level) { return !this.__config.hasOwnProperty(level) || this.__config[level]; },
			enable(level, enabled = true) { this.__config[level] = enabled; return this; },
			disable(level) { this.__config[level] = false; return this; }
		}),
		...(Object.fromEntries([ 'debug', 'verbose', 'info', 'warn', 'error' ]
		.map(level => [
			level,
			(...args) => r.enabled(level) && (debug(
				(cluster.isWorker ? '#' + cluster.worker.id + ' ' + cluster.worker.name + ' ' : '')
				+ `${moduleName}:${level}`)(...args))
		]))),
		log: this.info
	});//.forEach(([level, logger]) => _log[level] = logger);
	// if (typeof _log.info === 'function')
	// 	_log.log = _log.info;
	// return _log;
	module.exports = r;
	function _log(...args) {
		return _log.info(...args)
	}
// }

// module.exports = _outerLog;

