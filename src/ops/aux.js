function formatTok(tok) {
  if (typeof tok !== 'object') {
    return tok;
  }
  switch(tok.type) {
    case 'op':
      return tok.name;
    case 'sub':
      return "SUB " + tok.name + " " + codeToStr(tok.body) + " RETURN";
    case 'goto':
      return "GOTO " + tok.label;
    case 'label':
      return tok.label + ":";
    case 'if':
      var s = 'IF '
      s += codeToStr(tok.a);
      s += ' ELSEIF ' + codeToStr(tok.b);
      return s + ' ENDIF';
    case 'loop':
      return 'BEGIN ' + codeToStr(tok.code) + ' REPEAT';
    default:
      return '?' + tok.type + '?';
  }
}

function codeToStr(code, ip) {
  if (!code) return '';
  return code.map(function (tok, i) {
    var s = formatTok(tok);
    if (i === ip) {
      s = "*" + s;
    }
    return s;
  }).join(' ');
}

module.exports.info = function (state) {
  console.log("INFO:", JSON.stringify(state, 0, 2));
};

module.exports.pstack = function (state) {
  console.log("STACK:", state.stack);
};
module.exports.pframe = function (state) {
  var frame = state.curFrame();

  console.log("FRAME:", codeToStr(frame.code, frame.ip) );
};
module.exports.pcstack = function (state) {
  console.log("CALLSTACK:", JSON.stringify(state.exec));
};
