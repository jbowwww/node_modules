const debug = require('debug');

const log = {
	debug: debug('model/filesys/filesys-entry:debug'),
	verbose: debug('model/filesys/filesys-entry:verbose'),
	info: debug('model/filesys/filesys-entry:info'),
	warn: debug('model/filesys/filesys-entry:warn'),
	error: debug('model/filesys/filesys-entry:error')
};
log.log = log.info;

function _log(...args) {
	return log.info(...args)
};

for (const level of log) {
	_log[level] = log[level];
}

module.exports = _log;

