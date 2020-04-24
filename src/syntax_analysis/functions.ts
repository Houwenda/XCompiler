import { match, deepEqual } from "assert";
const LR1DFANode = require("./Node").LR1DFANode;
const deepEql = require("deep-eql");

function tokenType(token: string): string {
    if (token != null &&  // <empty> has been removed, so the given right token list can be empty
        token[0] == "<" && token[token.length - 1] == ">") {
        if (token == "<constant>" || token == "<identifier>" || token == "<empty>") {
            return "alias";  // type or alias, final
        } else {
            return "state";  // not final
        }
    } else {
        return "common";  // common words, final
    }
}

function compareNode(newNode: LR1DFANode, oldNode: LR1DFANode): boolean {
    if (newNode.productionIndex.length != oldNode.productionIndex.length) {
        return false;
    }
    var productionCombined: Array<any> = [];
    for (var i: number = 0; i < newNode.productionIndex.length; i++) {
        productionCombined.push({
            "productionIndex": newNode.productionIndex[i],
            "position": newNode.position[i],
            "searchSymbol": newNode.searchSymbol[i].sort()
        });
    }
    var result: boolean = true;
    for (var i: number = 0; i < oldNode.productionIndex.length; i++) {
        var tmpProductionCombined: object = {
            "productionIndex": oldNode.productionIndex[i],
            "position": oldNode.position[i],
            "searchSymbol": oldNode.searchSymbol[i].sort()
        }
        var found: boolean = false;
        for (var j: number = 0; j < productionCombined.length; j++) {
            // if(productionCombined[j] == tmpProductionCombined) {
            if (deepEql(productionCombined[j], tmpProductionCombined)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return false;
        }
    }

    //console.log(newNode, oldNode)//
    //console.log()//
    return result;
}
module.exports = {
    tokenType: tokenType,
    compareNode: compareNode
}