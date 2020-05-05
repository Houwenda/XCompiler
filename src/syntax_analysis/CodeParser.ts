import { match } from "assert";
const LR1DFANode = require("./Node").LR1DFANode;
const tokenType = require("./functions").tokenType;

class CodeParser {
    ACTION: Array<any>;
    GOTO: Array<any>;
    DFA: Array<any> = [];
    promotedProductions: Array<any>;

    constructor(actionTable: Array<any>, gotoTable: Array<any>, dfa: Array<any>, productions: Array<any>) {
        this.ACTION = actionTable;
        this.GOTO = gotoTable;
        this.DFA = dfa
        this.promotedProductions = productions;
    }

    queryAction(topState: number, inputToken: any): any {
        for (var tmpAction of this.ACTION) {
            //console.log(inputToken["token"], inputToken["type"], tmpAction["character"])//
            if (tmpAction["index"] == topState) {
                if ((inputToken["type"] == "identifier" || inputToken["type"] == "constant") &&
                    "<" + inputToken["type"] + ">" == tmpAction["character"]) {  // identifer or constant
                    return tmpAction;
                } else if (inputToken["token"] == tmpAction["character"]) {  // need to be the same common symbol
                    return tmpAction;
                } else if (tmpAction["character"] == "<HASH>") {  // <HASH> as search result to deal with empty production
                    return tmpAction;
                }
            }
        }
        return null;
    }

    queryGOTO(topState: number, productionLeft: string): any {
        for (var tmpGoto of this.GOTO) {
            if (tmpGoto["index"] == topState && tmpGoto["state"] == productionLeft) {
                return tmpGoto;
            }
        }
        return null;
    }

    parse(tokenStream: Array<any>): void {
        // add stop sign <HASH>
        tokenStream.push({
            "line": -1,
            "type": 'HASH',
            "token": '<HASH>'
        });

        var symbolStack: Array<any> = [];
        var stateStack: Array<number> = [0];
        // parse token
        var analyzedTokenCount: number = 0;
        while (stateStack.length > 0) {
            var inputToken: any = tokenStream[analyzedTokenCount];
            console.log("\nanalyzing :", inputToken);
            var actionResult: any = this.queryAction(stateStack[stateStack.length - 1], inputToken);
            if (actionResult == null) {  // empty result, error
                // where error happens
                console.log("error occured when querying ACTION table with token '" + 
                    inputToken.token + "' on line " + inputToken.line + 
                    ", token type '" + inputToken.type + "'");
                // get possible errors by productions
                var possibleErrorArray: Array<string> = [];
                for (var tmpProductionIndex of this.DFA[stateStack[stateStack.length - 1]].productionIndex) {
                    if(possibleErrorArray.indexOf(this.promotedProductions[tmpProductionIndex]["description"]) == -1) {  // remove duplicate
                        possibleErrorArray.push(this.promotedProductions[tmpProductionIndex]["description"]);
                    }
                }
                var possibleSyntaxError: string = "syntax error possibly in: "
                for (var tmpSyntaxError of possibleErrorArray) {
                    possibleSyntaxError += "'" + tmpSyntaxError + "' ";
                }
                console.log(possibleSyntaxError);
                // expected tokens
                var tokensExpected = "";
                for (var tmpAction of this.ACTION) {
                    if (tmpAction["index"] == stateStack[stateStack.length - 1]) {
                        tokensExpected += tmpAction.character + " ";
                    }
                }
                console.log("symbols expected: ", tokensExpected);
                console.log();
                // stack trace
                console.log("state stack:\n", stateStack)
                console.log("symbol stack:\n", symbolStack)
                console.log("ACTION[" + stateStack[stateStack.length - 1] + "]:");
                for (var tmpAction of this.ACTION) {
                    if (tmpAction["index"] == stateStack[stateStack.length - 1]) {
                        console.log(tmpAction);
                    }
                }
                // tokens left
                console.log("error matching! tokens left: ");
                for(var i:number = analyzedTokenCount; i < tokenStream.length && i < analyzedTokenCount+15; i++) {
                    console.log(tokenStream[i]);
                }
                return;
            } else if (actionResult["content-type"] == "S") {  // move in 
                console.log("move in")//
                stateStack.push(actionResult["content"]);
                symbolStack.push(inputToken);
                analyzedTokenCount++;
                //console.log(stateStack)//
                //console.log(symbolStack)//
            } else if (actionResult["content-type"] == "r") {  // reduce
                console.log("reduce")//
                // handle state stack
                var production: any = this.promotedProductions[actionResult["content"]];
                for (var i: number = 0; i < production["right"].length; i++) {
                    stateStack.pop();
                }
                var gotoResult: any = this.queryGOTO(stateStack[stateStack.length - 1], production["left"]);
                if (gotoResult == null) {  // empty GOTO result, error
                    console.log("error occured when querying GOTO table with production left:", production["left"]);
                    console.log("description:", production["description"]);
                    //console.log(stateStack[stateStack.length - 1], production["left"])//
                    //console.log("ACTION[" + stateStack[stateStack.length - 1] + "]");
                    console.log("state stack:\n", stateStack);
                    console.log("symbol stack:\n", symbolStack);
                    console.log("ACTION[" + stateStack[stateStack.length - 1] + "]:");
                    for (var tmpGoto of this.GOTO) {
                        if (tmpGoto["index"] == stateStack[stateStack.length - 1]) {
                            console.log(tmpGoto);
                        }
                    }
                    // TODO: debug info
                    console.log("error matching! tokens left: ");
                    for(var i:number = analyzedTokenCount; i < tokenStream.length && i < analyzedTokenCount+40; i++) {
                        console.log(tokenStream[i]);
                    }
                    return;
                } else {
                    stateStack.push(gotoResult["content"]);
                }

                // handle symbol stack
                for (var i: number = 0; i < production["right"].length; i++) {
                    symbolStack.pop();
                }
                symbolStack.push({
                    "line": inputToken["line"],
                    "type": inputToken["type"],
                    "token": production["left"]
                });
                //console.log(stateStack)//
                //console.log(symbolStack)//
            } else if (actionResult["content-type"] == "acc") {  // accept
                console.log("accept!");
                analyzedTokenCount++;  // skip <HASH> added to token stream
                if (analyzedTokenCount < tokenStream.length) {
                    console.log("input string not empty, there are symbols after analysis:");
                    for(var i:number = analyzedTokenCount; i < tokenStream.length; i++) {
                        console.log(tokenStream[i]);
                    }
                }
                return;
            } else {
                console.log("content-type error");  // this should not happen
            }

            console.log(stateStack)//
            console.log(symbolStack)//

        }
        console.log("parsing ends");
    }
}

module.exports = {
    CodeParser: CodeParser
}