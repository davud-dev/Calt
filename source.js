function CALT() { // the main function, containing both the lexer, parser and interpreter
    function lexer(src) {
        let simples = {'(': "LPAREN", ')': "RPAREN", '{': "LBRACE", '}': "RBRACE", ',': "COMMA", "<": "OUTPUT_START", ">": "OUTPUT_END"};
        let keywords = {"output": "START", "org": "ORIGIN", "var": "VARIABLE", "const": "CONSTANT", "ret": "RETURN"};
        let ar_operators = {"+": "PLUS", "-": "MINUS", "*": "TIMES", "/": "DIVIDE", "%": "MODULO", "^": "POWER", "'": "SQUARE_ROOT", "!": "FACTORIAL", "?": "TERMIAL"};
        let pos = 0; // for keeping ttack on what token we're currently on
        let tokens = []; // for having an actual token array to have tokens in, allowing the parser to do something with em
        let line = 1;               //both the line          for better
        let column = 1; //tracking of             and column         error messages
        function move(n = 1) {pos += n; column += n}; // for making me stop forgetting to only do pos++ and not also column++;
        function token(x, y) { // here made to simplify the process from tokens.push({type: x, value: y, line: line, column: columm}) to just token(x, y)
            tokens.push({
                type: x,
                value: y,
                line: line,
                column: columm
            });
        };
        function digit(x) { // here made to simplify the checking of whether x is a digit or not
            if(x <= 9 && x >= 0) {return true};
            else {return false};
        };
        function letter(x) { // same thing as digit(x), but for letters
            if((x <= z && x >= a) && (x <= Z && x >= A)) {return true};
            else {return false};
        };
        function alpha(x) { // here made to combine both letter(x) and digit(x), alpha not being from alpha male, just alphanumerical
            if(letter(x) || digit(x)) {return true};
            else {return false};
        while(pos < source.length) { // main while loop, so that we actually advance throught the source
            const char = src[pos]; // constant current character, changes through each iteration of the while loop so we dont rely on src[pos] too much
            switch(true) { // switch statement instead of if/else if/else because it's both cleaner and more optimized
                case digit(char):
                    val = ''; // here for storing a solid value which can be used for our numbers "rendering" as a token
                    while(digit(src[pos]) { // here for handling of regular integers
                        val += src[pos]; 
                        move(); // for making sure we dont just get stuck in the loop
                    };
                    if(src[pos] === ".") { // here for handling of floats and what-not
                        while(digit(src[pos]) {
                            val += src[pos];
                            move(); // for making sure we dont just get stuck in the loop
                        };
                    };
                    token("DIGIT", val); // here for pushing tokens to the lexer
                    break;
                case char in simples: // here to simplify(ha, get it?) handling of single-character tokens
                    let type = simples[char];
                    token(type, char);
                    break;
                case letter(char): // here for handling of keywords and other recognized identifiers
                    let val = ''; // here for storing a value we can actually use and compare to our approved identifiers
                    while(alpha(src[pos]) { // for getting the full token before judging it
                        val += src[pos];
                        move(); // for making sure we dont get stuck in the loop
                    };
                    if(val in keywords) { // for checking if the identifier is whitelisted
                        let type = keywords[char] + "_KEYWORD"; 
                        token(type, val); // if yes, passed as a keyword.
                    } // If not..
                    else {throw new Error("Unrecognized identifier at line " + line + ", column " + columm + ".")};
                    break;
            };
      };    
};
module.exports = {CALT}; //export our logic to run.js to actually run
