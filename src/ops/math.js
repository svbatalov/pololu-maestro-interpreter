// 
// Unary commands
//
module.exports.bitwise_not = function (state) {
  state.push(~state.pop());
};

module.exports.logical_not = function (state) {
  state.push(!state.pop());
};

module.exports.negate = function (state) {
  state.push(-state.pop());
};

module.exports.positive = function (state) {
  state.push(state.pop() > 0);
};

module.exports.nonzero = function (state) {
  state.push(!!state.pop());
};

module.exports.logical_not = function (state) {
  state.push(!state.pop());
};

//
// Binary commands
//

module.exports.bitwise_and = function (state) {
  var n = state.pop();
  var m = state.pop();
  state.push(n & m);
};

module.exports.bitwise_or = function (state) {
  var n = state.pop();
  var m = state.pop();
  state.push(n | m);
};

module.exports.bitwise_xor = function (state) {
  var n = state.pop();
  var m = state.pop();
  state.push(n ^ m);
};

module.exports.divide = function (state) {
  var n = state.pop();
  var m = state.pop();
  state.push(m / n);
};

module.exports.equals = function (state) {
  var n = state.pop();
  var m = state.pop();
  state.push(n === m);
};

module.exports.greater_than = function (state) {
  var n = state.pop();
  var m = state.pop();
  state.push(m > n);
};

module.exports.less_than = function (state) {
  var n = state.pop();
  var m = state.pop();
  state.push(m < n);
};

module.exports.logical_and = function (state) {
  var n = state.pop();
  var m = state.pop();
  state.push(n && m);
};

module.exports.or = function (state) {
  var n = state.pop();
  var m = state.pop();
  state.push(m || n);
};

module.exports.max = function (state) {
  var n = state.pop();
  var m = state.pop();
  state.push(Math.max(n, m));
};

module.exports.min = function (state) {
  var n = state.pop();
  var m = state.pop();
  state.push(Math.min(n, m));
};

module.exports.minus = function (state) {
  var n = state.pop();
  var m = state.pop();
  state.push(m - n);
};

module.exports.mod = function (state) {
  var n = state.pop();
  var m = state.pop();
  state.push(m % n);
};

module.exports.not_equals = function (state) {
  var n = state.pop();
  var m = state.pop();
  state.push(n !== m);
};

module.exports.plus = function (state) {
  var n = state.pop();
  var m = state.pop();
  state.push(n + m);
};

module.exports.shift_left = function (state) {
  var n = state.pop();
  var m = state.pop();
  state.push(m << n);
};

module.exports.shift_right = function (state) {
  var n = state.pop();
  var m = state.pop();
  state.push(m >> n);
};

module.exports.times = function (state) {
  var n = state.pop();
  var m = state.pop();
  state.push(n * m);
};
