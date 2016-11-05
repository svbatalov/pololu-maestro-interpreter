var parser = require('./src/parser');
var eval = require('./src/eval');
module.exports = {
  run: eval.run,
  parse: parser.parse,
  State: eval.State,
};
