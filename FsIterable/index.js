"use strict";
const obj = require('../obj');
const nodeFs = require('fs').promises;// obj.promisifyObject(require('fs'));
const nodePath = require('path');
const AsyncQueue = require('../AsyncQueue');
const stream = new require('stream');
stream.finished = obj.promisify(stream.finished);
var pipeline = obj.promisify(stream.pipeline);
const log = require('@jbowwww/debug')('FsIterable');
// log.info = log.extend('info');
// log.warn = log.extend('warn');
const { AsyncGenerator } = require('@jbowwww/async-generator');

class FsIterable extends AsyncGenerator {
	constructor(options) {
		super();
		const _this = this;
		this.options = obj.assignDefaults(
			typeof options === 'string' ? { path: options } : options, {
				path: '.',
				maxDepth: 0,
				progress: false,
				errors: []
			});
		this._fsIterateInnerCalls = 0;
		this._rootPathDepth = this.options.path.split(nodePath.sep).length;
		this.errors = this.options.errors || { push() {} };	// by defaults errors collect in an array. If options.errors is falsey, errors get push()'d to nowhere
		this.count = obj.inspect.withGetters({
			file: 0,
			dir: 0,
			unknown: 0,
			get all() { return this.file + this.dir + this.unknown; },
			doneCounting: false
	 	});
		if (this.options.progress) {
			this._innerFs = new FsIterable({ path: this.options.path, maxDepth: this.options.maxDepth, filter: this.options.filter, progress: false });
			this._prInnerFs = (//new Promise((resolve, reject) => {
				(async /*function *//*innerFsProgress*/() => {
					// try {
						for await (const f of this._innerFs) {}
						// resolve();
						// this.totalCount = innerFs.count;
					// } catch(e) {
					// 	reject(e);
					// }
				})/*.call*/(/*this*/)
			);//});
			this.progress = obj.inspect.withGetters({
				get total() { return/* this.totalCount*/_this._innerFs.count.all; },
				current: 0,//() { return _this._fsIterateInnerCalls;/*itemIndex;*/ },
				get progress() { return this.total === 0 ? 0 : 100 * this.current/*_this.itemIndex*/ / this.total; },
				get done() { return this.doneCounting && this.current === this.total; },
				get doneCounting() { return _this._innerFs.count.doneCounting; }
			}, { progress: v => '' + v + '%' });
		}
		log(`FsIter(${obj.inspect(this.options, { compact: false })}): this=${obj.inspect(this)}`);
	}

	[Symbol.asyncIterator]() {
		const _this = this;
		return (async function* fsIterateInner(path) {
			if (!!_this._prInnerFs) {
				await _this._prInnerFs;
				log(`_this._innerFs: ${obj.inspect(_this._innerFs)} prInnerFs: ${obj.inspect(_this._prInnerFs)}`);
			}
			try {
				_this._fsIterateInnerCalls++;
				const prItem = createItem.call(_this, path);
				const item = await prItem;
				if (_this.progress) {
					_this.progress.current++;
				}
				yield item;
				const currentDepth = item.pathDepth - _this._rootPathDepth;
				log(`fsIterateInner newItem: ${item.fileType}: currentDepth=${currentDepth} '${item.path}'`);
				if (item.fileType === 'dir' && (_this.options.maxDepth === 0 || currentDepth < _this.options.maxDepth)) {
					const names = await nodeFs.readdir(item.path);
					const paths = names
						.filter(_this.options.filter || (() => true))
						.map(name => nodePath.join(item.path, name));
					log('%d entries, %d matching filter at depth=%d in dir:%s', names.length, paths.length, currentDepth, item.path);
					for (const innerPath of paths) {
						yield* fsIterateInner.call(this,innerPath);
					}
				}
			} catch (e) {
				_this.errors.push(e);
				} finally {
				log(`fsIterateInner done`)
				if (--_this._fsIterateInnerCalls === 0)
				_this.count.doneCounting = true;
			}
		})(this.options.path);

		async function createItem(path) {
			const item = obj.inspect.withGetters({
				path: (path),
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
