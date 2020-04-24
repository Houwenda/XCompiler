import { match } from "assert";
const LR1DFANode = require("./Node").LR1DFANode;
const tokenType = require("./functions").tokenType;

class CodeParser {
    ACTION:Array<any>;
    GOTO:Array<any>;

    constructor(actionTable:Array<any>, gotoTable:Array<any>){
        this.ACTION = actionTable;
        this.GOTO = gotoTable;
    }

    queryAction(topState:number, inputToken:any):any {
        for(var tmpAction of this.ACTION) {
            if(tmpAction["index"] == topState) {
                if((inputToken["type"] == "identifier" || inputToken["type"] == "constant") &&
                "<" + inputToken["type"] + ">" == tmpAction["content"]) {  // identifer or constant
                    return tmpAction;
                } else if(inputToken["token"] == tmpAction["character"]) {  // need to be the same common symbol
                    return tmpAction;
                }
            }
        }
        return null;
    }

    parse(tokenStream:Array<any>):void {
        var symbolStack:Array<string> = [];
        var stateStack:Array<number> = [0];
        // parse token
        var analyzedTokenCount:number = 0;
        while(analyzedTokenCount < tokenStream.length) {
            var inputToken:object = tokenStream[analyzedTokenCount];
            var actionResult:any = this.queryAction(stateStack[stateStack.length - 1], inputToken);
            if(actionResult == null) {  // empty result, error
                console.log("error occured");
                // TODO: debug info
                return;
            } else if(actionResult["content-type"] == "S") {
                // TODO
            } else if(actionResult["content-type"] == "r") {

            } else if(actionResult["content-type"] == "acc") {

            } else {
                console.log("content-type error");  // this should not happen
            }
            analyzedTokenCount++;
        }
        console.log("parsing ends");
    }
}

module.exports = {
    CodeParser:CodeParser
}