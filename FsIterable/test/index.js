
"use strict";
const obj /*{ assignDefaults, inspect, promisify }*/ = require('../../obj');
const assert = require('assert');
const inspect = obj.inspect;//require('util').inspect;//makeInspect({ depth: 3, /*breakLength: 0,*/ compact: false });
const promisify = require('util').promisify;
const nodePath = require('path');
const { exec } = ({ exec: promisify(require('child_process').exec) });
const FsIterable = require('../index.js');
const log = require('debug')('test/FsIterable');//.extend('log');// log.log = (innerLog => ((...args) => (innerLog('prefix', ...args))))(console.log.bind(console));


	const exePath = nodePath.dirname(__filename);
	const testPath = nodePath.join(exePath, './__testdata__');
	const largeFsWalkPath = '/mnt/Stor2/mystuff/incoming';
	let fsIterable;
	
describe("FsIterable instance unit test", function() {

	log('FsIterable unit tests setup: testPath=\'%s\'\n\nassert=%s\n\n', testPath, inspect(assert));

	//can't because then iter could be created and start enumerating FS before creating test files
	beforeEach('create fsIterable', async function createFsIterable() {
		// fsIterable = new FsIterable(testPath);
		await exec(`rm -rf ${testPath} ; mkdir ${testPath}`);
	});

	it('should be of type FsIterable with count and progress properties', function properties() {
		const fsIterable = new FsIterable(testPath);
		assert.ok(fsIterable instanceof FsIterable && !!fsIterable.count && !!fsIterable.progress);
	});

	it('should be async iterable', async function iterable() {
		const fsIterable = new FsIterable(testPath);
		// await /*assert.doesNotReject*/(async() => {
		 for await (const i of fsIterable) {}
		  // });
	});
		
	it('should yield 1 items for an empty directory walk', async function walkEmpty() {
		const fsIterable = new FsIterable(testPath);
		// await assert.doesNotReject(async() => {
			for await (let fsItem of fsIterable) {
				log(`fsItem: Progress = ${(100 * fsIterable.itemIndex / fsIterable.count.all).toFixed(1)}% fsIterable.progress=${inspect(fsIterable.progress)}fsItem='${inspect(fsItem/*.path*/)}'`);//${inspect(fsItem)}`);
			}
		// });
		log(`Done: Count: ${inspect(fsIterable.count)} Progress=${inspect(fsIterable.progress)}`);
		assert.equal(fsIterable.count.all, 1);
	});

	it('shold yield 2 items for a directory with 1 file walk', async function walk1File() {
		await exec(`touch ${testPath}/__testfile__`);
		const fsIterable = new FsIterable({ path: testPath, maxDepth: 4 });
		// await assert.doesNotReject(async() => {
			for await (let fsItem of fsIterable) {
				log(`fsItem: Progress = ${(100 * fsIterable.itemIndex / fsIterable.count.all).toFixed(1)}% fsIterable.progress=${inspect(fsIterable.progress)}fsItem='${inspect(fsItem/*.path*/)}'`);//${inspect(fsItem)}`);
			}
		// });
		log(`Done: Count: ${inspect(fsIterable.count)} Progress=${inspect(fsIterable.progress)}`);
		assert.equal(fsIterable.count.all, 2);
	});


	it('shold yield 9 items for a directory with 8 file walk', async function walk8Files() {
		await exec(`touch ${testPath}/__testfile__1`);
		await exec(`touch ${testPath}/__testfile__2`);
		await exec(`touch ${testPath}/__testfile__3`);
		await exec(`touch ${testPath}/__testfile__4`);
		await exec(`touch ${testPath}/__testfile__5`);
		await exec(`touch ${testPath}/__testfile__6`);
		await exec(`touch ${testPath}/__testfile__7`);
		await exec(`touch ${testPath}/__testfile__8`);
		const fsIterable = new FsIterable({ path: testPath, maxDepth: 4 });
		// await assert.doesNotReject(async() => {
			for await (let fsItem of fsIterable) {
				log(`fsItem: Progress = ${(100 * fsIterable.itemIndex / fsIterable.count.all).toFixed(1)}% fsIterable.progress=${inspect(fsIterable.progress)}fsItem='${inspect(fsItem/*.path*/)}'`);//${inspect(fsItem)}`);
				// simulate doing some processing with the file
				await new Promise(resolve => setTimeout(resolve, 150));
			}
		// });
		log(`Done: Count: ${inspect(fsIterable.count)} Progress=${inspect(fsIterable.progress)}`);
		assert.equal(fsIterable.count.all, 9);
	});

// 	it('should handle a large filesystem walk and use concurrency', async function walkLargeFs() {
// 		const fsIterable = new FsIterable({ path: largeFsWalkPath, maxDepth: 4, concurrency: 4 });
// 		// await assert.doesNotReject(async() => {
// 			for await (let fsItem of fsIterable) {
// 				log(`fsItem: Progress = ${(100 * fsIterable.itemIndex / fsIterable.count.all).toFixed(1)}% fsIterable.progress=${inspect(fsIterable.progress)}fsItem='${inspect(fsItem/*.path*/)}'`);//${inspect(fsItem)}`);
// 				await new Promise(resolve => setTimeout(resolve, 100));
// 			}
// 		// });
// 	});

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
	}