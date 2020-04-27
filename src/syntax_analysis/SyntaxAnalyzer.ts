import { match, deepEqual } from "assert";

const fs = require("fs");
const LR1DFANode = require("./Node").LR1DFANode;
const tokenType = require("./functions").tokenType;
const compareNode = require("./functions").compareNode;

class SyntaxAnalyzer {
    promotedProductions: Array<any> = [];
    FIRST: any = [];
    DFA: Array<any> = [];
    analyzedDFANodeCount = 0;
    ACTION: Array<any> = [];
    GOTO: Array<any> = [];

    // read production file & promote productions
    promoteProductions(productionFile: string): void {
        var productionsConfig: any;
        try {
            productionsConfig = fs.readFileSync(productionFile);
        } catch (e) {
            console.log("production file read error");
            console.log(e);
        }
        productionsConfig = JSON.parse(productionsConfig);

        var promotedProductionsIndex = 1;
        this.promotedProductions.push({
            "index": 0,
            "description": "S' starter",
            "left": "<S'>",
            "right": ["<CODE>"]
        });
        for (var tmpProductionType of productionsConfig) {
            for (var j in tmpProductionType["contents"]) {

                // turn right side into list
                var tmp: Array<string> = tmpProductionType["contents"][j]["right"].split(" ");
                var rightTokenList: Array<string> = [];
                for (var i of tmp) {
                    if (i.length != 0 &&  // remove empty string caused by invalid spaces
                        i != "<empty>") {  // remove <empty>
                        rightTokenList.push(i);
                    }
                }

                this.promotedProductions.push({
                    "index": promotedProductionsIndex,
                    "description": tmpProductionType["description"],
                    "left": tmpProductionType["contents"][j]["left"],
                    "right": rightTokenList
                });
                promotedProductionsIndex++;
            }
        }
        //console.log(this.promotedProductions)
    }

    // get FIRST set of given state
    firstVT(stateName: string, searchState: Array<string>): Set<string> {
        //console.log("creating FIRST of", stateName)//
        // already calculated
        if (this.FIRST[stateName] != null) {
            return this.FIRST[stateName];
        }

        if (tokenType(stateName) != "state") {  // not state, but common tokens
            return new Set(stateName);
        }

        // not calculated yet
        var result: Set<string> = new Set();
        for (var i: number = 0; i < this.promotedProductions.length; i++) {
            if (this.promotedProductions[i]["left"] == stateName) {  // left match
                if (tokenType(this.promotedProductions[i]["right"][0]) == "state" &&  // not final
                    this.promotedProductions[i]["right"][0] != stateName &&  // handle self looping, e.g. <FUNCTION_BLOCK_CLOSURE>-><FUNCTION_BLOCK_CLOSURE>
                    searchState.indexOf(this.promotedProductions[i]["right"][0]) == -1) {  // handle closed loop
                    // search recursively
                    searchState.push(this.promotedProductions[i]["right"][0]);
                    var tmpResult: Set<string> = this.firstVT(this.promotedProductions[i]["right"][0], searchState);
                    for (var tmp of tmpResult) {
                        result.add(tmp);
                    }
                } else {  // common or alias, final
                    if (this.promotedProductions[i]["right"].length > 0) {  // <empty> removed, right side can be empty
                        result.add(this.promotedProductions[i]["right"][0]);
                    } else {
                        result.add("<HASH>");  // if right side is empty, <empty> belongs to FIRST set
                    }

                }
            }
        }
        return result;
    }

