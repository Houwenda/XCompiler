import { match } from "assert";

const fs = require("fs");
const LR1DFANode = require("./Node").LR1DFANode;
const tokenType = require("./functions").tokenType;

class SyntaxAnalyzer {
    promotedProductions:Array<any> = [];
    FIRST:any = [];
    DFA:Array<any> = [];

    // read production file & promote productions
    promoteProductions(productionFile:string):void {
        var productionsConfig:any;
        try {
            productionsConfig = fs.readFileSync(productionFile);
        } catch(e) {
            console.log("production file read error");
            console.log(e);
        }
        productionsConfig = JSON.parse(productionsConfig);

        var promotedProductionsIndex = 1;
        this.promotedProductions.push({
            "index":0,
            "description":"S' starter",
            "left":"<S'>",
            "right":["<CODE>"]
        });
        for(var tmpProductionType of productionsConfig) {
            for(var j in tmpProductionType["contents"]) {

                // turn right side into list
                var tmp:Array<string> = tmpProductionType["contents"][j]["right"].split(" ");
                var rightTokenList:Array<string> = [];
                for(var i of tmp) {
                    if(i.length != 0) {  // remove empty string caused by invalid spaces
                        rightTokenList.push(i);
                    }
                }
                
                this.promotedProductions.push({
                    "index":promotedProductionsIndex,
                    "description":tmpProductionType["description"],
                    "left":tmpProductionType["contents"][j]["left"],
                    "right":rightTokenList
                });
                promotedProductionsIndex++;
            }
        }
        //console.log(this.promotedProductions)
    }

    // get FIRST set of given state
    firstVT(stateName:string):Set<string> {
        // already calculated
        if(this.FIRST[stateName] != null) {
            return this.FIRST[stateName];
        }

        // not calculated yet
        var result:Set<string> = new Set();
        for(var i:number = 0; i < this.promotedProductions.length; i++) {
            if(this.promotedProductions[i]["left"] == stateName) {  // left match
                if(tokenType(this.promotedProductions[i]["right"][0]) == "state" &&  // not final
                                    this.promotedProductions[i]["right"][0] != stateName) {  // handle self looping, e.g. <FUNCTION_BLOCK_CLOSURE>-><FUNCTION_BLOCK_CLOSURE>
                    // search recursively
                    var tmpResult:Set<string> = this.firstVT(this.promotedProductions[i]["right"][0]);
                    for(var tmp of tmpResult) {
                        result.add(tmp);
                    }
                } else {  // common or alias, final
                    result.add(this.promotedProductions[i]["right"][0]);
                }
            }
        }
        return result;
    }

    // create FIRST set of productions
    createFIRST():void {
        for(var production of this.promotedProductions) {
            for(var tmp of production["right"]) {
                if(tokenType(tmp) == "state" && this.FIRST.indexOf(tmp) == -1) {  // not final, remove duplicated
                    this.FIRST[tmp] = this.firstVT(tmp);
                }
            }
        }
    }

    closure(dfaNode:LR1DFANode):LR1DFANode {
        for(var i in dfaNode.productionIndex) {
            var productionIndex:number = dfaNode.productionIndex[i];
            var dotPosition = dfaNode.position[i];
            var productionRight = this.promotedProductions[productionIndex]["right"]
            if(dotPosition < productionRight.length &&  // still has token behind dot, e.g. S->.S, S->.Sa
                    tokenType(productionRight[dotPosition]) == "state") {  // not final
                
                // get search symbol by next token
                var searchSymbol:Set<string> = new Set();
                if(dotPosition < productionRight.length - 1) {  // has more than 1 token behind dot, e.g. S->.Sa, S->.SA
                    if(tokenType(productionRight[dotPosition + 1]) == "state") {  // not final
                        searchSymbol = this.firstVT(productionRight[dotPosition + 1]);
                    } else {  // "common" or "alias", final
                        searchSymbol.add(productionRight[dotPosition + 1]);
                    }
                }

                // find productions whose left side is productionRight[dotPosition] &
                // add them to dfaNode
                var addCount:number = 0;
                for(var k:number = 0; k < this.promotedProductions.length; k++) {
                    if(dfaNode.productionIndex.indexOf(k) == -1 &&  // remove deuplicated index
                    this.promotedProductions[k]["left"] == productionRight[dotPosition]) {  // left side  
                        dfaNode.productionIndex.push(k);
                        dfaNode.position.push(0);
                        var searchSymbolArray:Array<string> = [];
                        for(var tmpSymbol of searchSymbol) {
                            searchSymbolArray.push(tmpSymbol);
                        }
                        dfaNode.searchSymbol.push(searchSymbolArray);
                        addCount++;
                    }
                }
                if(addCount > 0) {  // new production added, need to search recursively
                    dfaNode = this.closure(dfaNode);
                    //console.log("TODO: move closure debugging");
                }
            }
        }
        return dfaNode;
    }

