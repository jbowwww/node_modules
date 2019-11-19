
const cluster = require('cluster');
const debug = require('debug')('cluster-processes');
const { inspect } = require('util');
const pEvent = require('p-event');

module.exports = async (...processes) => {
	const workerPromises = [];
	if (cluster.isMaster) {
		for (const i in processes) {
			debug(`Master forking worker #${i}`);
			const worker = cluster.fork({ id: i });
			workerPromises.push(pEvent(worker, 'exit'));
		}
		debug(`Master awaiting ${workerPromises.length} promises: ${inspect(workerPromises)}`);
		const ret = await Promise.all(workerPromises);
		debug(`Master received fulfilment array of: ${inspect(ret)}`);
	}
	else if (cluster.isWorker) {
		const id = process.env.id || -1; // cluster.worker.id;
		if (id < 0) {
			throw new Error(`Worker didn't get valid ID`);
		}
		debug(`worker process #${id} has processes: ${inspect(processes)}`);
		let ret;
		try {
			ret = await (processes[id])();
		} catch(e) {
			debug(`worker process #${id} exception: ${e.stack||e}`);			
		}
		debug(`worker process #${id} returned: ${inspect(ret)}`);
	}
};