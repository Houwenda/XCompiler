import { match } from "assert";

const fs = require("fs");
const LR1DFANode = require("./Node").LR1DFANode;

class SyntaxAnalyzer {
    promotedProductions:Array<any> = [];
    DFA:Array<any> = [];

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

    createDFA():void {
        // TODO: create DFA
        new LR1DFANode(0);
    }

    analyze(productionFile:string):void {
        this.promoteProductions(productionFile);
        console.log("promote productions");
        this.createDFA();
        console.log("production -> DFA");
        
    }
}

module.exports = {
    SyntaxAnalyzer:SyntaxAnalyzer
}