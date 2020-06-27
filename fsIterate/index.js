const debug = require('debug')('fsIterable');
const obj = require('../obj');
const nodeFs = require('fs').promises;// obj.promisifyObject(require('fs'));
const nodePath = require('path');

const defaultOptions = {
	path: '.',
	maxDepth: 0,
	progress: false,
	errors: []
};

module.exports = async function *fsIterate(options = defaultOptions) {
	const opts = { ...defaultOptions, ...(
		typeof options === 'string' ? { path: options }
	 : 	typeof options === 'object' ? options
	 : 	{ } 
	)};
	debug(`fsIterate(options=${inspect(options)}): defaultOptions=${inspect(defaultOptions)} opts=${inspect(opts)}`);
	const pathsQueue = [ opts.path ];
	const items = [ createItem(path) ];
	const rootPathDepth = createItem(opts.path).pathDepth;
	const yieldedPathIndex = 0;
	let prReadDir;
	// (async function () {
		while (yieldedPathIndex < items.length) {
			try {
				const item = items[yieldedPathIndex++];
				log(`fsIterate createItem('${item.path}'): item=${inspect(item)}`);
				if (item.fileType === 'dir' && (opts.maxDepth === 0 || (item.pathDepth - rootPathDepth) < opts.maxDepth)) {
					prReadDir = nodeFs.readdir(item.path);
					const subPaths = await prReadDir;
					const paths = subPaths
						.filter(opts.filter || (() => true))
						.map(subPath => nodePath.join(item.path, subPath));
					log('%d entries, %d matching filter at depth=%d in dir:%s', subPaths.length, paths.length, currentDepth, item.path);
					pathsQueue.concat(paths);
					items.concat(paths.map(createItem));
					yield item;
				}
			} catch (e) {
				_this.errors.push(e);
			}
		}
	// })();

	async function createItem(path) {
		const item = obj.inspect.withGetters({
			get path() { return path; },
			_stats: nodeFs.lstat(path),
			get stats() { return await this._stats; },
			get fileType() { 
				delete this.fileType;
				return this.fileType =
					this.stats.isDirectory() ? 'dir'
				 : 	this.stats.isFile() ? 'file'
				 : 	'unknown';
			},
			get pathDepth() {
				delete this.pathDepth;
				return this.pathDepth = this.path.split(nodePath.sep).length;
			},
			get extension() {
				delete this.extension;
				var n = this.path.lastIndexOf('.');
				var n2 = Math.max(this.path.lastIndexOf('/'), this.path.lastIndexOf('\\'));
				return this.extension =
					(n < 0 || (n2 > 0 && n2 > n)) ? ''
				 : 	this.path.slice(n + 1);
			}
		});
		log(`createItem(\'${path}\'): item=${item}`);
		return item;
	}
}