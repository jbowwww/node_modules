
"use strict";
// const obj { assignDefaults, inspect, promisify } = require('../../obj');
const assert = require('assert');
const { inspect } = require('util');// obj.inspect;//require('util').inspect;//makeInspect({ depth: 3, /*breakLength: 0,*/ compact: false });
// const promisify = require('util').promisify;
// const nodePath = require('path');
// const { exec } = ({ exec: promisify(require('child_process').exec) });
// const FsIterable = require('../index.js');
const log = require('debug')('Source/test');//.extend('log');// log.log = (innerLog => ((...args) => (innerLog('prefix', ...args))))(console.log.bind(console));
const source = require('../index.js');

const pDelay = ms => new Promise((resolve, reject) => setTimeout(resolve, ms));

log(`\nhelllooooooooooo\n`);

async function* makeGeneratorSource(delays, values) {
	for (let i = 0; i < delays; i++) {
		await pDelay(delays[i]);
		yield values[i]
	}
}

describe('WHen two sources are combined interleaved', () => {
	const source1 = makeGeneratorSource([0, 100, 200, 300], [0, 2, 4]);
	const source2 = makeGeneratorSource([50, 150, 250, 350], [1, 3, 5]);
	const src = source(source1, source2);

	log(`src=${inspect(src)}`);
	
	it('Should iterate in order', async () => {
		
		let oldVal, i = 0;
		for await (const val of src) {
			log(`val=${val} oldVal=${oldVal}`);
			assert.ok(!oldVal || oldVal < val);
			oldVal = val;
			i++;
		}
		assert.ok(i > 0);
	});
});