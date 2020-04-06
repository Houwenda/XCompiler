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
    NFANode:NFANode,
    DFANode:DFANode
}