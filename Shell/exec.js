"use strict";

const console = require('@jbowwww/log');
const util = require('util');
const exec = util.promisify(require('child_process').exec)

module.exports = async function execCommand(cmd) {
	try {
		const { stdout, stderr } = await exec(cmd);
		console.verbose(`stdout = ${stdout}`);
		if (stderr && stderr.length > 0)
			throw new Error(`Error executing ${cmd}: ${stderr}`);
		return { stdout, stderr };
	} catch (e) {
		console.error(`error: ${e.stack||e.message||e}`);
		process.nextTick(() => { throw e; });
	}
};