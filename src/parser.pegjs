{
  var id = 0;
}
start
  = ___ statements:Statements? ___ { return statements ? statements : []; }

Statements
  = head:Statement (__ / EOF)?
    tail:(Statement (__ / EOF)?)* {
      var result = [head];
      for (var i=0; i<tail.length; i++) {
        result.push(tail[i][0]);
      }

      // Unwrap (flatten) results returned by Loop etc.
      result = [].concat.apply([], result);

      // Move SUBs to the beginning
      return result.reduce(function(prev, el) {
        if (el && el.type === 'sub') {
          return [el].concat(prev);
        }
        return prev.concat(el);
      }, []);
    }

Statement
  = Label / Sub / Goto / Cond / LoopWhile / Opcode / Number

Sub
  = "SUB"i __ name:Word ___ body:Statements? "RETURN"i {
    return {
      type: 'sub',
      name: name,
      body: body || [],
    };
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
    // Generate new ID to mark matching labels/jumps
    id++;
    // Generate jump representation of the IF .. ELSE .. ENDIF
    return [].concat(
        {type: 'jz', label: 'else_'+id},
        a,
        {type: 'goto', label: 'endif_'+id},
        {type: 'label', label: 'else_'+id},
        b && b[2],
        {type: 'label', label: 'endif_'+id}
      ).filter( function (el) {return (el !== undefined && el !== null) });
  }

LoopWhile
  = "BEGIN"i ___ body:Statements? whileBody:("WHILE"i __ Statements?)? "REPEAT"i {
    // Generate new ID to mark matching labels/jumps
    id++;
    // Generate jump representation of BEGIN ... (WHILE ...) REPEAT
    return [].concat(
        {type: 'label', label: 'begin_'+id},
        body && body,
        whileBody && {type: 'jz', label: 'repeat_'+id},
        whileBody && whileBody[2],
        {type: 'goto', label: 'begin_'+id},
        whileBody && {type: 'label', label: 'repeat_'+id}
      ).filter( function (el) {return (el !== undefined && el !== null) });
  }

Label
  = name:Word ":" {
    return {
        type: 'label',
        label: name
      };
  }

Opcode
  = !Reserved name:Word {
    return {type: 'op', name: name};
  }

Number
  = num:("-"? [0-9]+) { return parseInt(num.join('', 10)); }

Comment "comment"
  = "#" (!EOL .)*

Reserved = "BEGIN"i / "REPEAT"i / "SUB"i / "IF"i / "ELSE"i / "ENDIF"i / "GOTO"i / "RETURN"i / "WHILE"i

Word
  = head:[a-zA-Z_] tail:[a-zA-Z_0-9]* { return head + tail.join(''); }

Whitespace = [ \t\n\r]

_   = Whitespace*

__  = (Whitespace / Comment / EOL)+
___ = (Whitespace / Comment / EOL)*

EOF = !.
EOL = "\n" / "\r\n" / "\r"
