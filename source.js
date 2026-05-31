function CALT() { // the main function, containing both the lexer, parser and interpreter
    function lexer(src) {
        let simples = {'(': "LPAREN", ')': "RPAREN", '{': "LBRACE", '}': "RBRACE", ',': "COMMA", "<": "OUTPUT_START", ">": "OUTPUT_END", "=": "EQUALS"};
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
                column: column
            });
        };
        function digit(x) { // here made to simplify the checking of whether x is a digit or not
            if(parseInt(x) <= 9 && parseInt(x) >= 0) {return true};
            else {return false};
        };
        function letter(x) { // same thing as digit(x), but for letters
            if((x <= 'z' && x >= 'a') && (x <= 'Z' && x >= 'A')) {return true};
            else {return false};
        };
        function alpha(x) { // here made to combine both letter(x) and digit(x), alpha not being from alpha male, just alphanumerical
            if(letter(x) || digit(x)) {return true};
            else {return false};
        };
        while(pos < src.length) { // main while loop, so that we actually advance throught the source
            const char = src[pos]; // constant current character, changes through each iteration of the while loop so we dont rely on src[pos] too much
            switch(true) { // switch statement instead of if/else if/else because it's both cleaner and more optimized
                case digit(char):
                    val = ''; // here for storing a solid value which can be used for our numbers "rendering" as a token
                    while(digit(src[pos])) { // here for handling of regular integers
                        val += src[pos]; 
                        move(); // for making sure we dont just get stuck in the loop
                    };
                    if(src[pos] === ".") { // here for handling of floats and what-not
                        while(digit(src[pos])) {
                            val += src[pos];
                            move(); // for making sure we dont just get stuck in the loop
                        };
                    };
                    if(val.startsWith("00") || val.split(".").length - 1 > 1) {
                        throw new Error(`number found at line ${line}, column ${columm} is malformed/not valid(e.g. "00.7" because of double zero).`);
                    };
                    token("DIGIT", val); // here for pushing tokens to the lexer
                    break;
                case char in simples: // here to simplify(ha, get it?) handling of single-character tokens
                    let type = simples[char];
                    token(type, char);
                    move();
                    break;
                case letter(char): // here for handling of keywords and other recognized identifiers
                    let val = ''; // here for storing a value we can actually use and compare to our approved identifiers
                    while(alpha(src[pos])) { // for getting the full token before judging it
                        val += src[pos];
                        move(); // for making sure we dont get stuck in the loop
                    };
                    if(val in keywords) { // for checking if the identifier is whitelisted
                        token(`${keywords[val]}_KEYWORD`, val); // if yes, passed as a keyword.
                    } // If not..
                    else {throw new Error(`unrecognized identifier at line ${line}, column ${columm}.`)};
                    break;
                case char in ar_operators: // for checking of arithmetical operatora
                    let type = ar_operators[char]; // for simplyfying the token() function
                    if((char !== '!' && char !== '?' && char !== "'") && src[pos+1] === '=') {token(type + "_EQUALS", char + '='); move(2)}; // condition for checking of math shortcuts while also making sure there's nothing like x != x(which would mean x = x!(factorial)
                    else if(src[pos+1] === "=") { // if the operator is either !=, ?= or '=...
                        throw new Error(`can't assign a variable its own factorial, termial or square root via shortcut, at line ${line}, column ${column}.`);
                    } 
                    else if(char === src[pos+1] && (char === '?' || char === '!')) {token(`DOUBLE_${char}_OPERATOR`, `${char}${char}`); move(2)}; // here because it helps process double factorial/termial
                    else {token(type + "_OPERATOR", val); move()}; // here to tokenize normal operators.
                    break;
            };
        };
        token("END_OF_FILE", null); // lets the parser know when to stop tokenizing
        return tokens;
    };
    function parser(tokens) {
        let current = 0;
        //TODO: finish
    };
};
module.exports = {CALT}; // export our logic to run.js because we need it to actually run in .calt files