    createFIRST1(): void {
        for (var production of this.promotedProductions) {  // initialize
            this.FIRST[production["left"]] = [];
        }
        var canExpand: boolean = true;
        //console.log(this.FIRST)//
        while (canExpand) {
            //console.log(this.FIRST);
            canExpand = false;
            for (var production of this.promotedProductions) {
                if (production["right"].length != 0) {  // not -><empty>
                    if (tokenType(production["right"][0]) == "state") {  // not final
                        //handle self looping, e.g. <FUNCTION_BLOCK_CLOSURE>-><FUNCTION_BLOCK_CLOSURE>
                        if (production["right"][0] == production["left"]) {
                            continue;
                        }
                        for (var i: number = 0; i < production["right"].length; i++) {  // handle states that can lead to empty
                            if (tokenType(production["right"][i]) == "state") {  // not final
                                // [] if not calculated, ["<HASH>", ...] if leads to <empty>
                                if (this.FIRST[production["right"][i]].length != 0) {
                                    for (var tmpSearchSymbol of this.FIRST[production["right"][i]]) {
                                        if (tmpSearchSymbol != "<HASH>" &&   // ignore <empty>, continue adding
                                            this.FIRST[production["left"]].indexOf(tmpSearchSymbol) == -1) {
                                            this.FIRST[production["left"]].push(tmpSearchSymbol);
                                            canExpand = true;
                                        }
                                    }
                                    // cannot lead to <empty>, no need to continue
                                    if (this.FIRST[production["right"][i]].indexOf("<HASH>") == -1) {
                                        break;
                                    }
                                } else {  // not calculated yet, calculate next round
                                    break;
                                }
                            } else if (this.FIRST[production["left"]].indexOf(production["right"][i]) == -1) {  // final
                                this.FIRST[production["left"]].push(production["right"][i]);
                                canExpand = true;
                                break;
                            }
                        }
                    } else {  // common or alias, final
                        if (this.FIRST[production["left"]].indexOf(production["right"][0]) == -1) {
                            this.FIRST[production["left"]].push(production["right"][0]);
                            canExpand = true;
                        }
                    }
                } else {  // -><empty> has been changed to ->
                    if (this.FIRST[production["left"]].indexOf("<HASH>") == -1) {
                        this.FIRST[production["left"]].push("<HASH>");
                        canExpand = true;
                    }
                }
            }
        }
    }


    // create FIRST set of productions
    createFIRST(): void {
        for (var production of this.promotedProductions) {
            for (var tmp of production["right"]) {
                if (tokenType(tmp) == "state" && this.FIRST.indexOf(tmp) == -1) {  // not final, remove duplicated
                    this.FIRST[tmp] = this.firstVT(tmp, []);
                }
            }
        }
    }

