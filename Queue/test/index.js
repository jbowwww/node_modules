
"use strict";
const { inspect } = require('../../obj');
const assert = require('assert');
const log = require('debug')('test/Queue');
const Queue = require('../index.js');

describe("Queue instance unit test", function() {

	this.timeout(30000);
	const q = new Queue({ concurrency: 4 });
	const t = val => new Promise(resolve => setTimeout(() => resolve(val), 100));

	log('Queue unit tests');

	beforeEach('create fsIterable', async function createFsIterable() { });

	it('should fulfill a promise when done', async function() {
		log(`Start: `);
		for (let i = 0; i < 100; i++) {
			let e = q.enqueue(t, i);
			log(`enqueue task(${i}): q=${q._debug()}`);
			let r = await e;
			log(`task(${i}) enqueue result=${inspect(r)}: q=${q._debug()}`);
		}
		log(`Idle: `);
		await q.onIdle();
		log(`Done: ${q._debug()}`);
	});

});

process.once('SIGINT', onSigInt);
function onSigInt() {
log(`fsIterable: ${inspect(fsIterable)}`);
	process.once('SIGINT', quitHandler);
	setTimeout(() => {
			process.off('SIGINT', quitHandler);
			process.once('SIGINT', onSigInt);
		}, 1000);
	function quitHandler() {
		process.nextTick(() => process.exit(0));
	}
};