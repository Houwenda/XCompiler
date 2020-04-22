function tokenType(token:string):string {
    if(token[0] == "<" && token[token.length - 1] == ">") {
        if(token == "<constant>" || token == "<identifier>" || token == "<empty>") {
            return "alias";  // type or alias, final
        } else {
            return "state";  // not final
        }
    } else {
        return "common";  // common words, final
    }
}

module.exports = {
    tokenType:tokenType
}