    closure(dfaNode: LR1DFANode): LR1DFANode {
        var analyzedProductionCount = 0;
        while (analyzedProductionCount < dfaNode.productionIndex.length) {
            var productionIndex: number = dfaNode.productionIndex[analyzedProductionCount];
            var productionRight = this.promotedProductions[productionIndex]["right"];
            var dotPosition: number = dfaNode.position[analyzedProductionCount];
            if (dotPosition < productionRight.length &&  // still has token behind dot, e.g. S->.S, S->.Sa
                tokenType(productionRight[dotPosition]) == "state") {  // not final
                // handle search symbol
                var searchSymbol: Set<string> = new Set();
                var searchIndex: number = 1;
                var canEmptyCount: number = 0;
                while (dotPosition + searchIndex < productionRight.length) {
                    if (tokenType(productionRight[dotPosition + searchIndex]) == "state") {  // not final
                        var canEmpty: boolean = false;
                        for (var tmpState of this.FIRST[productionRight[dotPosition + searchIndex]]) {
                            if (tmpState != "<HASH>") {
                                searchSymbol.add(tmpState);
                            } else {
                                canEmpty = true;
                                canEmptyCount++;
                            }
                        }
                        if (!canEmpty) {  // this state cannot lead to <empty>, no need to continue searching
                            break;
                        }
                    } else {  // final
                        // no need to continue searching
                        searchSymbol.add(productionRight[dotPosition + searchIndex]);
                        break;
                    }
                    searchIndex++;
                }
                // all states behind <dot> can lead to <empty> or
                // has only 1 token behind <dot>
                if (canEmptyCount + 1 == productionRight.length - dotPosition) {
                    // add search symbols of current node production
                    for (var tmp of dfaNode.searchSymbol[analyzedProductionCount]) {
                        searchSymbol.add(tmp);
                    }
                }
                // if (dotPosition < productionRight.length - 1) {  // has more than 1 token behind dot, e.g. S->.Sa, S->.SA
                //     if (tokenType(productionRight[dotPosition + 1]) == "state") {  // not final
                //         var searchIndex: number = 1;
                //         while (searchSymbol.size == 0 && dotPosition + searchIndex < productionRight.length) {
                //             searchSymbol = this.firstVT(productionRight[dotPosition + searchIndex], []);
                //             searchIndex++;
                //         }
                //         if (searchSymbol.size == 0) {  // all tokens lead to empty, add front-search symbol
                //             searchSymbol = new Set(dfaNode.searchSymbol[analyzedProductionCount]);
                //         }
                //     } else {  // common or alias, final
                //         searchSymbol.add(productionRight[dotPosition + 1]);
                //     }
                // } else {  // has only 1 token behind dot, e.g. S->S.a, S->S.A
                //     searchSymbol = new Set(dfaNode.searchSymbol[analyzedProductionCount]);  // add front-search symbol
                // }

                // if(dfaNode.index == 9) {  // debug
                //     console.log("!!! creating search symbol for dfa 9:", this.promotedProductions[productionIndex], dotPosition, searchSymbol);
                // }

                // handle closure productions and positions
                for (var i: number = 0; i < this.promotedProductions.length; i++) {
                    if (//dfaNode.productionIndex.indexOf(i) == -1 &&  // remove deuplicated index
                        this.promotedProductions[i]["left"] == productionRight[dotPosition]) {  // left side match
                        // combine multiple search symbols into former newNode production, e.g. S->a.B,a S->a.B,b => S->a.B, a/b
                        var canCombine: boolean = false;
                        for (var k: number = 0; k < dfaNode.productionIndex.length; k++) {
                            if (dfaNode.productionIndex[k] == i && dfaNode.position[k] == 0) {  // same production, same position
                                canCombine = true;
                                for (var tmpSymbol of searchSymbol) {
                                    if (dfaNode.searchSymbol[k].indexOf(tmpSymbol) == -1) {  // remove duplicate
                                        dfaNode.searchSymbol[k].push(tmpSymbol);
                                    }
                                }

                                // if(dfaNode.index == 9) {  //debug
                                //     console.log("!!! combine searchSymbol:", dfaNode.searchSymbol[k]);
                                // }

                                break;
                            }
                        }
                        if (!canCombine) {  // add new production
                            dfaNode.productionIndex.push(i);
                            dfaNode.position.push(0);
                            var searchSymbolArray: Array<string> = [];
                            for (var tmpSymbol of searchSymbol) {
                                searchSymbolArray.push(tmpSymbol);
                            }
                            dfaNode.searchSymbol.push(searchSymbolArray);

                            // if(dfaNode.index == 9) {  //debug
                            //     console.log("!!! create new production:", this.promotedProductions[i], searchSymbolArray);
                            // }
                        }

                    }
                }
            }

            if (dfaNode.index == 9) {  // debug
                console.log("!!!", dfaNode.productionIndex[analyzedProductionCount]);
                for (var j in dfaNode.productionIndex) {
                    var tmpProduction = this.promotedProductions[dfaNode.productionIndex[j]];
                    var rightString: string = "";
                    for (var tmpNum:number = 0; tmpNum < tmpProduction["right"].length; tmpNum++) {
                        if (tmpNum == dfaNode.position[j]) {
                            rightString += "<DOT> "
                        }
                        rightString += tmpProduction["right"][tmpNum] + " ";
                    }
                    console.log("production: (" + dfaNode.productionIndex[j] + ") " + tmpProduction["left"] + " -> " + rightString + ",", dfaNode.searchSymbol[j])
                }
            }
            


            analyzedProductionCount++;
        }

        return dfaNode;
    }

