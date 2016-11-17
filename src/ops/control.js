var Q = require('q');

module.exports.while = function (state) {
  var cond = state.pop();
  console.log(`HERE`, cond);
  if (cond !== 0) return;
  console.log(`WHILE: popping frame`, state);
  state.popFrame();
  state.next();
};

// Example of asynchronous OP
module.exports.delay = function (state) {
  return Q.delay(state.pop());
};

module.exports.quit = function (state) {
  state.exec = [];
};
