
"use strict" 
const _ = require('lodash');
const log = require('debug')('AsyncIterator');
// const util = require('util');

AsyncIterator.prototype.map = async function*(fn) {
  for await(const value of this) yield fn(value);
};
AsyncIterator.prototype.filter = async function*(fn) {
  for await(const value of this) if(fn(value)) yield value;
};
AsyncIterator.prototype.flatMap = async function*(fn) {
  for await(const value of this) 
    for await(const inner of value) yield await fn(inner); 
};

Async