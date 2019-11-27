const debug = require('debug');

module.exports = customDebug;

function customDebug(name) {
	const innerDebug = debug(name);
	return (...args) => innerDebug(`${cluster.isWorker?'#'+cluster.worker.id+' ':''}`, ...args);
}