    move(): void {
        while (this.analyzedDFANodeCount < this.DFA.length) {
            var dfaNodeIndex: number = this.analyzedDFANodeCount;
            var dfaNode: LR1DFANode = this.DFA[dfaNodeIndex];
            for (var i: number = 0; i < dfaNode.productionIndex.length; i++) {
                var productionIndex: number = dfaNode.productionIndex[i];
                var productionRight: Array<string> = this.promotedProductions[productionIndex]["right"];
                var dotPosition: number = dfaNode.position[i];
                if (dotPosition < productionRight.length) {  // still has word behind dot
                    // handle move-in token when first meeting it
                    // if appeared before, ignore it
                    // when it first appears, add all productions to new node
                    //
                    // e.g. A->Bc (handle all productions immediately), A->Bd (ignore), A->Be (ignore)
                    // use move-in token "B" to handle these three productions when looping through the node
                    var moveInTokens: Array<string> = [];
                    // get all move-in token of the DFA node, "" if unable to move
                    for (var j = 0; j < dfaNode.productionIndex.length; j++) {
                        var tmpProductionIndex: number = dfaNode.productionIndex[j];
                        var tmpProductionRight: Array<string> = this.promotedProductions[tmpProductionIndex]["right"];
                        var tmpDotPosition: number = dfaNode.position[j];
                        if (tmpDotPosition < tmpProductionRight.length) {
                            moveInTokens.push(tmpProductionRight[tmpDotPosition]);
                        } else {
                            moveInTokens.push("");
                        }
                    }

                    if (moveInTokens.indexOf(productionRight[dotPosition]) == i) {  // move-in token first appears
                        // create new DFA node (& add to this.DFA)
                        var newNodeIndex: number = this.DFA.length;
                        var newNode: LR1DFANode = new LR1DFANode(newNodeIndex);

                        // add productions 
                        for (var j = i; j < dfaNode.productionIndex.length; j++) {
                            // handle productions that share the same move-in token
                            if (productionRight[dotPosition] == moveInTokens[j]) { //&& newNode.productionIndex.indexOf(j) == -1) {  // remove duplicated
                                // combine multiple search symbols into former newNode production, e.g. S->a.B,a S->a.B,b => S->a.B, a/b
                                var canCombine = false;
                                for (var k = 0; k < newNode.productionIndex.length; k++) {
                                    if (newNode.productionIndex[k] == dfaNode.productionIndex[j] &&
                                        newNode.position[k] == dfaNode.position[j] + 1) {
                                        // add to search symbol array
                                        for (var tmpSearchSymbol of dfaNode.searchSymbol[j]) {
                                            if (newNode.searchSymbol[k].indexOf(tmpSearchSymbol) == -1) {  // remove duplicate
                                                newNode.searchSymbol[k].push(tmpSearchSymbol);
                                            }
                                        }
                                        canCombine = true;
                                        //console.log("combine search symbols:", newNode.productionIndex[k], newNode.position[k])//
                                        break;
                                    }
                                }
                                if (!canCombine) {  // add new production
                                    //console.log("add production:", dfaNode.productionIndex[j], dfaNode.position[j] + 1)//
                                    newNode.productionIndex.push(dfaNode.productionIndex[j]);
                                    newNode.position.push(dfaNode.position[j] + 1);
                                    newNode.searchSymbol.push(dfaNode.searchSymbol[j]);
                                }
                            }
                        }

                        //newNode = this.closure(newNode, 0);
                        newNode = this.closure(newNode);

                        // add link (& node)
                        // check if node already exists in this.DFA
                        var findIndex: number = -1;
                        for (var j: number = 0; j < this.DFA.length; j++) {
                            if (compareNode(newNode, this.DFA[j])) {  // same node
                                findIndex = j;
                                break;
                            }
                        }

                        if (findIndex == -1) {  // need to add new node
                            // add node
                            this.DFA.push(newNode);
                            // add to nextState
                            this.DFA[dfaNodeIndex].nextState.push({
                                "character": productionRight[dotPosition],
                                "index": newNodeIndex
                            });

                        } else {  // already in DFA list
                            this.DFA[dfaNodeIndex].nextState.push({
                                "character": productionRight[dotPosition],
                                "index": findIndex
                            });
                            //console.log("already in DFA list:", findIndex)//
                        }
                    } else {  // move-in token has appeared before
                        //console.log("appeard before, ignored")//
                    }
                }
            }

            this.analyzedDFANodeCount++;
            //console.log("analyzedDFANodeCount:", this.analyzedDFANodeCount, "this.DFA.length:", this.DFA.length)//
        }
    }

    createDFA(): void {
        // create first DFA node
        var dfaNode = new LR1DFANode(0);
        dfaNode.productionIndex.push(0);
        dfaNode.position.push(0);
        dfaNode.searchSymbol.push(["<HASH>"]);
        // dfaNode = this.closure(dfaNode, 0);
        dfaNode = this.closure(dfaNode);
        this.DFA.push(dfaNode);

        // start moving
        this.move();
    }

