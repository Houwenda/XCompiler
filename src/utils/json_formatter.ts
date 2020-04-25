var keywords: Array<string> = [
    "for", "in", "do", "end", "while", "break",  // loop control
    "if", "then", "else", "elseif",  // branch control
    "local",  // scope
    "true", "false",  // boolean value
    "nil", "number", "function",  // basic data types
    "return", "require"  // other
]

var operators: Array<string> = [
    "=", "!", "+", "-", "*", "/", "%", "+=", "-=", "*=", "/=", "%=",  // number calculation
    "and", "or", "not",  // logical calculation
    "==", "!=", ">", "<", ">=", "<=",  // comparation
]

var delimiters: Array<string> = ["{", "}", "[", "]", "(", ")", ",", "\n", "."]

function format2string(list: Array<string>): void {
    var results: Array<any> = [];
    for (var i in list) {
        var content: string = list[i];
        results.push({
            "description": content,
            "string": content
        });
    }
    console.log(JSON.stringify(results));
}

function format2production(list: Array<string>): void {
    var results: Array<any> = [];
    for (var i in list) {
        var content: string = list[i];
        var result: Array<string> = [];
        var stateNum: number = 65;
        for (var j = 0; j < content.length - 1; j++) {
            result.push(String.fromCharCode(stateNum) + "->" + "<" + content[j] + ">" + String.fromCharCode(stateNum + 1));
            stateNum++;
        }
        result.push(String.fromCharCode(stateNum) + "->" + "<" + content[j] + ">");
        //console.log(result);

        results.push({
            "description": content,
            "production": result
        });
    }
    console.log(JSON.stringify(results));
}

format2production(operators);
format2production(delimiters);
format2production(keywords);