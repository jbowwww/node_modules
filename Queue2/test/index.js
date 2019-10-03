
"use strict";
const { inspect } = require('../../obj');
const assert = require('assert');
const log = require('debug')('test/Queue');
const Queue = require('../index.js');

describe("Queue instance unit test", function() {

	this.timeout(30000);
	log('Queue unit tests');

	beforeEach('create fsIterable', async function createFsIterable() { });

	it('should fulfill a promise when done, if 100 tasks were enqueued, 100 should have completed - in order, with maxActiveCount==4', async function() { 
		const concurrency = 8;
		const q = new Queue({ concurrency });
			let fails = [];
			let lastValue;
			log(`Start: `);
			try {
				for (let i = 0; i < 100; i++) {
					let r;
					log(`enqueue task(${i}): q=${inspect(q)}`);
					try {
						r = await q.enqueue(
							val => new Promise(resolve => {
								setTimeout(() => resolve(val), 60);
							}), i );
						if (lastValue && r <= lastValue) {
							throw new Error(`r=${r} <= lastValue=${lastValue}`);
						}
						if (q.maxActiveCount > concurrency) {
							throw new Error(`q.maxActiveCount=${q.maxActiveCount} > 4, at i=${i}`);
						}
						log(`task(${i}) enqueue result=${inspect(r)}: q=${inspect(q)}`);
					} catch (e) {
						fails.push(e);
					}
				}
			} catch (e) {
				log(`Error!: ${e.stack||e}`);
				throw e;
			}
			log('Idle: ');
			await q.onIdle();
			if (fails.length > 0) {
				throw new Error('AggregateError:\n%s' + fails.reduce((aggString, errorMsg) => aggString + errorMsg.toString(), ''));
			}
			log(`Done: ${inspect(q)}`);
			assert.equal(q.successCount, 100);
	});

	process.once('SIGINT', function onSigInt() {
		log(`fsIterable: ${inspect(fsIterable)}`);
		process.once('SIGINT', quitHandler);
		setTimeout(() => {
				process.off('SIGINT', quitHandler);
				process.once('SIGINT', onSigInt);
			}, 1000);
		function quitHandler() {
			process.nextTick(() => process.exit(0));
		}
	});

});
