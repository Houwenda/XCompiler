class LR1DFANode {
    index:number;
    productionIndex:Array<number> = [];
    position:Array<number> = [];  // position of dot, starts at 0, ends at production["right"].length
    searchSymbol:Array<string> = [];  // search symbol, "<end>" by default

    constructor(ind:number) {
        this.index = ind;
    }
}

module.exports = {
    LR1DFANode:LR1DFANode
}