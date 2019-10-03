"use strict";
const obj = require('../obj');
const nodeFs = obj.promisifyObject(require('fs'));
const nodePath = require('path');
const AsyncQueue = require('../AsyncQueue');
const stream = new require('stream');
stream.finished = obj.promisify(stream.finished);
var pipeline = obj.promisify(stream.pipeline);
const log = require('debug')('FsIterable');
// log.info = log.extend('info');
// log.warn = log.extend('warn');
const { AsyncGenerator } = require('@jbowwww/async-generator');

class FsIterable extends AsyncGenerator {
	constructor(options) {
		super();
		
		this.options = obj.assignDefaults(
			options === 'string' ? { path: options } : options, {
				path: '.',
				progress: false,
				errorBehaviour: 'yield',		// yields a FsIterateError instance. 'throw' will rethrows, stopping the generator
				errors: []						// array of errors when errorBehaviour is 'yield'. If the caller wants to collect these, they can supply an error array of their own. If you don't want errors to be collected (e.g. to conserve memory), supply null or undefined
			});
		this.paths = [ this.options.path ];
		this._fsIterateInnerCalls = 0;
		this._rootPathDepth = this.options.path.split(nodePath.sep).length;
		this.errors = this.options.errors;

		const _this = this;
		this.count = obj.inspect.withGetters({
			file: 0,
			dir: 0,
			unknown: 0,
			get all() { return this.file + this.dir + this.unknown; },
			doneCounting: false
	 	});

		if (this.options.progress) {
			let innerFs = new FsIterable({ path: this.options.path, progress: false });/*obj.without(this.options, 'progress')*/
			(async function innerFsProgress() {
				for await (const f of innerFs) {}
				this.totalCount = innerFs.count;
				this.progress = obj.inspect.withGetters({
					get total() { return this.totalCount.all; },
					current: 0,//() { return _this._fsIterateInnerCalls;/*itemIndex;*/ },
					get progress() { return this.total === 0 ? 0 : 100 * this.current/*_this.itemIndex*/ / this.total; },
					get done() { return this.doneCounting && this.current === this.total; },
					get doneCounting() { return _this.count.doneCounting; }
				}, { progress: v => '' + v + '%' });
			}).call(this);
		}

		log(`FsIter(${obj.inspect(this.options, { compact: false })}): this=${obj.inspect(this)}`);
	}

	[Symbol.asyncIterator]() {
	// async next() {
		const _this = this;
	return (async function* fsIterateInner(path) {
		// if (this.paths.length === 0) {
		// 	return { done: true };
		// } else {
			// const path = _this.paths.shift();
			try {
				_this._fsIterateInnerCalls++;
				const prItem = createItem.call(_this, path);
				const item = await prItem;
				if (_this.progress) {
					_this.progress.current++;
				}
				yield item;
				const currentDepth = item.pathDepth - _this._rootPathDepth;
				log(`limitFsIter newItem: ${item.fileType}: currentDepth=${currentDepth} '${item.path}'`);
				if (item.fileType === 'dir' && (_this.options.maxDepth === 0 || currentDepth < _this.options.maxDepth)) {
					const names = await nodeFs.readdir(item.path);
					const paths = names
						.filter(_this.options.filter || (() => true))
						.map(name => nodePath.join(item.path, name));
					log('%d entries, %d matching filter at depth=%d in dir:%s', names.length, paths.length, currentDepth, item.path);
					for (const innerPath of paths) {
						// paths.push(innerPath);

						yield* fsIterateInner.call(_this,innerPath);
					}
				}
				// return { value: item, done: false };
			} catch (e) {
				// e = new FsIterable.Error(e, path);
				// if (obj.isArray(_this.errors))
					_this.errors.push(e);
				// if (_this.options.errorBehaviour === 'yield')
				// 	yield e;
				// else if (_this.options.errorBehaviour === 'throw')
					throw e;
			} finally {
				if (--_this._fsIterateInnerCalls === 0)
				_this.count.doneCounting = true;
			}
		// }
		})(this.options.path);

		async function createItem(path) {
			const _this = this;
			const item = obj.inspect.withGetters({
				path: /*nodePath.resolve*/(path),
				stats: await nodeFs.lstat(path),
				get fileType() { return this.stats.isDirectory() ? 'dir' : this.stats.isFile() ? 'file' : 'unknown'; },
				get pathDepth() { return this.path.split(nodePath.sep).length; },
				get extension() {
					var n = this.path.lastIndexOf('.');
					var n2 = Math.max(this.path.lastIndexOf('/'), this.path.lastIndexOf('\\'));
					return (n < 0 || (n2 > 0 && n2 > n)) ? '' : this.path.slice(n + 1);
				}
			});
			log('createItem(\'%s\'): _this.count=%s', path, obj.inspect(_this.count, { compact: true }));
			_this.count[item.fileType]++;
			return item;
		}

	}

};

module.exports = FsIterable;

FsIterable.Error = class FsIterateError extends Error {
	constructor(e, path) {
		super();
		this._e = e;
		this.path = path;
	}
	get message() { return this._e.message; }
	get stack() { return this._e.stack; }
};
