function CALT() { // the main function, containing both the lexer, parser and interpreter
   function lexer(src) {
        let simples = {'(': "LPAREN", ')': "RPAREN", '[': "LBRACK", ']': "RBRACK", '{': "LBRACE", '}': "RBRACE", ',': "COMMA", ';': "SEMICOLON", "=": "EQUALS"};
        let keywords = {"main": "START", "org": "ORIGIN", "vrb": "VARIABLE", "const": "CONSTANT", "ret": "RETURN", "if": "IF", "elif": "ELSE_IF", "els": "ELSE", "fun": "FUNCTION"};
        let ar_operators = {"+": "PLUS", "-": "MINUS", "*": "TIMES", "/": "DIVIDE", "%": "MODULO", "^": "POWER", "'": "SQR_RT", "!": "FACTORIAL", "?": "TERMIAL"};
        let whitespace = ['\n', '\t', '\r', ' '];
        let pos = 0; // for keeping track on what token we're currently on
        let tokens = []; // for having an actual token array to have tokens in, allowing the parser to do something with em
        let line = 1;               //both the line          for better
        let column = 1; //tracking of              and column          error messages
        /*\
        |*|
        \*/
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
            if(x <= '9' && x >= '0') {return true} else {return false};
        };
        function letter(x) { // same thing as digit(x), but for letters
            if((x <= 'z' && x >= 'a') || (x <= 'Z' && x >= 'A')) {return true} else {return false};
        };
        function alpha(x) { // here made to combine both letter(x) and digit(x), alpha not being from alpha male, just alphanumerical
            if(letter(x) || digit(x)) {return true} else {return false};
        };
        /*\
        |*|
        \*/
        while(pos < src.length) { // main while loop, so that we actually advance throught the source
            let char = src[pos]; // constant current character, changes through each iteration of the while loop so we dont rely on src[pos] too much
            switch(true) { // switch statement instead of if/else if/else because it's both cleaner and more optimized
                case digit(char):
                    digitVal = ''; // here for storing a solid value which can be used for our numbers "rendering" as a token
                    while(digit(src[pos])) { // here for handling of regular integers
                        digitVal += src[pos]; 
                        move(); // for making sure we dont just get stuck in the loop
                    };
                    if(src[pos] === ".") { // here for handling of floats and what-not
                        digitVal += src[pos]; // for processing the dot making sure we get 3.14 and not 314
                        move(); // for advancing past the dot, for the while, else we get stuck
                        while(digit(src[pos])) {
                            digitVal += src[pos];
                            move(); // for making sure we dont just get stuck in the loop
                        };
                    };
                    if(digitVal.startsWith("00") || digitVal.split(".").length - 1 > 1) { // splits the code in the areas where there are dots, but because there is always one more part(e.g. 2 parts from 1 slice(dot), we have to remove 1 part
                        throw new Error(`number found at line ${line}, column ${column} is malformed/not valid(e.g. "00.7" because of double zero).`);
                    };
                    token("DIGIT", `${digitVal}`); // here for pushing tokens to the lexer
                    break;
                case char in simples: // here to simplify(ha, get it?) handling of single-character tokens
                    let simpleType = simples[char]; // e.g. simples('(') is 'LPAREN' so we automatically get the typw
                    token(`${simpleType}`, `${char}`); 
                    move();// so we can move past the token and not create an infinite amount of simples
                    break;
                case letter(char): // here for handling of keywords and other recognized identifiers
                    let letterVal = ''; // here for storing a value we can actually use and compare to our approved identifiers
                    while(alpha(src[pos])) { // for getting the full token before judging it
                        letterVal += src[pos];
                        move(); // for making sure we dont get stuck in the loop
                    };
                    if(letterVal in keywords || ) { // for checking if the identifier is whitelisted
                        token(`${keywords[letterVal]}_KEYWORD`, `${letterVal}`); // if yes, passed as a keyword.
                    } // If not..
                    else {throw new Error(`unrecognized identifier '${letterVal}' at line ${line}, column ${column}.`)};
                    break;
                case char in ar_operators: // for checking of arithmetical operatora
                    let operatorType = ar_operators[char]; // for simplyfying the token() function
                    if((char !== '!' && char !== '?' && char !== "'") && src[pos+1] === '=') {token(`${operatorType}_EQUALS_OPERATOR`, `${char}=`); move(2)} // condition for checking of math shortcuts while also making sure there's nothing like x != x(which would mean x = x!(factorial)
                    else if(src[pos+1] === "=") { // if the operator is either !=, ?= or '=...
                        throw new Error(`can't assign a variable its own factorial, termial or square root via shortcut, at line ${line}, column ${column}.`);
                    } 
                    else if(char === src[pos+1] && (char === '?' || char === '!')) {token(`DOUBLE_${char}_OPERATOR`, `${char}${char}`); move(2)} // here because it helps process double factorial/termial
                    else {token(`${operatorType}_OPERATOR`, `${char}`); move()}; // here to tokenize normal operators.
                    break;
                case char === "#":
                    let variableVal = ``; move();
                    while(letter(src[pos])) {variableVal += src[pos]; move()};
                    token("VARIABLE", `${variableVal}`); break;
                case char === '$':
                    let functionVal = ``; move();
                    while(letter(src[pos])) {functionVal += src[pos]; move()};
                    token("FUNCTION", `${functionVal}`); break;
                case char === '_':
                    let outputVal = ``; move();
                    while(src[pos] !== char) {outputVal += src[pos]; move()};
                    token("OUTPUT", `${outputVal}`); break;
                default: throw new Error(`unrecognized character '${char}' at line ${line}, column ${column}.`);
            };
        };
        token("END_OF_FILE", null); return tokens;
    };
    /*\
    |*|
    \*/
    function parser(tokens) {
        let current = 0;
        function peek(n = 0) {
            if(current > tokens.length) {throw new Error(`unexpected file end, couldn't parse tokens`)};
            return tokens[current + n];
        }
        function eat(expected) {
            if(peek().type === expected) {current++; return peek(-1)} else if(peek().type.includes(`_${expected}`)) {current++; return peek(-1)}
            else {throw new Error(`unexpected token '${peek()}' instead of expected '${expected}'.`)};
        };
        /*\
        |*|
        \*/
        function operation(lower, types) {
            let L = lower();
            while(types.includes(peek().type)) {
                const operator = eat(peek().type).value; let R = lower();
                L = {
                   type: "BinaryOperation",
                   operator: operator,
                   left: L,
                   right: R
                };
            };
            return L;
        };
        function parseAS() {return operation(parseMDM(), ["PLUS", "MINUS"])};
        function parseMDM() {return operation(parsePSFT(), ["TIMES", "DIVIDE", "MODULO"])};
        function parsePSFT() {return operation(parseARG(), ["POWER_OPERATOR", "SQR_RT_OPERATOR", "FACTORIAL_OPERATOR", "TERMIAL_OPERATOR", "DOUBLE_FACTORIAL_OPERATOR", "DOUBLE_TERMIAL_OPERATOR"])};
        /*\
        |*|
        \*/
        function parseARG() {const token = peek();
            switch(true) {
                case token.type === 'DIGIT': const number = eat("DIGIT").value;
                    return {
                        type: "Literal",
                        valueType: "Number",
                        value: number
                    }; break;
                case token.type.includes('KEYWORD'): const next = peek(1);
                    if(next.type !== "LPAREN") {const keyword = eat("KEYWORD").value;
                        return {
                            type: "Keyword",
                            name: keyword
                        };
                    } else {parseFUNC()}; break;
                case token.type === "VARIABLE": const variable = eat("VARIABLE").value;
                    return {
                        type: "VariableReference",
                        name: variable
                    }; break;
                case token.type === "OUTPUT": const output = eat("OUTPUT").value;
                    return {
                        type: "ExpectedOutput",
                        value: output
                    }; break;
                default: throw new Error(`unrecognized argument '${token.value}' at line ${token.line}, column ${token.columm}.`);
            };
        };
        function parseFUNC() {
            const name = eat("KEYWORD"); eat("LPAREN"); const args = [];
            while(peek().type !== "RPAREN") {const token = peek().type; if(token !== "COMMA") {args.push(parseARG())} else {eat("COMMA")}}; eat("RPAREN");
            return {
                type: "FunctionCall",
                name: name.value,
                arguments: args
            };
        };
        function parseVRB() {
            const vrbDeclaration = eat("KEYWORD").value; const vrbName = eat("VARIABLE"); eat("EQUALS"); const vrbValue = peek().value;
            if(vrbDeclaration === "vrb") {vrbDeclaration = "Changeable"} else if(vrbDeclaration === "const") {vrbDeclaration = "Constant"}
            else {throw new Error(`unrecognized declaration type '${declaration}' for a variable at line ${line}, column ${column}.`)};
            return {
                type: "VariableDeclaration",
                typeValue: vrbDeclaration,
                name: vrbName,
                value: vrbValue
            };
        };
        function parseNFUNC() {
           eat("FUNCTION"); eat("LPAREN"); const args = [];
           while(peek().type !== "RPAREN") {if(peek().type !== "COMMA") {args.push(eat("VARIABLE"))} else {eat("COMMA")}};
           eat("RPAREN"); eat("LBRACE"); const body = []; while(peek().type !== "RBRACE") {body.push(parseMULTI())}; eat("RBRACE");
           return {
               type: "FunctionDeclaration",
               arguments: args,
               body: body
           };
        };  
        function parseCOND() {
            eat("KEYWORD"); eat("LPAREN"); const cond = parseEXPR(); eat("RPAREN"); eat("LBRACK"); let body = [];
            while(peek().type !== "RBRACK") {body.push(parseMULTI())}; let elfBlocks = []; let elsBlock = null;
            while(peek().type === "KEYWORD" && peek().value === "elf") {
                eat("IDENTIFIER"); eat("LPAREN"); const elfCond = parseEXPR(); eat("RPAREN"); eat("LBRACK"); const elfBody = [];
                while(peek().type !== "RBRACK") {body.push(parseMULTI())};
                bifBlocks.push({
                    type: "ElfStatement",
                    condition: elfCond,
                    body: elfBody
                });
            };
            if(peek().type === "KEYWORD" && peek().value === "els") {
                eat("IDENTIFIER"); eat("LBRACK"); const elsBody = []; while(peek().type !== "RBRACK") {body.push(parseMULTI())};
                elsBlock = ({
                    type: "ElsStatement",
                    body: elsBody
                )};
            };
            return {
                type: "IfStatement",
                condition: cond,
                body: body,
                elfs: elfBlocks,
                els: elsBlock
            };
        };
       /*\
       |*|
       \*/
        function parseSINGLE(parseType) {const val = parseType(); eat("SEMICOLON"); return val};
        function parseMULTI() {const statement = peek();
            if(statement.type === "KEYWORD") {
                switch(statement.value) {
                    case 'vrb': case 'const': return parseSINGLE(parseVRB()); break;
                    case 'fun': return parseSINGLE(parseNFUNC()); break;
                    case 'if': return parseSINGLE(parseCOND()); break;
                    default: return parseSINGLE(parseFUNC()); break;
                };
            };
            else {throw new Error(`invalid token '${statement.value}' instead of regular statement at line ${statement.line}, column ${statement.column}.`)};
        };
        function parseALL() {let main = eat("KEYWORD");
            if(main.type !== "START") {throw new Error(`program is supposed to start with main{}, with code inside {}, but instead of "main" got "${main.value}.`)};
            eat("LBRACE"); const statements = []; while(peek().type !== "RBRACE") {statements.push(parseMULTI())}; eat("RBRACE");
            return {
                type: "CALT_Program",
                statements: statements
            };
        };
    };
};
module.exports = {CALT}; // export our logic to run.js because we need it to actually run in .calt files
