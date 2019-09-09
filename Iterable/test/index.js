
"use strict";
const { inspect } = require('../../obj');
const assert = require('assert');
const log = require('debug')('test/Iterable');
const Iterable = require('../index.js');

describe("Async Iterable", function() {

	this.timeout(30000);
	
	it('Iterable.Buffer should buffer an async iterable correctly', async function() { 
		async function* gen() {
			for (let i = 0; i < 100; i++) {
				yield i;
			}
		}
		const buf = await Iterable.Buffer(gen());
		assert.equal(buf.length, 100);
	});


	it('Iterable.Progress should wrap an Iterable.Buffer and provide progress data', async function() { 
		async function* gen() {
			for (let i = 0; i < 100; i++) {
				yield i;
			}
		}
		const buf = await Iterable.Buffer(gen());
		assert.equal(buf.length, 100);
		const prog = await Iterable.Progress(buf);
		let lastProg, count = 0;
		for await (const item of prog) {
			log(`prog item: ${inspect(item)}`);
			assert.ok(!lastProg || isNaN(lastProg.progress) || lastProg.progress <= item.progress.progress);
			assert.ok(item.progressPercent <= 100 || isNaN(item.progressPercent));
			assert.ok(item.progressPercent >= 0 || isNaN(item.progressPercent));
			assert.equal(item.progress.total, 100);
			assert.equal(item.progress.count, ++count);
			lastProg = item.progress;
		}
		assert.ok(lastProg.progress >= 0.99 && lastProg.progress <= 1);
		assert.ok(lastProg.progressPercent >= 99 && lastProg.progressPercent <= 100);
		assert.equal(lastProg.count, lastProg.total);
		assert.equal(lastProg.count, 100);
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
