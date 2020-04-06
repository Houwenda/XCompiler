import { match } from "assert";

const fs = require("fs");
const NFANode = require("./Node").NFANode;
const DFANode = require("./Node").DFANode;
const findState = require("./functions").findState;
const unalias = require("./functions").unalias;
const getCharset = require("./functions").getCharset;

class LexAnalyzer {
    NFA:any = {};
    DFA:any = {};

    production2NFA(contents:any):Array<NFANode> {
        var result:Array<NFANode> = [new NFANode(0, "start", "A"), new NFANode(1, "end", "END_NODE")];

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
                    var newNode:NFANode = new NFANode(rightStateIndex, description, rightState);
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
    }

    // get empty closure states from an entry node recursively
    emptyNext(type:string, index:number):Array<number> {
        var result:Set<number> = new Set();
        var nfaNode:NFANode = this.NFA[type][index];
        for(var i in nfaNode.nextState) {
            if(nfaNode.nextState[i]["character"] == "empty") {
                result.add(nfaNode.nextState[i]["index"]);
                var nextResult:Array<number> = this.emptyNext(type, nfaNode.nextState[i]["index"]);  // recursive search
                for(var j in nextResult) {
                    result.add(nextResult[j]);
                }
            }
        }
        var resultArray:Array<number> = [];
        for(var tmp of result) {
            resultArray.push(tmp)
        }
        return resultArray;
    }

    // empty-closure of given index nodes 
    // can handle closed loop, e.g. A-empty->B, B-empty->A, result is [A,B]
    emptyClosure(type:string, indexes:Array<number>):Array<number> {
        var result:Array<number> = indexes;
        for(var i in indexes) {
            var index:number = indexes[i];
            var tmpResult:Array<number> = this.emptyNext(type, index);
            for(var tmp of tmpResult) {
                if(result.indexOf(tmp) == -1) {  // remove duplicate
                    result.push(tmp);
                }
            }
        }
        return result;
    }

    // move by given charset
    moveByCharset(type:string, index:number, charset:Set<string>):void {
        var dfaNode:DFANode = this.DFA[type][index];

        for (var char of charset) {
            // get nfa states that can be reached by given a character
            var moveNfaStates:Set<number> = new Set();
            for (var i in dfaNode.NFAIndex) {
                var nfaNode:NFANode = this.NFA[type][dfaNode.NFAIndex[i]];
                for(var j in nfaNode.nextState) {
                    var nfaNextState = nfaNode.nextState[j];
                    if(nfaNextState["character"].length == 1) {  // single character
                        if(nfaNextState["character"] == char) {
                            moveNfaStates.add(nfaNextState["index"]);
                        }
                    } else {  // aliases
                        var usableCharset = unalias(nfaNextState["character"]);
                        if(usableCharset.has(char)) {
                            moveNfaStates.add(nfaNextState["index"]);
                        }
                    }
                }
            }

            // whether to create new DFA node, or just add a link
            var moveStatesArray:Array<number> = [];  // set to array
            for(var tmpState of moveNfaStates) {
                moveStatesArray.push(tmpState);
            }
            moveStatesArray = this.emptyClosure(type, moveStatesArray);  // empty closure
            var isNew:boolean = true;
            for(var i in this.DFA[type]) {
                var tmpDfaNode:DFANode = this.DFA[type][i];
                if(tmpDfaNode.NFAIndex.sort().toString() == 
                        moveStatesArray.sort().toString()) {  // already have this DFA node
                    isNew = false;
                    // add link
                    this.DFA[type][index].nextState.push({
                        "character":char,
                        "index":i
                    });
                    break;
                }
            }
            if(isNew && moveStatesArray.length != 0) {  // need to create new DFA node & add link & recursively move()
                // add new node
                var newNodeIndex:number = this.DFA[type].length;
                if(moveStatesArray.indexOf(1) == -1) {  // does not contain END_NODE of NFA
                    var newNode:DFANode = new DFANode(newNodeIndex, "NORMAL");
                } else {  // contains END_NODE of NFA
                    var newNode:DFANode = new DFANode(newNodeIndex, "END_NODE");
                }
                newNode.NFAIndex = moveStatesArray;
                this.DFA[type].push(newNode);
                // add link
                this.DFA[type][index].nextState.push({
                    "character":char,
                    "index":newNodeIndex
                });
                this.moveByCharset(type, newNodeIndex, charset);  // recusive move
            }
        }
        
    }

    NFA2DFA():void {
        for(var typeName in this.NFA) {  // loop through all kinds of characters
            var typeNFA:Array<NFANode> = this.NFA[typeName];
            var charset:Set<string> =getCharset(typeNFA);
            //console.log(i, charset);
            this.DFA[typeName] = [];
            var startNode = new DFANode(0, "START_NODE");
            startNode.NFAIndex = this.emptyClosure(typeName, [0]);
            this.DFA[typeName].push(startNode);
            //console.log(typeName, startNode);
    
            this.moveByCharset(typeName, 0, charset);            
        }

    }
    
    analyze(productionFile:string, codeFile:string):void {
        this.createNFA(productionFile);
        console.log("production -> NFA");

        // console.log("NFA:");
        // console.log(this.NFA);

        // for (var i in this.NFA["constant"]) {
        //     console.log(this.NFA["constant"][i])
        // }
        // console.log(this.NFA["operator"]); PASS
        // console.log(this.NFA["keyword"]); PASS
        // console.log(this.NFA["delimiter"]); PASS
        // console.log(this.NFA["constant"]); PASS
        // console.log(this.NFA["identifier"]); PASS

        this.NFA2DFA();
        console.log("NFA -> DFA");
        // console.log("DFA:");
        //console.log(this.DFA);
        // for (var i in this.DFA["delimiter"]) {
        //     console.log(this.DFA["delimiter"][i])
        //     console.log(this.DFA["delimiter"][i].nextState.length)
        // }
        // console.log(this.DFA["identifier"]); PASS
        // console.log(this.DFA["operator"]); PASS
        // console.log(this.DFA["delimiter"]); PASS
        // console.log(this.DFA["keyword"]); PASS
        // console.log(this.DFA["constant"]); PASS

        console.log("analysis succeeds");
    }
}

module.exports = {
    LexAnalyzer:LexAnalyzer
}
