const args:any = require("minimist")(process.argv.slice(2));

if (args.l != null && args.s == null) {  // lexical analysis
    if (args.p == null || args.c == null) {
        console.log("wrong args.\n  -p for production file.\n  -c for code file");
    } else {
        console.log("lexical analysis starts");
        var LA = require("./lexical_analysis/LexAnalyzer").LexAnalyzer;
        var CP = require("./lexical_analysis/CodeParser").CodeParser;
        var lexicalAnalyzer = new LA();
        lexicalAnalyzer.analyze(args.p, args.c);
        console.log("code parsing starts")
        var codeParser  = new CP(lexicalAnalyzer.DFA);
        codeParser.parse(args.c);
    }
} else if (args.l == null && args.s != null) {  // syntax analysis
    if (args.p == null || args.c == null) {
        console.log("wrong args.\n  -p for production file.\n  -c for code file");
    } else {
        console.log("syntax analysis");;
    }
} else {
    console.log("wrong args.\n  -l for lexical analysis.\n  -g for syntax analysis.");
}