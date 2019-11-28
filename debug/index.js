const debug = require('debug');
const cluster = require('cluster');

module.exports = customDebug;

function customDebug(name) {
	const innerDebug = debug(name);
	return (...args) => innerDebug(`${cluster.isWorker?'#'+cluster.worker.id+' '+cluster.worker.name+' ':''}${args.shift()}`, ...args);
}
