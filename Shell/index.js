// TODO: Generic shell command wrapper class/func
//		- Specify cmd as a string which can include pipes, redirects etc
//		- eg 'find / 2>&1 | wc' which outputs [line count] [word count] [char count]
// 		  so usage might be like let { lines, words, chars } = cmd('find / 2>&1 | wc').outputLine().split(' ').each(parseInt) .. or something ..
// TODO: Specific implementations for (to begin with): find, hash(what command?),

module.exports = {
	cmd: require('./exec.js')
};
