
"use strict";
const obj = require('../../obj');
const inspect = obj.inspect;
const assert = require('assert');
const log = require('debug')('test/Iterable');
const Iterable = require('../index.js');

describe("Async Iterable", function() {

	this.timeout(30000);
	
	it('Iterable.getIterableOptions should return { iterable, options } given array with those two args in any order', function() {
		const iterable = new Array(0);
		const options = { option1: 1, option2: "2" };
		const expected = { iterable, options };
		assert.equal(expected, Iterable.getIterableOptions(iterable, options));
		assert.equal(expected, Iterable.getIterableOptions(options, iterable));
		assert.equal(expected, Iterable.getIterableOptions({ iterable, options }));		 
	});

	async function* gen(count = 100) {
		for (let i = 0; i < count; i++) {
			yield i;
		}
	}
		
	it('Iterable.Buffer should buffer an async iterable correctly', async function() { 
		const buf = await Iterable.Buffer(gen());
		assert.equal(buf.length, 100);
	});


	it('Iterable.Progress should wrap an array prepared by Iterable.Buffer, and be an async generator', async function() { 
		const iterator = gen();
		const prBuf = Iterable.Buffer(iterator);
		assert.ok(obj.isFunction(prBuf.then));
		const buf = await prBuf;
		const prProg = Iterable.Progress(buf);
		// assert.ok(obj.isFunction(prProg.then));
		const prog = await prProg;
		log(`prog = Iterable.Progress(prog) <- Iterable.Buffer(buf) <- gen()\ngen: ${inspect(iterator)}\nbuf=${inspect(buf)}\nprog=${inspect(prog)}`)
		assert.equal(buf.length, 100);
		assert.ok(obj.isFunction(prog[Symbol.asyncIterator]));
	});

	it('Iterable.Progress should wrap an Iterable.Buffer directly, be async iterable and provide progress data', async function() { 
		let lastProg, count = 0;
		for await (const item of Iterable.Progress(await Iterable.Buffer(gen()))) {
			log(`item: ${inspect(item)}`);
			assert.ok(obj.exists(item.value, item.progress, item.progress.progress));
			assert.ok(!lastProg || isNaN(lastProg.progress) || lastProg.progress <= item.progress.progress);
			if (!isNaN(item.progressPercent)) {
				assert.ok(item.progressPercent <= 100);
				assert.ok(item.progressPercent >= 0);
			}
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