    move(dfaNodeIndex:number):void {
        var dfaNode:LR1DFANode = this.DFA[dfaNodeIndex];
        for(var i:number = 0; i < dfaNode.productionIndex.length; i++) {
            var productionIndex:number = dfaNode.productionIndex[i];
            var productionRight:Array<string> = this.promotedProductions[productionIndex]["right"];
            var dotPosition:number = dfaNode.position[i];
            if(dotPosition < productionRight.length) {  // still has word behind dot
                
                // handle token when first meeting it
                // if appeared before, ignore it
                // when it first appears, add all productions to new node
                //
                // e.g. A->Bc (handle all productions immediately), A->Bd (ignore), A->Be (ignore)
                // use move-in token "B" to handle these three productions when looping through the node
                var moveInTokens:Array<string> = [];
                // get all move-in token of the DFA node, "" if unable to move
                for(var j = 0; j < dfaNode.productionIndex.length; j++) {
                    var tmpProductionIndex:number = dfaNode.productionIndex[j];
                    var tmpProductionRight:Array<string> = this.promotedProductions[tmpProductionIndex]["right"];
                    var tmpDotPosition:number = dfaNode.position[j];
                    if(tmpDotPosition < tmpProductionRight.length) {
                        moveInTokens.push(tmpProductionRight[tmpDotPosition]);
                    } else {
                        moveInTokens.push("");
                    }
                }
                //console.log("moveInTokens:", moveInTokens);

                if(moveInTokens.indexOf(productionRight[dotPosition]) == i) {  // move-in token first appears
                    // create new DFA node (& add to this.DFA)
                    var newNodeIndex:number = this.DFA.length;
                    var newNode:LR1DFANode = new LR1DFANode(newNodeIndex);
                    
                    // add productions 
                    for(var j = i; j < dfaNode.productionIndex.length; j++) {
                        // handle productions that share the same move-in token
                        if(productionRight[dotPosition] == moveInTokens[j]) {
                            newNode.productionIndex.push(dfaNode.productionIndex[j]);
                            newNode.position.push(dfaNode.position[j] + 1);
                            newNode.searchSymbol.push(dfaNode.searchSymbol[j]);
                        }
                    }
                    newNode = this.closure(newNode);

                    // add link (& node)
                    // check if node already exists in this.DFA
                    var findIndex:number = -1;
                    for(var j:number = 0; j < this.DFA.length; j++) {
                        var tmpNode:any = this.DFA[j];
                        // have same number of productions
                        if(tmpNode.productionIndex.length == newNode.productionIndex.length) {
                            // check each production & search symbol & position
                            var isMatched:boolean = true;
                            for(var k:number = 0; k < tmpNode.productionIndex.length; k++) {
                                var tmpIndex = newNode.productionIndex.indexOf(tmpNode.productionIndex[k]);
                                if(tmpIndex == -1) {  // productions do not match
                                    isMatched = false;
                                    break;
                                } else if(newNode.position[tmpIndex] != tmpNode.position[k] ||  // can find the production, but positions do not match
                                        newNode.searchSymbol[tmpIndex] != tmpNode.searchSymbol[k]) {  // searchSymbols do not match
                                    isMatched = false;
                                    break;      
                                }
                            }
                            if(isMatched) {  // already in DFA list
                                findIndex = j;
                                break;
                            }
                        }

                        // var tmp = this.DFA[j];
                        // if(tmp.productionIndex.sort().toString() == newNode.productionIndex.sort().toString() && 
                        //         tmp.position.sort().toString() == newNode.position.sort().toString() && 
                        //         tmp.searchSymbol.sort().toString() == newNode.searchSymbol.sort().toString()) {
                        //     findIndex = j;  // already in DFA list
                        //     break;
                        // }
                    }
                    if(findIndex == -1) {  // need to add new node
                        // add node
                        this.DFA.push(newNode);
                        // add to nextState
                        this.DFA[dfaNodeIndex].nextState.push({
                            "character": productionRight[dotPosition],
                            "index": newNodeIndex
                        });
                        // move recursively
                        this.move(newNodeIndex);
                    } else {  // already in DFA list
                        this.DFA[dfaNodeIndex].nextState.push({
                            "character": productionRight[dotPosition],
                            "index": findIndex
                        });
                        console.log("already in DFA list:", findIndex)//
                    }

                } else {  // handled before, ignore
                    //console.log("ignore")
                }

            }
        }

    }

    createDFA():void {
        // create first DFA node
        var dfaNode = new LR1DFANode(0);
        dfaNode.productionIndex.push(0);
        dfaNode.position.push(0);
        dfaNode.searchSymbol.push(new Set());
        dfaNode = this.closure(dfaNode);
        this.DFA.push(dfaNode);
        
        // start moving
        this.move(0);
    }

    analyze(productionFile:string):void {
        console.log("promote productions");
        this.promoteProductions(productionFile);
        //console.log(this.promotedProductions)//
        for(var i in this.promotedProductions) {
            var rightString:string = "";
            for(var j in this.promotedProductions[i]["right"]) {
                rightString += this.promotedProductions[i]["right"][j] + " ";
            }
            console.log("(" + i + ") " + this.promotedProductions[i]["left"] + " -> " + rightString);
        }

        console.log("create FIRST set");
        this.createFIRST();
        console.log(this.FIRST)//

        console.log("production -> DFA");
        this.createDFA();
        //console.log(this.DFA)//
        for(var i in this.DFA) {
            console.log("DFA index:", this.DFA[i].index);
            for(var j in this.DFA[i].productionIndex) {
                console.log("production index:", this.DFA[i].productionIndex[j]);
                console.log("   position", this.DFA[i].position[j]);
                console.log("   search symbol:", this.DFA[i].searchSymbol[j]);
            }
            console.log("next states:", this.DFA[i].nextState);
            console.log();
        }
        
        
    }
}

module.exports = {
    SyntaxAnalyzer:SyntaxAnalyzer
}