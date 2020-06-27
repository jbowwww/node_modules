
"use strict";
const obj = require('../../obj');
const inspect = obj.inspect;//require('util').inspect;//makeInspect({ depth: 3, /*breakLength: 0,*/ compact: false });
const log = require('debug')('AsyncGenerator/test');
const assert = require('assert');

describe("AsyncGenerator unit tests", function() {

	const { AsyncGenerator } = require('../');//@jbowwww/async-generator');

	log(`AsyncGenerator unit tests setup\n\n\tassert methods: ${obj.keys(assert).filter(k => obj.isFunction(assert[k])).join(' ')}\n`);

	beforeEach('', async function beforeEach() { });

	describe('AsyncGeneraetor instance', function () {
		let iter = new AsyncGenerator();
		it('should have methods tap, map, filter, dup', function () {
			log(`iter = new AsyncGenerator() = ${inspect(iter)} / ${iter} / ${obj.keys(iter)}`);
			assert.equal(obj.namesExist(iter, 'tap', 'map', 'filter', 'dup'), true);
		});
	});

	it('Instance of async function* () {} should have methods tap, map, filter, dup', function () {
		let iter = /*new AsyncGenerator*/((async function* () {})());
		log(`iter = (async function* ())() = ${inspect(iter)} / ${iter} / ${obj.keys(iter)}`);
		assert.ok(obj.isFunction(iter.tap));
		assert.equal(obj.namesExist(iter, 'tap', 'map', 'filter', 'dup'), true);		
	});

});