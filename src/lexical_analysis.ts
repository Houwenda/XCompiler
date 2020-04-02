import { match } from "assert";

var fs = require("fs");

// get index of required NFANode
function findState(arrayList:Array<any>, indexStart:number, state:string ):number {
    if(state == "END_NODE") {  // the end node
        return 1;
    }
    // search from the indexStart, because stateName could deplicate
    for(var i = indexStart; i < arrayList.length; i++) {
        var node:NFANode = arrayList[i];
        if(node.stateName == state) {
            return i;
        }
    }
    return -1;
}

// get all characters in the given NFANode array
function getCharset(typeNFA:Array<NFANode>):Set<string> {
    var charset:Set<string> = new Set();
    // form character set of NFA
    for(var i in typeNFA) {
        var node:NFANode = typeNFA[i];
        for(var j in node.nextState) {
            var char = node.nextState[j]["character"];
            if(char.length == 1) {  // single character
                charset.add(char);
            } else {  // handle aliases
                switch(char) {
                    case "digit" :
                        for(var tmp = 0; tmp < 10; tmp++) {
                            charset.add(tmp.toString());
                        }
                        break;
                    case "empty" :
                        break;
                    case "letter" :  // add all letters
                        for(var tmp = 0; tmp < 26; tmp++) {
                            charset.add(String.fromCharCode(tmp + 65));
                            charset.add(String.fromCharCode(tmp + 65).toLowerCase());
                        }
                        break;
                    case "dot":  // add all character except CR & LF
                        for(var tmp=0; tmp < 128; tmp++) {
                            if (tmp != 13 && tmp != 10) {  // \r \n
                                charset.add(String.fromCharCode(tmp));
                            }
                        }
                        break;
                    default :
                        console.error("unkown character alias:", char);
                }
            }
        }
    }
    return charset;
}

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

    // empty-closure of given index nodes 
    // can handle closed loop, e.g. A-empty->B, B-empty->A, result is [A,B]
    emptyClosure(type:string, indexes:Array<number>):Array<number> {
        var result:Array<number> = indexes;
        for(var i in indexes) {
            var index:number = indexes[i];
            var node:NFANode = this.NFA[type][index];
            for(var j in node.nextState) {
                if(node.nextState[j]["character"] == "empty" && 
                indexes.indexOf(node.index) == -1) {  // remove duplicated index
                    result.push(node.index);
                    result = this.emptyClosure(type, result);  // recursive searching
                }
            }
        }
        return result;
    }

    // move
    move(type:string, index:number, charset:Set<string>):void {
        var node:DFANode = this.DFA[type][index];
        for(var char of charset) {
            // TODO
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

            this.move(typeName, 0, charset);
            // TODO
        }

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
       
        // console.log("NFA:");
        // console.log(this.NFA);

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

class NFANode {
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

class DFANode {
    index:number;
    stateType:string = "";
    NFAIndex:Array<number> = [];
    nextState:Array<any> = [];

    constructor(ind:number, stateTy:string) {
        this.index = ind;
        this.stateType = stateTy;
    }
}

module.exports = {
    LexAnalyzer:LexAnalyzer
}
