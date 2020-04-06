var fs = require("fs");
var rmHeadSpaces = require("./functions").removeHeadSpaces;

class CodeParser {
    DFA:any = {};
    TokenStream:Array<any> = [];
    codeString = "";

    constructor(dfa:any) {
        this.DFA = dfa;
    }

    parseCode(codeString:string, line:number) {
        // TODO
    }

    parse(codeFile:string):void {
        try {
            this.codeString = fs.readFileSync(codeFile);
        } catch(e) {
            console.log("code file read error");
            console.log(e);
        }

        //var restCode:string = removeHeadSpaces(codes);
        // while(restCode.length > 0) {

        // }
        //console.log(codes);
        // TODO
    }
}

module.exports = {
    CodeParser:CodeParser
}