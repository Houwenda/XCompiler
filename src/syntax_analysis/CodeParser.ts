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

    parse(tokenStream:Array<any>):void {
        // parse token
        
        console.log("parsing ends");
    }
}

module.exports = {
    CodeParser:CodeParser
}