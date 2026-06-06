function CALT() {
   function lexer(src) {
        let simples = {'(': "LPAREN", ')': "RPAREN", '[': "LBRACK", ']': "RBRACK", '{': "LBRACE", '}': "RBRACE", ',': "COMMA", ';': "SEMICOLON", "=": "EQUALS", ">": "GREATER_THAN", "<": "SMALLER_THAN", ">=": "GREATER_EQUALS", "<=": "SMALLER_EQUALS"};
        let keywords = {"main": "START", "org": "ORIGIN", "vrb": "VARIABLE", "const": "CONSTANT", "ret": "RETURN", "if": "IF", "elif": "ELSE_IF", "els": "ELSE", "fun": "FUNCTION", "output": "OUTPUT_FUNC", "input": "INPUT_FUNC", "cos": "COSINE_FUNC", "sin": "SINE_FUNC", "tan": "TANGENT_FUNC", "log": "LOGARITHM_FUNC"};
        let ar_operators = {"+": "PLUS", "-": "MINUS", "*": "TIMES", ":": "DIVIDE", "%": "MODULO", "^": "POWER", "'": "SQR_RT", "!": "FACTORIAL", "?": "TERMIAL", "|": "ABSOLUTE_VALUE", "\\": "FLOOR", "/": "CEILING", "~": "ROUND"};
        let whitespace = ['\n', '\t', '\r', ' '];
        let pos = 0;
        let tokens = []; 
        let line = 1;
        let column = 1;
        /*\
        |*|
        \*/
        function move(n = 1) {pos += n; column += n}; 
        function token(type, val) {
            tokens.push({
                type: type,
                value: val,
                line: line,
                column: column
            });
        };
        function digit(x) {
            if(x <= '9' && x >= '0') {return true} else {return false};
        };
        function letter(x) { 
            if((x <= 'z' && x >= 'a') || (x <= 'Z' && x >= 'A')) {return true} else {return false};
        };
        function alpha(x) { 
            if(letter(x) || digit(x)) {return true} else {return false};
        };
        /*\
        |*|
        \*/
        while(pos < src.length) {
            let char = src[pos]; 
            switch(true) { 
                case char in whitespace:
                  if(char === '\n') {line++; column = 1}; pos++; break;
                case digit(char):
                    let digitVal = '';
                    while(digit(src[pos])) {digitVal += src[pos]; move()};
                    if(src[pos] === ".") {
                        digitVal += src[pos]; move();
                        while(digit(src[pos])) {digitVal += src[pos]; move()};
                    };
                    if(digitVal.startsWith("00") || digitVal.split(".").length - 1 > 1) { 
                        throw new Error(`number found at line ${line}, column ${column} is malformed/not valid(e.g. "00.7" because of double zero).`);
                    };
                    token("DIGIT", digitVal); break;
                case char in simples:
                    let simpleType = simples[char]; token(simpleType, char);
                    move(); break;
                case letter(char): 
                    let letterVal = '';
                    while(alpha(src[pos])) {letterVal += src[pos]; move()};
                    if(letterVal in keywords) { 
                        token(`${keywords[letterVal]}_KEYWORD`, `${letterVal}`);
                    } 
                    else {throw new Error(`unrecognized identifier '${letterVal}' at line ${line}, column ${column}.`)};
                    break;
                case char in ar_operators: 
                    let operatorType = ar_operators[char]; 
                    if((char !== '!' && char !== '?' && char !== "'") && src[pos+1] === '=') {token(`${operatorType}_EQUALS_OPERATOR`, `${char}=`); move(2)}
                    else if(src[pos+1] === "=") { 
                        throw new Error(`can't assign a variable its own factorial, termial or square root via shortcut, at line ${line}, column ${column}.`);
                    } 
                    else if(char === src[pos+1] && (char === '?' || char === '!')) {token(`DOUBLE_${char}_OPERATOR`, `${char}${char}`); move(2)} 
                    else {token(`${operatorType}_OPERATOR`, `${char}`); move()}; break;
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
        function parsePSFTO() {return operation(parseARG(), ["POWER_OPERATOR", "SQR_RT_OPERATOR", "FACTORIAL_OPERATOR", "TERMIAL_OPERATOR", "DOUBLE_FACTORIAL_OPERATOR", "DOUBLE_TERMIAL_OPERATOR", "ABSOLUTE_VALUE_OPERATOR", "FLOOR_OPERATOR", "CEILING_OPERATOR", "ROUND_OPERATOR"])};
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
    /*\
    |*|
    \*/
    function interpreter(ast) {
        function factorial(number, move = 1) {
            let result = 1;
            for(let i = 1; i <= number; i += move) {result *= i};
            return result;
        };
        function termial(number, move = 1) {
            let result = 1;
            for(let i = 1; i <= number; i += move) {result += i};
            return result;
        };
        function evaluate(node) {
            switch(node.type) {
                case 'Literal':
                    return node.value; break;
                case 'BinaryOperation':
                    let L = evaluate(node.left);
                    let R = evaluate(node.right);
                    switch(node.operator) {
                        case '+': return L + R; break; case '-': return L - R; break;
                        case '*': return L * R; break; case ':': return L / R; break; case '%': return L % R; break;
                        case '^': return Math.pow(L, R); break; case "'": return Math.pow(L, 0.5); break;
                        case '!': return factorial(L); break; case '!!': return factorial(L, 2); break;
                        case '?': return termial(L); break; case '??': return termial(L, 2); break;
                        case '|': return Math.abs(L); break; case '~': return Math.round(L); break;
                        case '\\': return Math.floor(L); break; case '/': return Math.ceil(L); break;
                    };
                    break;
                case 'VariableReference': break; //TODO: complete
            };
        };
    };
};
module.exports = {CALT}; // export our logic to run.js because we need it to actually run in .calt files
