
const cluster = require('cluster');
const log = require('@jbowwww/log');
const { inspect } = require('util');
const { event } = require('@jbowwww/promise');

module.exports = clusterProcesses;

async function clusterProcesses(...processes) {
	const isNumber = value => typeof value === 'number' || /^[-+]?(\d+|Infinity)(\.\d*)?$/.test(value);const workerPromises = [];
	if (cluster.isMaster) {
		for (let processIndex in processes) {
			// log.verbose(`Master forking worker for processIndex='${processIndex}'`);
			const worker = cluster.fork({ processIndex });
			log.verbose(`Master forked worker #${worker.id} for processIndex=${processIndex}`);
			workerPromises.push(event(worker, 'exit'));
		}
		log.verbose(`Master awaiting ${workerPromises.length} promises: ${inspect(workerPromises)}`);
		const ret = await Promise.all(workerPromises);
		log.verbose(`Master received fulfilment array of: ${inspect(ret)}`);
		cluster.disconnect();
		
	}
	else if (cluster.isWorker) {
		const id = cluster.worker.id;
		const processIndex = process.env.processIndex;
		const processFn = processes[processIndex] || processes[id];
		const name = isNumber(processIndex) ? (processFn.name || `Worker #${processIndex}`) : processIndex;
		Object.defineProperty(cluster.worker, 'name', { value: name });
		log.verbose(`Worker #${id} has processes=${inspect(processes)}`);
		log.verbose(`Worker #${id} has processIndex=${processIndex}`);
		log.verbose(`Worker #${id} has processFn: ${inspect(processFn)}`);
		log.verbose(`Worker #${id} has name='${name}'`);
		let ret, exitCode = 1;
		try {
			ret = await processFn();
			log.verbose(`worker process #${id} '${name}' returned: ${inspect(ret)}`);
			exitCode = 0;
		} catch(e) {
			log.verbose(`worker #${id} '${name}' exception: ${e.stack||e}`);
			exitCode = 1;			
		}
		log.verbose(`worker #${id} '${name}' exiting with exitCode=${exitCode}`);
		process.exit(exitCode);
	}
}
