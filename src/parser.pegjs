start
  = ___ (Statements / Comment)* ___

Statements
  = head:Statement (__ / EOF)?
    tail:(Statement (__ / EOF)?)* {
      var result = [head];
      for (var i=0; i<tail.length; i++) {
        result.push(tail[i][0])
      }
      return result;
    }

Statement
  =  Sub / Goto / Cond / While / Loop / Label / Opcode / Number

While
  = "WHILE"i ___ body:Statements? "REPEAT"i {
    return {
      type: 'while',
      body: body,
    };
  }

Sub
  = "SUB"i __ name:Word ___ body:Statements? "RETURN"i {
    return {
      type: 'sub',
      name: name,
      body: body,
    }
  }

Goto
  = "GOTO"i __ label:Word {
    return {
      type: 'goto',
      label: label,
    };
  }
Cond
  = "IF"i ___ a:Statements? b:("ELSE"i ___ Statements?)? "ENDIF"i {
    return {
      type: 'if',
      a: a,
      b: b && b[2],
    };
  }
Loop
  = "BEGIN"i ___ code:Statements? "REPEAT"i {
    return { loop: code };
  }
Label
  = name:Word ":" {
    return {
        type: 'label',
        label: name
      };
  }
Opcode
  = !Reserved op:Word {
    return {type: 'op', op: op};
  }
Number
  = num:[0-9]+ { return parseInt(num.join('', 10)); }
Comment "comment"
  = "#" (!EOL .)*

Reserved = "BEGIN"i / "REPEAT"i / "SUB"i / "WHILE"i / "IF"i / "ELSE"i / "ENDIF"i / "GOTO"i / "RETURN"i

Word
  = word:[a-zA-Z_]+ { return word.join(''); }

Whitespace = [ \t\n\r]

_   = Whitespace*

__  = (Whitespace / Comment / EOL)+
___ = (Whitespace / Comment / EOL)*

EOF = !.
EOL = "\n" / "\r\n" / "\r"
