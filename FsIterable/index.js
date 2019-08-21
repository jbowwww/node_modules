"use strict";

const obj /*{ assignDefaults, inspect, promisify }*/ = require('../obj');
const inspect = obj.inspect;
const promisifyObject = o => Object.keys(o).reduce((a, k) =>
	Object.defineProperty(a, k, { writeable: true, enumerable: true, value: o[k] instanceof Function ? obj.promisify(o[k]) : o[k] }), {});
const nodeFs = promisifyObject(require('fs'));
const nodePath = require('path');
const Limit = require('../Limit');
const stream = new require('stream');
stream.finished = obj.promisify(stream.finished);
var pipeline = obj.promisify(stream.pipeline);
const log = require('debug')('FsIterable');
log.info = log.extend('info');
log.warn = log.extend('warn');

module.exports = FsIterable;

function FsIterable(options) {
	if (!(this instanceof FsIterable)) {
		return new FsIterable(options);
	} else if (typeof options === 'string') {
		options = { path: options };
	}
	
	this.errors = [];
	this.items = obj.inspect.withGetters([], () => 'Array[' + this.items.length + ']');
	this.itemIndex = 0;
	const fsIterable = this;
	this.options = options = obj.assignDefaults(options, {
		path: nodePath.resolve(options.path || '.'),
		maxDepth: 1,
		concurrency: 1,	// TODO
		filter: item => true,
		handleError(err) { fsIterable.errors.push(err); log/*.warn*/(`Error!: ${err/*.stack*/}`); }
	});
	this.count = obj.inspect.withGetters({
		file: 0,
		dir: 0,
		unknown: 0,
		get all() { return this.file + this.dir + this.unknown; },
		doneCounting: false
 	});
	log(`FsIter(${obj.inspect(this.options, { compact: false })})`);//: this=${this}`);

	this.progress = obj.inspect.withGetters({
		get total() { return  fsIterable.count.all; },
		get current() { return fsIterable.itemIndex; },
		get progress() { return this.total === 0 ? 0 : 100 * fsIterable.itemIndex / this.total; },
		get done() { return this.doneCounting && this.current === this.total; },
		get doneCounting() { return fsIterable.count.doneCounting; }
	}, { progress: v => '' + v + '%' });

	this._fsIterateInnerCalls = 0;
	this._rootPathDepth = this.options.path.split(nodePath.sep).length;

	// Start iterator before asyncIterator is even invoked
	// (async() => {
		const limitFsIter = Limit(fsIterateInner, 4);
		const innerIter = limitFsIter(this.options.path);
		this[Symbol.asyncIterator] = async function* () {
			this.itemIndex = 0;
			log(`asyncIterator! this=${inspect(this)}`);
			for await(const item of innerIter) {//this._fsIterateInnerCalls > 0 || this.itemIndex < this.items.length) {
				log(`item: ${item.fileType}: '${item.path}'`);
				yield item;
				this.itemIndex++;
			}
		}
	// })();
	async function* fsIterateInner(path) {
		try {
			fsIterable._fsIterateInnerCalls++;
			const prItem = createItem(path);
			yield prItem;
			const item = await prItem;
			const currentDepth = item.pathDepth - fsIterable._rootPathDepth;
			log(`limitFsIter newItem: ${item.fileType}: currentDepth=${currentDepth} '${item.path}'`);
			if (item.fileType === 'dir' && (fsIterable.options.maxDepth === 0 || currentDepth < fsIterable.options.maxDepth)) {
				const names = await nodeFs.readdir(item.path);
				const paths = names
					.filter(fsIterable.options.filter || (() => true))
					.map(name => nodePath.join(item.path, name));
				log('%d entries, %d matching filter at depth=%d in dir:%s, progress=%s', names.length, paths.length, currentDepth, item.path, inspect(fsIterable.progress));
				// for (const newPath of paths) {
					// for (const newItem of 
					for (const newInner of paths.map(path => limitFsIter(path))) {
						yield* newInner;
					}						 // newItem;
					// }
				// }
			}
		} catch (e) {
			fsIterable.options.handleError(e);
		} finally {
			if (--fsIterable._fsIterateInnerCalls === 0) {
				fsIterable.count.doneCounting = true;
			};
		}
	}

	async function createItem(path) {
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
		fsIterable.count[item.fileType]++;
		log('createItem(\'%s\'): this.count=%s', path, inspect(fsIterable.count));
		return item;
	}
}