    // create ACTION table & GOTO table
    createTables(): void {
        for (var i: number = 0; i < this.DFA.length; i++) {
            var dfaNode: LR1DFANode = this.DFA[i];
            // create Si & GOTO by nextStates
            for (var nextState of dfaNode.nextState) {
                if (tokenType(nextState["character"]) == "state") {  // not final
                    // add to GOTO table
                    this.GOTO.push({
                        "index": i,
                        "state": nextState["character"],
                        "content": nextState["index"]
                    });
                } else {  // final
                    // add to ACTION table
                    this.ACTION.push({
                        "index": i,
                        "character": nextState["character"],
                        "content-type": "S",
                        "content": nextState["index"]
                    });
                }
            }

            // add ri & acc to ACTION using productions
            for (var j: number = 0; j < dfaNode.productionIndex.length; j++) {
                var productionIndex: number = dfaNode.productionIndex[j];
                var tmpProduction: any = this.promotedProductions[productionIndex];
                if (dfaNode.position[j] == tmpProduction["right"].length) {  // dot is at the end
                    // acc
                    if (tmpProduction["left"] == "<S'>" && tmpProduction["right"][0] == "<CODE>" &&
                        dfaNode.searchSymbol[j].length == 1 && dfaNode.searchSymbol[j][0] == "<HASH>") {
                        this.ACTION.push({
                            "index": i,
                            "character": "<HASH>",  // '<HASH>' for '#'
                            "content-type": "acc",
                            "content": "acc"
                        });
                    } else {  // ri
                        if (dfaNode.searchSymbol[j].length == 0) {  // empty search symbol list
                            this.ACTION.push({
                                "index": i,
                                "character": "<HASH>",  // '<HASH>' for '#'
                                "content-type": "r",
                                "content": productionIndex
                            });
                        } else {  // search symbol list not empty
                            for (var tmpSearchSymbol of dfaNode.searchSymbol[j]) {
                                this.ACTION.push({
                                    "index": i,
                                    "character": tmpSearchSymbol,
                                    "content-type": "r",
                                    "content": productionIndex
                                });
                            }
                        }
                    }

                }
            }
        }
    }

    analyze(productionFile: string): void {
        console.log("promote productions");
        this.promoteProductions(productionFile);
        //console.log(this.promotedProductions)//
        for (var i in this.promotedProductions) {
            var rightString: string = "";
            for (var j in this.promotedProductions[i]["right"]) {
                rightString += this.promotedProductions[i]["right"][j] + " ";
            }
            console.log("(" + i + ") " + this.promotedProductions[i]["left"] + " -> " + rightString);
        }

        console.log("create FIRST set");
        //this.createFIRST();
        this.createFIRST1();
        console.log(this.FIRST)//

        console.log("production -> DFA");
        this.createDFA();
        //console.log(this.DFA)//
        for (var i in this.DFA) {
            console.log("DFA index:", this.DFA[i].index);
            for (var j in this.DFA[i].productionIndex) {
                var tmpProduction = this.promotedProductions[this.DFA[i].productionIndex[j]];
                var rightString: string = "";
                for (var k in tmpProduction["right"]) {
                    if (k == this.DFA[i].position[j]) {
                        rightString += "<DOT> "
                    }
                    rightString += tmpProduction["right"][k] + " ";
                }
                console.log("production: (" + this.DFA[i].productionIndex[j] + ") " + tmpProduction["left"] + " -> " + rightString + ",", this.DFA[i].searchSymbol[j])

                // console.log("   production index:", this.DFA[i].productionIndex[j]);
                // console.log("   position", this.DFA[i].position[j]);
                // console.log("   search symbol:", this.DFA[i].searchSymbol[j]);
            }
            console.log("next states:", this.DFA[i].nextState);
            console.log();
        }

        console.log("DFA -> ACTION & GOTO table");
        this.createTables();
        console.log("ACTION table(" + this.ACTION.length + ")");
        for (var tmp of this.ACTION) {
            console.log("(" + tmp.index + ", " + tmp.character + ") : " + tmp["content-type"] + tmp.content);
        }
        console.log("GOTO table(" + this.GOTO.length + ")");
        for (var tmp of this.GOTO) {
            console.log("(" + tmp.index + ", " + tmp.state + ") : " + tmp.content);
        }

    }
}

module.exports = {
    SyntaxAnalyzer: SyntaxAnalyzer
}