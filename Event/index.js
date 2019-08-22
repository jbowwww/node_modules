
/* Note: abandoning these modules for now - use p-map p-event etc wherever possible
 */
 
const _ = require('lodash');
const log = require('debug')('Event');
// const util = require('util');

module.exports = function PromiseEvent(emitter, resolveEvents = 'end', rejectEvents = 'error') {
	return new Promise((resolve, reject) => {
		if (!_.isArray(resolveEvents)) resolveEvents = [ resolveEvents ];
		if (!_.isArray(rejectEvents)) rejectEvents = [ rejectEvents ];
		resolveEvents.forEach(ev => emitter.once(ev, (...args) => resolve(...args)));
		rejectEvents.forEach(ev => emitter.once(ev, (...args) => reject(...args)));
	});
};
