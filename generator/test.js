"use strict";
const obj /*{ assignDefaults, inspect, promisify }*/ = require('../obj');
const inspect = obj.inspect;

const AsyncGenerator = Object.getPrototypeOf(async function*(){}).constructor;// require('@jbowwww/async-generator');

class TestGenerator extends AsyncGenerator {
	
}

async function * myGen() {

}

console.log(`AsyncGenerator = ${inspect(AsyncGenerator)}`);
console.log(`typeof AsyncGenerator = ${typeof AsyncGenerator}`);
console.log(`obj.isAsyncGenerator=${obj.isAsyncGenerator(myGen)}`);
console.log(`AsyncGenerator.prototype = ${inspect(AsyncGenerator.prototype)}`);
for (const k of Object.getOwnPropertyNames(AsyncGenerator.prototype)) {
	console.log(`AsyncGenerator.prototype.${k} = ${inspect(AsyncGenerator.prototype[k])}`);
}
console.log(`AsyncGenerator.prototype.constructor = ${inspect(AsyncGenerator.prototype.constructor)}`);

console.log(`TestGenerator = ${inspect(TestGenerator)}`);
console.log(`TestGenerator.prototype = ${inspect(TestGenerator.prototype)}`);
for (const k of Object.getOwnPropertyNames(TestGenerator.prototype)) {
	console.log(`TestGenerator.prototype.${k} = ${inspect(TestGenerator.prototype[k])}`);
}
console.log(`TestGenerator.prototype.constructor = ${inspect(TestGenerator.prototype.constructor)}`);
