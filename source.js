function CALT() {
    function lexer(src) {
        let simples = {'(': "LPAREN", ')': "RPAREN", '{': "LBRACE", '}': "RBRACE", ',': "COMMA", "<": "OUTPUT_START", ">": "OUTPUT_END"};
        let keywords = {"output": "START", "org": "ORIGIN", "var": "VARIABLE", "const": "CONSTANT", "ret": "RETURN"};
        let ar_operators = {"+": "PLUS", "-": "MINUS", "*": "TIMES", "/": "DIVIDE", "%": "MODULO", "^": "POWER", "'": "SQUARE_ROOT", "!": "FACTORIAL", "?": "TERMIAL"};
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
                    val = ''; // here for storing a solid value which can be used for our numbers "rendering" as a token
                    while(digit(src[pos]) { // here for handling of regular integers
                        val += src[pos]; 
                        move(); 
                    };
                    if(src[pos] === ".") { // here for handling of floats and what-not
                        while(digit(src[pos]) {
                            val += src[pos];
                            move();
                        };
                    };
                    token("DIGIT", val); // here for pushing our token to the lexer
                    break;
                case char in simples: // here to simplify(ha, get it?) handling of single-character tokens
                    let type = simples[char];
                    token(type, char);
                    break;
                case char in keywords: // here for simplifying handling of different characters
                    let type = keywords[char];
                    token(type + "_KEYWORD", char);
                    break;
            };
      };    
};
module.exports = {CALT};
