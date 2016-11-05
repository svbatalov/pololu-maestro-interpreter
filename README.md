# pololu-maestro-interpreter
Interpreter for the [scripting language](https://www.pololu.com/docs/0J40/6.a) used in Pololu Maestro servo controller boards.

## Usage
### Command line
As an interactive interpreter:
```
$ ./bin/repl.js 
## > 1 2 plus
[ 3 ]
## > 
```
Pipe script to stdin:
```
$ echo '1 2 plus pstack' | ./bin/repl.js 
STACK: [ 3 ]
DONE
```
Use `-p` command line option to show parsed script:
```
$ echo '1 2 plus pstack' | ./bin/repl.js -p
[
  1,
  2,
  {
    "type": "op",
    "name": "plus"
  },
  {
    "type": "op",
    "name": "pstack"
  }
]
```

### From script
Module exports two functions `run(code, state?, ops?)` and `parse("script")`
and the `State` class.

Example:
```
var vm = require('pololu-maestro-interpreter');
vm.run("1 2 plus").then( (state) => {
  console.log(state.stack);
}).done();
```

#### `run(code, state, ops)`
* code (String || Array) -- Script to run
* state (State) -- Optional state to start from
* ops (Object) -- Optional additional opcodes

Returns [promise](https://github.com/kriskowal/q) resolving with state of the interpreter.
[`done()`](https://github.com/kriskowal/q#the-end) at the end of promise chain
ensures that unhandled exceptions are at least shown to the user.

Example of defining opcodes:

```
var vm = require('pololu-maestro-interpreter');
vm.run("1 2 plus print", {
  print: function (state) {
    console.log(state.pop());
  }
})
.done();
```
This script will print `3` to the console.

#### `parse(code)`
* code String -- The code to parse

Returns an array of tokens which are either numbers or objects `{type: TYPE, ...}`.
Currently parser transforms loops/conditionals to sequences of `goto <label>`, `jz <label>` and labels.
Function definitions are moved to the beginning of parsed code.

#### Creating state manually
State is an instance of class `State`:
```js
var state = new State(code, opts)
```
Most important properties of state are `stack`, the evaluation stack, `exec`,
the execution stack and `ops`, hash of available opcodes
(including ones defined with `sub name ... return`).
Second argument `opts` of constructor is merged with newly created state and can be used
e.g. to provide additional opcodes:
```js
new State(code, {
  ops: {
    print: function (state) {
    ...
    }
  }
})
```
Here are most useful methods of state:
* `state.push(val)`
* `state.pop()`
* `state.cont()` -- Continues evaluation from given state
* `state.step(onStep)` -- Steps through the code, running `onStep(state)` after each instruction.
* `state.isFinished()` -- Checks if script finished

You can pause evaluation by setting `state.break = true` or `state.break = 5` to break after 5 instructions.
For instance we can create paused state as follows:
```js
var state = new State('1 2 3', { break: true })
state.cont().then( (state) => { /* We are still on the first instruction here */ }).done()
```
## License
MIT
