var fs = require("fs");

class LexAnalyzer {
    NFA:Array<LexNode> = [];
    DFA:Array<LexNode> = [];

    // read productions from file and create NFA
    production2NFA(productionFile:string):Array<LexNode> {
        var productions:any;
        try {
            productions = fs.readFileSync(productionFile);
        } catch(e) {
            console.log("production file read error");
            console.log(e);
        }
        productions = JSON.parse(productions);
        //console.log(productions);
    
        for (var i in productions) {
            console.log(productions[i]);
        }

        return [new LexNode()];
    }

    NFA2DFA():Array<LexNode> {

        return [new LexNode()];
    }
    
    analysis(productionFile:string, codeFile:string):void {
        this.NFA = this.production2NFA(productionFile);
        console.log("NFA:",this.NFA);
        this.DFA = this.NFA2DFA();
        console.log("DFA:", this.DFA);
    }
    
}
``
class LexNode {

}

module.exports = {
    LexAnalyzer:LexAnalyzer
}
