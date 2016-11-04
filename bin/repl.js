#!/usr/bin/env node
var repl = require('repl');
var vm = require('..');
var opts = require('minimist')(process.argv.slice(2));
var pick = require('lodash.pick');

var state;
if (!process.stdin.isTTY) {

  var cmd = require('fs').readFileSync('/dev/stdin').toString();
  if(opts.p) {
    console.log(JSON.stringify( vm.parse(cmd), 0, 2 ));
  } else {
    vm.run(cmd)
    .then(function (s) {
      console.log('DONE');
    }, function (err) {
      console.error('ERROR: %s\n%j', err.message, pick(err.state, ['stack', 'exec', 'labels']));
    }).done();
  }
  return;
}

var replServer = repl.start({
  prompt: '## > ',
  eval: function eval(cmd, context, filename, callback) {
    cmd = cmd.trim();
    if (cmd.charAt(0) === '(' && cmd.charAt(cmd.length - 1) === ')') {
      cmd = cmd.substring(1, cmd.length - 1); // drop the surrounding '( and )';
    }

    if (opts.p) {
      console.log(vm.parse(cmd));
      callback();
    } else {
      vm.run(cmd, state)
      .then(function (s) {
        state = s;
        callback(null, s.stack);
      }, function (err) {
        state = err.state;
        callback(null, state.stack);
        console.log('Error:', err.message);
      }).done();
    }

  }
});
