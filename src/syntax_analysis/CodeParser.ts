import { match } from "assert";
const LR1DFANode = require("./Node").LR1DFANode;
const tokenType = require("./functions").tokenType;

class CodeParser {
    ACTION:Array<any>;
    GOTO:Array<any>;
    promotedProductions:Array<any>;

    constructor(actionTable:Array<any>, gotoTable:Array<any>, productions:Array<any>){
        this.ACTION = actionTable;
        this.GOTO = gotoTable;
        this.promotedProductions = productions;
    }

    queryAction(topState:number, inputToken:any):any {
        for(var tmpAction of this.ACTION) {
            //console.log(inputToken["token"], inputToken["type"], tmpAction["character"])//
            if(tmpAction["index"] == topState) {
                if((inputToken["type"] == "identifier" || inputToken["type"] == "constant") &&
                "<" + inputToken["type"] + ">" == tmpAction["character"]) {  // identifer or constant
                    return tmpAction;
                } else if(inputToken["token"] == tmpAction["character"]) {  // need to be the same common symbol
                    return tmpAction;
                }
            }
        }
        return null;
    }

    queryGOTO(topState:number, productionLeft:string):any {
        for(var tmpGoto of this.GOTO) {
            if(tmpGoto["index"] == topState && tmpGoto["state"] == productionLeft) {
                return tmpGoto;
            }
        }
        return null;
    }

    parse(tokenStream:Array<any>):void {
        var symbolStack:Array<any> = [];
        var stateStack:Array<number> = [0];
        // parse token
        var analyzedTokenCount:number = 0;
        while(analyzedTokenCount < tokenStream.length) {
            var inputToken:any = tokenStream[analyzedTokenCount];
            console.log("\nanalyzing :", inputToken);
            var actionResult:any = this.queryAction(stateStack[stateStack.length - 1], inputToken);
            if(actionResult == null) {  // empty result, error
                console.log("error occured when querying ACTION table");
                //console.log(stateStack[stateStack.length - 1], inputToken)//
                console.log("ACTION[" + stateStack[stateStack.length - 1] + "]");
                for(var tmpAction of this.ACTION) {
                    if(tmpAction["index"] == stateStack[stateStack.length - 1]) {
                        console.log(tmpAction);
                    }
                }
                //console.log(stateStack)//
                //console.log(symbolStack)//
                // TODO: debug info
                return;
            } else if(actionResult["content-type"] == "S") {  // move in 
                console.log("move in")//
                stateStack.push(actionResult["content"]);
                symbolStack.push(inputToken);
                //console.log(stateStack)//
                //console.log(symbolStack)//
            } else if(actionResult["content-type"] == "r") {  // reduce
                console.log("reduce")//
                // handle state stack
                var production:any = this.promotedProductions[actionResult["content"]];
                for(var i:number = 0; i < production["right"].length; i++) {
                    stateStack.pop();
                }
                var gotoResult:any = this.queryGOTO(stateStack[stateStack.length - 1], production["left"]);
                if(gotoResult == null) {  // empty GOTO result, error
                    console.log("error occured when querying GOTO table");
                    console.log(stateStack[stateStack.length - 1], production["left"])//
                    // TODO: debug info
                    return;
                } else {
                    stateStack.push(gotoResult["content"]);
                }

                // handle symbol stack
                for(var i:number = 0; i < production["right"].length; i++) {
                    symbolStack.pop();
                }
                symbolStack.push({
                    "line": inputToken["line"],
                    "type": inputToken["type"],
                    "token": production["left"]
                });
                analyzedTokenCount--; // keep analyzing current input token
                //console.log(stateStack)//
                //console.log(symbolStack)//
            } else if(actionResult["content-type"] == "acc") {  // accept
                console.log("accept!");
                if(analyzedTokenCount < tokenStream.length) {
                    console.log("input string not empty, there are symbols after analysis.");
                }
                return;
            } else {
                console.log("content-type error");  // this should not happen
            }

            console.log(stateStack)//
            console.log(symbolStack)//
        

            analyzedTokenCount++;
        }
        console.log("parsing ends");
    }
}

module.exports = {
    CodeParser:CodeParser
}