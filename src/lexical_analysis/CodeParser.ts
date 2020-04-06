import { match } from "assert";

const fs = require("fs");
const rmHeadSpace = require("./functions").removeHeadSpace;

class CodeParser {
    DFA:any = {};
    TokenStream:Array<any> = [];
    codeString:string = "";
    restCode:string = "";
    lineCount:number = 0;

    constructor(dfa:any) {
        this.DFA = dfa;
    }

    matchNode(typeName:string, DfaIndex:number, codeOffset:number):object {
        var dfaNode:DFANode = this.DFA[typeName][DfaIndex];
        for(var i in dfaNode.nextState) {
            if(dfaNode.nextState[i].character == this.restCode[codeOffset]) {
                if(this.restCode.length-1 == codeOffset) {  // end of code
                    return {
                        "token":dfaNode.nextState[i].character,
                        "matched":true
                    };
                }
                // not end of code, continue matching
                var nextResult:any = this.matchNode(typeName, dfaNode.nextState[i].index, codeOffset+1);
                if(nextResult.matched) {
                    return {
                        "token":dfaNode.nextState[i].character + nextResult.token,
                        "matched":true
                    }
                } else {
                    return {
                        "token":"",
                        "matched":false
                    }
                }
                
            }
        }

        // end node
        // should support self looping
        if(dfaNode.stateType == "END_NODE") {
            return {
                "token":"",
                "matched":true
            };
        }
        
        return {
            "token":"",
            "matched":false
        };
    }

    matchType(typeName:string):boolean {
        var dfaNodes:Array<DFANode> = this.DFA[typeName];
        var result:any = this.matchNode(typeName, 0, 0);
        if(result.matched) {
            if(result.token == "\n") {  // LF
                this.lineCount++;
            }
            this.TokenStream.push({
                "line":this.lineCount,
                "type":typeName,
                "token":result.token
            });
            return true;
        }
        return false;
    }

    parse(codeFile:string):void {
        try {
            this.codeString = fs.readFileSync(codeFile).toString();
        } catch(e) {
            console.log("code file read error");
            console.log(e);
        }
        this.TokenStream = [];
        this.restCode = this.codeString.trim();
        this.lineCount = 0;

        while(this.restCode.length > 0) {
            // should match in order: 
            // keyword -> constant -> identifier -> operator -> delimiter
            if(this.matchType("keyword")) {
                var tokenLength:number = this.TokenStream[this.TokenStream.length-1].token.length;
                this.restCode = this.restCode.substr(tokenLength);
            } else if(this.matchType("constant")) {
                var tokenLength:number = this.TokenStream[this.TokenStream.length-1].token.length;
                this.restCode = this.restCode.substr(tokenLength);
            } else if(this.matchType("identifier")) {
                var tokenLength:number = this.TokenStream[this.TokenStream.length-1].token.length;
                this.restCode = this.restCode.substr(tokenLength);
            } else if(this.matchType("operator")) {
                var tokenLength:number = this.TokenStream[this.TokenStream.length-1].token.length;
                this.restCode = this.restCode.substr(tokenLength);
            } else if(this.matchType("delimiter")) {
                var tokenLength:number = this.TokenStream[this.TokenStream.length-1].token.length;
                this.restCode = this.restCode.substr(tokenLength);
            } else {  // can not match any type
                console.log("error matching:", this.restCode.substr(0, 40));
                break;
            }

            this.restCode = rmHeadSpace(this.restCode);
        }
        console.log(this.TokenStream);
        // TODO
    }
}

module.exports = {
    CodeParser:CodeParser
}