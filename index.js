var parser = require('./src/parser');
var run = require('./src/eval');
module.exports = {
  run: run,
  parse: parser.parse,
};
