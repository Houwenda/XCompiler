class LR1DFANode {
    index: number;
    productionIndex: Array<number> = [];
    position: Array<number> = [];  // position of dot, starts at 0, ends at production["right"].length
    searchSymbol: Array<Array<string>> = [];  // search symbol, empty Set by default
    nextState: Array<any> = [];

    constructor(ind: number) {
        this.index = ind;
    }
}

module.exports = {
    LR1DFANode: LR1DFANode
}