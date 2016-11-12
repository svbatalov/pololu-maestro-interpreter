var parse = require('../parser').parse;

module.exports.depth = function (state) {
  state.push(state.stack.length);
};

module.exports.drop = function (state) {
  state.pop();
};

module.exports.dup = function (state) {
  var n = state.stack[state.stack.length-1];
  state.push(n);
};

module.exports.over = function(state) {
  var n = state.stack[state.stack.length-2];
  state.push(n);
};

module.exports.pick = function (state) {
  var n = state.pop();
  var m = state.stack[state.stack.length-1-n];
  state.push(m);
};

module.exports.swap = parse('2 roll');

module.exports.rot = parse('3 roll');

module.exports.roll = function (state) {
  var n = state.pop();
  n = state.stack.length - n;
  var m = state.stack.splice(n,1);
  state.push(m[0]);
};

module.exports.peek = function (state) {
  var n = state.pop();
  state.push(state.stack[n]);
};

module.exports.poke = function (state) {
  var n = state.pop();
  var m = state.pop();
  // Signature in documentation is wrong!
  // Should be -2 instead of -2,+1.
  //state.stack.splice(n, 0, m);
  state.stack[n] = m;
};
