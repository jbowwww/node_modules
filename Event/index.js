
/* Note: abandoning these modules for now - use p-map p-event etc wherever possible
 */

"use strict" 
const _ = require('lodash');
const log = require('debug')('Event');
// const util = require('util');

module.exports = {

	once(emitter, resolveEvents = 'end', rejectEvents = 'error') {
		return new Promise((resolve, reject) => {
			if (!_.isArray(resolveEvents)) resolveEvents = [ resolveEvents ];
			if (!_.isArray(rejectEvents)) rejectEvents = [ rejectEvents ];
			function createHandler(emitter, events, resolveOrRejectFn) {
				return handler(...args) => {
					events.forEach(event => emitter.off(event, handler));
					resolveOrRejectFn(emitter, event, ...args);
				};
			}
			resolveEvents.forEach(ev => emitter.once(ev, createHandler(emitter, events, resolve)));
			rejectEvents.forEach(ev => emitter.once(ev, createHandler(emitter, events, reject)));
		});
	},

	async function* stream(el, resolveEvents = 'data', rejectEvents = 'error') {
	   while(true) yield await this.once(el, resolveEvents, rejectEvents);
	},

