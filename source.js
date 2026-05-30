function CALT() {
    function lexer(src) {
        let simples = {'(': "LPAREN", ')': "RPAREN", ',': "COMMA", '!': "OUTPUT_START", '?': "OUTPUT_END"};
        let keywords = {"output": "OUTPUT", "org": "ORIGIN", "var": "VARIABLE", "const": "CONSTANT", "ret": "RETURN"};
        let pos = 0;
        let tokens = [];
        let line = 1;
        let column = 1;
        function move(n = 1) {pos += n; column += n};
        function token(type, value) {
            tokens.push({
                type: type,
                value: value,
                line: line,
                column: columm
            });
        };
        function digit(x) {
          if(x <= 9 && x >= 0) {return true};
          else {return false};
        };
        while(pos < source.length) {
            char = src[pos];
            switch(true) {
                case digit(char):
                    val = '';
                    while(digit(src[pos]) {
                        val += src[pos];
                        move();
                    };
                    if(src[pos] === ".") {
                        while(digit(src[pos]) {
                            val += src[pos];
                            move();
                        };
                    };
                    token("DIGIT", val);
                    break;
                case char in simples:
                    break;
            };
      };    
};
module.exports = {CALT};
