var Q = require('q');
var mxtend = require('xtend/mutable');
var merge = require('lodash.merge');
var parser = require('./parser');
var ops = require('./ops');
var log = require('debug')('vm');

function State (code, opts) {
  // evaluation stack
  this.stack = [];

  // execution stack
  this.exec = [];

  // default opcodes
  this.ops = ops;

  this.setCode(code || [])

  merge(this, opts);
}

State.prototype.setCode = function (code) {
  this.exec[0] = {ip: 0, code: code || []};
  this.scanLabels();
  return this;
};

State.prototype.pushFrame = function (code) {
  log('pushFrame %j', code);
  this.exec.push({ip: 0, code: code || []})
  this.scanLabels();
  return this;
};

State.prototype.popFrame = function () {
  log('popFrame');
  this.exec.pop()
  return this;
};

State.prototype.next = function () {
  var frame = this.curFrame();
  frame.ip++;
  if (frame.ip >= frame.code.length) {
    frame = this.popFrame().curFrame();
    log('NEXT: pop frame %j', this);
  }
  return frame && frame.code[frame.ip];
};

State.prototype.curFrame = function () {
  return this.exec[this.exec.length-1];
};

State.prototype.token = function () {
  var frame = this.curFrame()
  if (!frame) return;
  var ip = frame.ip;
  return frame.code[ip];
};

State.prototype.push = function (val) {
  this.stack.push(val);
  return this;
};

State.prototype.pop = function () {
  return this.stack.pop();
};

State.prototype.scanLabels = function () {
  log('SCANLABELS');
  var frame = this.curFrame();
  if (!frame) return;
  var code = frame.code;
  var labels = frame.labels = {};
  for(var i=0; i<code.length; i++) {
    var tok = code[i];
    if (typeof tok === 'object' && tok.type === 'label') {
      log('SCANLABELS found ' + tok.label + ' at ' + i);
      labels[tok.label] = i;
    }
  }
};

State.prototype.label = function (name) {
  return this.curFrame().labels[name];
};

State.prototype.goto = function (ip) {
  var frame = this.curFrame()
  frame.ip = ip;
  return this;
};

State.prototype.op = function (name) {
  var op = this.ops[name.toLowerCase()];
  return op;
}
State.prototype.pushOp = function (name, op) {
  this.ops[name.toLowerCase()] = op;
  return this;
}

State.prototype.cont = function () {
  return cont(this);
}

function throwError(message, state) {
  throw {
    message: message,
    state: state,
  }
}
function cont(state) {
  return Q().then(function () {
    return exec(state);
  })
}
function exec (state) {
  var token = state.token();

  log('EXEC %j', token);

  if (!token && token !== 0) {
    return Q(state);
  }

  if (typeof token !== 'object') {
    state.push(token);
    state.next();
    return cont(state);
  }

  switch(token.type) {
    case 'label':
      state.next();
      return cont(state);
    case 'goto':
      var ip = state.label(token.label);
      if (ip === undefined)
        throwError('GOTO: Label "' + token.label + '" is not defined', state);

      state.goto(ip);
      return cont(state);
    case 'jz':
      var n = state.pop();
      state.next();
      if (!n) {
        var ip = state.label(token.label)
        if (ip === undefined)
          throwError('JZ: Label "' + token.label+ '" is not defined', state);

        state.goto(ip);
      }
      return cont(state);

    case 'op':
      var op = state.op(token.name);
      if (!op)
        return throwError('OP "' + token.name + '" is not defined', state);

      state.next()

      if (Array.isArray(op)) {
        state.pushFrame(op);
        return cont(state);
      }

      return Q().then( function () {
        return op(state);
      })
      .then(function () {
        return cont(state);
      });
      break;
    case 'sub':
      state.pushOp(token.name, token.body);
      state.next();

      return cont(state);
    default:
      throwError("Not implemented", state);
  }
}

/**
 * Evaluate script, starting from given state
 * USAGE: run(String||Array, prevState?, additionalOPs?)
 *
 * @param [Array || Object] code Code to run
 * @param State State to start from (optional)
 * @param Object ops Additional OPs (optional)
 *
 * @return Promise Promise resolving to State
 */
function run(code, state, ops) {
  if (typeof code === 'string') {
    code = parser.parse(code);
  }
  if (!(state instanceof State)) {
    ops = state;
    state = null;
  }
  if (!state) {
    state = new State(code);
  } else {
    state.setCode(code);
  }

  mxtend(state.ops, ops);

  return Q().then(function () { return exec(state); });
}

module.exports = run;

if (!module.parent) {
  var script = 'pframe begin goto exit repeat exit:';
  var parsed = parser.parse(script);
  console.log(JSON.stringify(parsed, 0, 2));
  run(parsed)
  .then(function (state) {
    state.ops.pstack(state)
    console.log('DONE');
  })
  .catch(function (err) {
    console.error('ERR %j', err);
  })
  .done();
}
