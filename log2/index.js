const debug = require('debug');
const inspect = require('util').inspect;
const path = require('path');
const cluster = require('cluster');

const debugLogModule = false;

const fileName = module.parent.filename.replace(new RegExp('^' + path.dirname(require.main.filename)+'/'), '');
const moduleName = fileName.replace(/\.js$/i, '');
if (debugLogModule) console.log({ __filename, __dirname, requireMainFilename: require.main.filename, fileName, moduleName });
delete require.cache[__filename];	// delete so module.parent repopulated at next require()

const outputs = {
	log: console.log.bind(console),
	error: console.error.bind(console)
};

// TODO: May consider exposing this in exports? No use at this time but potenitally could be exported/defined on the log object,
// potentially allowing the user to define custom levels that can become an integrated part of the log object like the standard levels
function getDebug(name, output = outputs.log, enabled = true) {
	let d = debug(name);
	d.log = output;
	Object.defineProperty(d, 'enabled', { value: enabled });
	let f = cluster.isWorker ? (...args) => d('#' + cluster.worker.id, cluster.worker.name, ...args) : (...args) => d(...args);
	Object.defineProperty(f, 'name', { value: name });
	return f;
}

const logObject = Object.assign(function log(...args) {
	log.info(...args);
}, { 
	_disabled: {},
	disable(level) {
		if (!this._disabled[level]) {
			this._disabled[level] = this[level];
			this[level] = function() {};
			Object.defineProperty(this[level], 'name', { value: this._disabled[level].name + ':disabled' });
		}
		return this;
	},
	enable(level) {
		if (!!this._disabled[level]) {
			this[level] = this._disabled[level];
			delete this._disabled[level];
		}
		return this;
	}
}, Object.fromEntries(
	Object.entries({
		debug: { output: outputs.log, enabled: false },
		verbose: { output: outputs.log, enabled: true },
		info: { output: outputs.log, enabled: true },
		warn: { output: outputs.error, enabled: true },
		error: { output: outputs.error, enabled: true }
	}).map(([level, { output, enabled }]) =>
		[level, getDebug(`${moduleName}:${level}`, output || outputs.log, enabled || true )]
	)
), {
	inspect: require('util').inspect
});

module.exports = logObject;
