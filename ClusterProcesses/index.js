
const cluster = require('cluster');
const debug = require('debug')('cluster-processes');
const { inspect } = require('util');
const pEvent = require('p-event');

module.exports = clusterProcesses;

async function clusterProcesses(...processes) {
	const isNumber = value => typeof value === 'number' || /^[-+]?(\d+|Infinity)(\.\d*)?$/.test(value);const workerPromises = [];
	if (cluster.isMaster) {
		for (let processIndex in processes) {
			// debug(`Master forking worker for processIndex='${processIndex}'`);
			const worker = cluster.fork({ processIndex });
			debug(`Master forked worker #${worker.id} for processIndex=${processIndex}`);
			workerPromises.push(pEvent(worker, 'exit'));
		}
		debug(`Master awaiting ${workerPromises.length} promises: ${inspect(workerPromises)}`);
		const ret = await Promise.all(workerPromises);
		debug(`Master received fulfilment array of: ${inspect(ret)}`);
	}
	else if (cluster.isWorker) {
		const id = cluster.worker.id;
		debug(`Worker #${id} has processes=${inspect(processes)}`);
		const processIndex = process.env.processIndex;
		debug(`Worker #${id} has processIndex=${processIndex}`);
		const processFn = processes[processIndex] || processes[id];
		debug(`Worker #${id} has processFn: ${inspect(processFn)}`);
		const name = isNumber(processIndex) ? (processFn.name || `Worker #${processIndex}`) : processIndex;
		debug(`Worker #${id} has name='${name}'`);
		let ret;
		try {
			ret = await processFn();
			debug(`worker process #${id} '${name}' returned: ${inspect(ret)}`);
		} catch(e) {
			debug(`worker #${id} '${name}' exception: ${e.stack||e}`);			
		}
	}
}
