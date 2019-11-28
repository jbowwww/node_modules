
const cluster = require('cluster');
const debug = require('@jbowwww/debug')('cluster-processes');
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
		const processIndex = process.env.processIndex;
		const processFn = processes[processIndex] || processes[id];
		const name = isNumber(processIndex) ? (processFn.name || `Worker #${processIndex}`) : processIndex;
		Object.defineProperty(cluster.worker, 'name', { value: name });
		debug(`Worker #${id} has processes=${inspect(processes)}`);
		debug(`Worker #${id} has processIndex=${processIndex}`);
		debug(`Worker #${id} has processFn: ${inspect(processFn)}`);
		debug(`Worker #${id} has name='${name}'`);
		let ret, exitCode = 1;
		try {
			ret = await processFn();
			debug(`worker process #${id} '${name}' returned: ${inspect(ret)}`);
			exitCode = 0;
		} catch(e) {
			debug(`worker #${id} '${name}' exception: ${e.stack||e}`);
			exitCode = 1;			
		}
		debug(`worker #${id} '${name}' exiting with exitCode=${exitCode}`);
		process.exit(exitCode);
	}
}
