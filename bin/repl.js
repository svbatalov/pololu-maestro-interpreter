#!/usr/bin/env node
var repl = require('repl');
var vm = require('..');

var state;
if (!process.stdin.isTTY) {

    var cmd = require('fs').readFileSync('/dev/stdin').toString();
    vm.run(cmd)
    .then(function (s) {
       console.log('DONE');
    }, function (err) {
      console.error('ERROR', err);
    }).done();
    return;
}

var replServer = repl.start({
  prompt: '## > ',
  eval: function eval(cmd, context, filename, callback) {
    cmd = cmd.trim();
    if (cmd.charAt(0) === '(' && cmd.charAt(cmd.length - 1) === ')') {
      cmd = cmd.substring(1, cmd.length - 1); // drop the surrounding '( and )';
    }

    vm.run(cmd, state)
    .then(function (s) {
      state = s;
      callback(null, s.stack);
    }).done();
  }
});
