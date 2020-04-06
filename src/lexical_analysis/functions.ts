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

function unalias(aliasName:string):Set<string> {
    var result:Set<string> = new Set();
    switch (aliasName) {
        case "digit":
            for(var tmp = 0; tmp < 10; tmp++) {
                result.add(tmp.toString());
            }
            break;
        case "letter":
            for(var tmp = 0; tmp < 26; tmp++) {
                result.add(String.fromCharCode(tmp + 65));
                result.add(String.fromCharCode(tmp + 65).toLowerCase());
            }
            break;
        case "dot":
            for(var tmp=0; tmp < 128; tmp++) {
                if (tmp != 13 && tmp != 10 && tmp != 34) {  // \r \n "
                    result.add(String.fromCharCode(tmp));
                }
            }
            break;
        case "empty":
            break;
        default:
            console.error("unkown character alias:", aliasName);
    }
    return result;
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
                for (var tmp of unalias(char)) {
                    charset.add(tmp);
                }
            }
        }
    }
    return charset;
}

// remove spaces at the head of code string 
function removeHeadSpaces(codeString:string):string {
    var i:number;
    for(i = 0; i < codeString.length; i++) {
        if(codeString[i] != " ") {
            break;
        }
    }
    codeString = codeString.substr(i);
    return codeString;
}

module.exports = {
    findState:findState,
    unalias:unalias,
    getCharset:getCharset,
    removeHeadSpaces:removeHeadSpaces
}

