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
  if (typeof code === 'string') {
    code = parser.parse(code);
  }
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

State.prototype.isFinished = function () {
  return this.curFrame() === undefined;
};

State.prototype.step = function step(onStep) {
  if (this.isFinished()) return Q(this);

  state.break = 1;
  if (onStep && onStep(this) == false) return Q(state);
  return this.cont().then( function (state) {
    return state.step(onStep);
  });
};

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
  if (typeof state.break !== "undefined"
      && (state.break === true || state.break-- === 0) ) {
    log('BREAK since state.break == %j', state.break);
    delete state.break;
    return Q(state);
  }
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
 * @param [String || Array] code Code to run
 * @param State State to start from (optional)
 * @param Object ops Additional OPs (optional)
 *
 * @return Promise Promise resolving to State
 */
function run(code, state, ops) {
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
  return cont(state);
}

module.exports.run = run;
module.exports.State = State;

if (!module.parent) {
  var script = '1 2 break 3 4';
  var parsed = parser.parse(script);
  console.log(JSON.stringify(parsed, 0, 2));
  var state = new State(script, {});
  state.step( (state) => {
    state.ops.pframe(state);
    if(state.curFrame().ip === 2) {
      console.log('preliminary exit at', state.token() );
      return false;
    }
  }).done()
  0 && state.cont().then(function (state) {
    state.ops.pstack(state)
    state.ops.pframe(state)
    console.log('DONE');
  })
  .catch(function (err) {
    console.error('ERR', err);
  })
  .done();
}
