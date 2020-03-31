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
    NFA:Array<any> = [];
    DFA:Array<any> = [];

    production2NFA(contents:any):Array<LexNode> {
        console.log(contents);
        var result:Array<LexNode> = [new LexNode(0, "start", "A"), new LexNode(1, "end", "END_NODE")];

        for (var i in contents) {
            var content:any = contents[i];
            console.log("content: ",content);
            
            var indexStart:number = result.length;  // nodes of this content starts at indexStart in the result array
            var description:string = content.description;
            var localStartState = content.production[0].substring(0,content.production[0].indexOf("->"));

            for (var j = 0; j< content.production.length; j++) {
                var production = content.production[j];
                var arrowIndex:number = production.indexOf("->");
                var left:string = production.substring(0,arrowIndex);
                var right:string = production.substring(arrowIndex+2);
                var rightState:any;

                var matchResult:any = right.match("<.>");
                var char:string;
                if (matchResult == null) {  // no char needed, e.g. "A->B", "A->C"
                    char = "";
                    rightState = right;
                } else { // char needed, e.g. "A-><digit>B", "A-><a>", "A-><empty>"
                    char = matchResult[0].substr(1,1);
                    if (matchResult[0].length == right.length) {  // end of productions, e.g. "A-><a>"
                        rightState = "END_NODE";
                    } else {  // not the end, e.g. "A-><a>B"
                        rightState = right.substring(matchResult[0].length);
                    }
                }

                console.log(production, left, char, rightState);

                /*
                * The `left` state of a production should always appeared
                * in earlier productions unless it is the entrance state.
                * If the `right` state of a production hasn't appear before,
                * We need to add it to the result list.
                */
                // handle right state
                var rightStateIndex:number = findState(result, indexStart, rightState);
                if(rightStateIndex == -1 && rightState != localStartState) {  // add new node & relation
                    // add node
                    var rightStateIndex = result.length;
                    var newNode:LexNode = new LexNode(rightStateIndex, description, rightState);
                    result.push(newNode);
                    // add relation
                    if(left == localStartState) {  // `left` state is local start state
                        result[0].nextState.push({
                            "character":char,
                            "index":rightStateIndex
                        })
                    } else {  // `left` state is not local start state

                    }
                    // TODO
                } else {  // only need to add relation
                    // TODO
                }
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
            if(<string>typeConfig["type"] == "operator") {
                this.NFA[typeConfig["type"]] = this.production2NFA(typeConfig["contents"]);
            }
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
        console.log("NFA:",this.NFA);
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
