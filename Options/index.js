/* TODO: Idea (worth it?)
 * JS class Options (no point doing manual prototype / constructor style ?)
 * Used to pass function arguments, like using an object literal, but because it has a
 * type, functions can detect which of any of its arguments might be options. This gives
 * the flexibility to let the object get passed first, last, or even in the middle.
 * Is it best practice?
 * Do I care?
 * Will it make my code neater, safer, more reliable, more "natural"/intuitive?
 */

someFunc(arg1, new Options({ option1: 1, options2: "2" }));
someFunc(new Options({ option1: 1, options2: "2" }), arg2, arg3);
someFunc(arg1, arg2, new Options({ option1: 1, options2: "2" }));

someFunc(arg1, arg2, Options({ option1: 1, options2: "2" }));

function someFunc(arg1, arg2, arg3) {
	const options = [arg1, arg2, arg3].find(arg => arg instanceof Options).applyDefaults({

	});
	// or static method on Options
	const options = Options.find(arg1, arg2, arg3).applyDefaults({
		arg1: 1,
		arg2: '2'
	});
	if (arg1 instanceof Options) {
		options = 
	}
	// or, maybe, (??)
	[arg1, arg2, arg3].filter(arg => arg instaceof Options).reduce((a, o) => { ...a, ...o });
}