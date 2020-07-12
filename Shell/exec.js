"use strict";

const console = require('@jbowwww/log');
const util = require('util');
const exec = util.promisify(require('child_process').exec)

module.exports = {
	/* Exec a shell command(Joel's way) throwing if ANY output on stderr
	 */
	async execCommand(command) {
		try {
			const { stdout, stderr } = await exec(command);
			console.verbose(`stdout = ${stdout}`);
			if (stderr && stderr.length > 0)
				throw new Error(`Error executing ${command}: ${stderr}`);
			return { stdout, stderr };
		} catch (e) {
			console.error(`error running command '${command}': ${e.stack||e.message||e}`);
			process.nextTick(() => { throw e; });
		}
	},

	/**
	 * Executes shell command as it would happen in BASH script
	 * @param {string} command
	 * @param {Object} [options] Object with options. Set `capture` to TRUE, to capture and return stdout. 
	 *                           Set `echo` to TRUE, to echo command passed.
	 * @returns {Promise<{code: number, data: string | undefined, error: Object}>}
	 */
	spawn(command, {capture = false, echo = false} = {}) {
	  if (echo) {
	    console.log(command);
	  }
	  
	  const spawn = require('child_process').spawn;
	  const childProcess = spawn('bash', ['-c', command], {stdio: capture ? 'pipe' : 'inherit'});

	  return new Promise((resolve, reject) => {
	    let stdout = '';

	    if (capture) {
	      childProcess.stdout.on('data', (data) => {
	        stdout += data;
	      });
	    }

	    childProcess.on('error', function (error) {
	      reject({code: 1, error: error});
	    });

	    childProcess.on('close', function (code) {
	      if (code > 0) {
	        reject({code: code, error: 'Command failed with code ' + code});
	      } else {
	        resolve({code: code, data: stdout});
	      }
	    });
	  });
	}
};
