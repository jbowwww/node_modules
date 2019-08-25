
const obj /*{ assignDefaults, inspect, promisify }*/ = require('../obj');
const inspect = obj.inspect;
const log = require('debug')('Queue');
const util = require('util');
const { EventEmitter } = require('events');

module.exports = Queue;

util.inherits(Queue, EventEmitter);
Queue.prototype.constructor = Queue;

function Queue(options = { concurrency: 1 }) {
	if (!(this instanceof Queue)) {
		return new Queue(concurrency);
	}
	EventEmitter.call(this);
	this.queue = [];
	this.maxQueueCount = 0;
	this.activeCount = 0;
	this.maxActiveCount = 0;
	this.runCount = 0;
	this.successCount = 0;
	this.errors = [];
	this.concurrency = typeof options === 'number' ? options : options.concurrency;
	// return obj.inspect.withGetters(this);
}

// Queue.prototype._debug = function _debug() {
// 	return JSON.stringify({
// 		'queue.length': this.queue.length,
// 		maxQueueCount: this.maxQueueCount,
// 		concurrency: this.concurrency,
// 		activeCount: this.activeCount,
// 		runCount: this.runCount,
// 		successCount: this.successCount,
// 		'errors.length': this.errors.length
// 	});
// };

function _next() {
	this.activeCount--;
	this.emit('next');
	if (this.queue.length > 0) {
		log(`Dequeueing task : ${inspect(this)}`);
		const task = this.queue.shift();
		if (this.queue.length === 0) {
			log(`Queue empty : ${inspect(this)}`);
			this.emit('empty');
		}
		const r = task();	// should always return undefined
	} else if (this.activeCount === 0) {
		log(`Queue idle : ${inspect(this)}`);
		this.emit('idle');
	}
}

function _run(fn, ...args)  {
	const runStart = Date.now();
	let runEnd;
	if (++this.activeCount > this.maxActiveCount) {
		this.maxActiveCount = this.activeCount;
	}
	this.runCount++;
	log(`Running task : ${inspect(this)}`);
	var r = fn(...args);
	if (!(r instanceof Promise)) {
		r = Promise.resolve(r);
	}
	return r.then(result => {
		runEnd = Date.now();
		const runDuration = runEnd - runStart;
		this.successCount++;
		log(`Task success : result=${inspect(result)} runDuration=${runDuration}ms ${inspect(this)}`);
		return result;
	}, err => {
		this.activeCount--;
		runEnd = Date.now();
		const runDuration = runEnd - runStart;
		this.errors.push(err);
		log(`Task error : err=${err.stack||err} runDuration=${runDuration}ms ${inspect(this)}`);
	})
	.then(result => {
		setTimeout(_next.bind(this), 0);
		return result;
	});
};

// Runs a function, up to the configured concurrency. If maximum concurrency not yet reached, add returns immediately. If maximum concurrency
// has been reached, returns a Promise that resolves when one of the currently executing functions finishes.
// TODO: ^ think that through, i'm not sure its quite what you want
Queue.prototype.add = Queue.prototype.enqueue = function add(fn, ...args) {
	// const queue = queue;
	if (this.activeCount < this.concurrency) { 
		_run.call(this, fn, ...args);
		return Promise.resolve();
	} else {
		log(`Queueing task : ${inspect(this)}`);
		this.queue.push(() => _run.call(this, fn, ...args));
		if (this.queue.length > this.maxQueueCount)
			this.maxQueueCount = this.queue.length;
		return new Promise((resolve, reject) => this.once('next', () => resolve()));
	}
};

Queue.prototype.addAndRun = Queue.prototype.enqueueAndRun = function addAndRun(fn, ...args) {
	if (this.activeCount < this.concurrency) { 
		return _run(fn, ...args);
	} else {
		log(`Queueing task : ${inspect(this)}`);
		return new Promise((resolve, reject) => {
			this.queue.push(() => _run(fn, ...args).then(resolve, reject));
			if (this.queue.length > this.maxQueueCount) {
				this.maxQueueCount = this.queue.length;
			}
		});
	}
}

Queue.prototype.onEmpty = function onEmpty() {
	return this.queue.length === 0 ? Promise.resolve()
	 : new Promise((resolve, reject) => {
		this.once('empty', () => {
			// this.off('enpty');
			resolve();
		})
	});
};

Queue.prototype.onIdle = function onIdle() {
	return this.activeCount === 0 ? Promise.resolve()
	 : new Promise((resolve, reject) => {
		this.once('idle', () => {
			// this.off('idle');
			resolve();
		});
	});
};
