var keywords:Array<string> = [
    "for","in","do","end","while","break",  // loop control
    "if","then","else","elseif",  // branch control
    "local",  // scope
    "true","false",  // boolean value
    "nil","number","function",  // basic data types
    "print","type","return"  // builtins
]

var operators:Array<string> = [
    "=","!","+","-","*","/","%","+=","-=","*=","/=","%=",  // number calculation
    "and","or","not",  // logical calculation
    "==","!=",">","<",">=","<=",  // comparation
]

var delimiters:Array<string> = ["{","}","[","]","(",")",","]

function format2string(list:Array<string>):void {
    var result:Array<any> = [];
    for (var i in list) {
        var content:string = list[i];
        result.push({
            "description":content,
            "string":content
        });
    }
    console.log(JSON.stringify(result));
}

function format2production(list:Array<string>):void {
    // TODO
}

format2string(delimiters);