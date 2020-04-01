import { match } from "assert";

var fs = require("fs");

function findState(arrayList:Array<any>, indexStart:number, state:string ):number {
    if(state == "END_NODE") {  // the end node
        return 1;
    }
    for(var i = indexStart; i < arrayList.length; i++) {
        var node:LexNode = arrayList[i];
        if(node.stateName == state) {
            return i;
        }
    }
    return -1;
}

class LexAnalyzer {
    NFA:any = {};
    DFA:any = {};

    production2NFA(contents:any):Array<LexNode> {
        var result:Array<LexNode> = [new LexNode(0, "start", "A"), new LexNode(1, "end", "END_NODE")];

        for (var i in contents) {
            var content:any = contents[i];
            // console.log("content: ",content);

            var indexStart:number = result.length;  // nodes of this content starts at indexStart in the result array
            var description:string = content.description;
            var localStartState = content.production[0].substring(0,content.production[0].indexOf("->"));

            for (var j = 0; j< content.production.length; j++) {
                var production = content.production[j];
                var arrowIndex:number = production.indexOf("->");
                var leftState:string = production.substring(0,arrowIndex);
                var right:string = production.substring(arrowIndex+2);
                var rightState:any;

                var matchResult:any = right.match("<(.+|\n)>");
                var char:string;
                if (matchResult == null) {  // no char needed, e.g. "A->B", "A->C"
                    char = "empty";
                    rightState = right;
                } else { // char needed, e.g. "A-><digit>B", "A-><a>", "A-><empty>"
                    char = matchResult[0].substring(1,matchResult[0].length - 1);
                    if (matchResult[0].length == right.length) {  // end of productions, e.g. "A-><a>"
                        rightState = "END_NODE";
                    } else {  // not the end, e.g. "A-><a>B"
                        rightState = right.substring(matchResult[0].length);
                    }
                }

                // console.log(production, leftState, char, rightState);

                /*
                * The `left` state of a production should always appeared
                * in earlier productions unless it is the entrance state.
                * If the `right` state of a production hasn't appear before,
                * We need to add it to the result list.
                */
                // handle right state
                var rightStateIndex:number = findState(result, indexStart, rightState);
                // add new node if needed
                if(rightStateIndex == -1 && rightState != localStartState) {  
                    var rightStateIndex = result.length;
                    var newNode:LexNode = new LexNode(rightStateIndex, description, rightState);
                    result.push(newNode);
                } 
                // add relation
                var leftStateIndex:number;
                if(leftState == localStartState) {  // `left` state is local start state
                    leftStateIndex = 0;    
                } else {  // `left` state is not local start state
                    leftStateIndex = findState(result, indexStart, leftState);
                }
                result[leftStateIndex].nextState.push({
                    "character":char,
                    "index":rightStateIndex
                });

            }
        }
        return result;
    }

    // read configuration from file and create NFA
    createNFA(productionFile:string):void {
        var productionsConfig:any;
        try {
            productionsConfig = fs.readFileSync(productionFile);
        } catch(e) {
            console.log("production file read error");
            console.log(e);
        }
        productionsConfig = JSON.parse(productionsConfig);
        //console.log(productions);
    
        for (var i in productionsConfig) {
            var typeConfig = productionsConfig[i];
            //console.log(typeConfig);
            // if(<string>typeConfig["type"] == "identifier") {
            //     this.NFA[typeConfig["type"]] = this.production2NFA(typeConfig["contents"]);
            // }
            this.NFA[typeConfig["type"]] = this.production2NFA(typeConfig["contents"]);
        }


        // TODO
    }

    NFA2DFA():void {
        // TODO
    }

    parseCode(codeFile:string):void {
        var codes:any;
        try {
            codes = fs.readFileSync(codeFile);
        } catch(e) {
            console.log("code file read error");
            console.log(e);
        }

        //console.log(codes);
        // TODO
    }
    
    analyze(productionFile:string, codeFile:string):void {
        this.createNFA(productionFile);
       
        console.log("NFA:");
        console.log(this.NFA);
        // for (var i in this.NFA["identifier"]) {
        //     console.log(this.NFA["identifier"][i])
        // }
        // console.log(this.NFA["operator"]); PASS
        // console.log(this.NFA["keyword"]); PASS
        // console.log(this.NFA["delimiter"]); PASS
        // console.log(this.NFA["constant"]); PASS
        // console.log(this.NFA["identifier"]); PASS

        this.NFA2DFA();
        //console.log("DFA:", this.DFA);
        this.parseCode(codeFile);
    }
    
}

class LexNode {
    // TODO
    index:number;
    description:string = "";
    stateName:string = "";
    nextState:Array<any> = [];

    constructor(ind:number, desc:string, state:string){
    this.index = ind;
    this.description = desc;
    this.stateName = state;
    }
}

module.exports = {
    LexAnalyzer:LexAnalyzer
}
