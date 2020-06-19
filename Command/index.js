"use strict";
const obj = require('../obj');
// const nodeFs = require('fs').promises;// obj.promisifyObject(require('fs'));
const nodePath = require('path');
// const AsyncQueue = require('../AsyncQueue');
const stream = new require('stream');
stream.finished = obj.promisify(stream.finished);
var pipeline = obj.promisify(stream.pipeline);
const log = require('debug')('Command');
// log.info = log.extend('info');
// log.warn = log.extend('warn');
// const { AsyncGenerator } = require('@jbowwww/async-generator');
// const child_process = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

(module.exports = async function run(command, ...args) {
	if (typeof command !== 'string') {
		throw new TypeError(`command not a string`);
	}
	const cmd = [ command, ...args ].join(' ');
	log(`cmd = \"${cmd}\"`);
	const { stdout, erderr } = await exec('ls');
	console.log('stdout:', stdout);
	console.log('stderr:', stderr);
	pipeline(
	process.stdout,)
	// run shell command
	// use to implement a new shell-based FsIterable which runs find /path | wc -l , stores result as 'count'/
	// - uses for progress counter
	// runs find /path | xargs stat --printf("JSON string"), streams text thru newline-splitter,
	// to JSON.parse, to FsEntry.hydrate, to FsEntry.save 
	// - producing FIle and Dir mongodb doc objects that way
})("find .");