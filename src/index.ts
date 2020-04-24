const args:any = require("minimist")(process.argv.slice(2));

if (args.l != null && args.s == null) {  // lexical analysis
    if (args.p == null || args.c == null) {
        console.log("wrong args.\n  -p for production file.\n  -c for code file");
    } else {
        console.log("lexical analysis starts");
        console.log("########## lexical analysis #########");
        var LA = require("./lexical_analysis/LexAnalyzer").LexAnalyzer;
        var CP = require("./lexical_analysis/CodeParser").CodeParser;
        var lexicalAnalyzer = new LA();
        lexicalAnalyzer.analyze(args.p);
        console.log("code parsing starts");
        var codeParser  = new CP(lexicalAnalyzer.DFA);
        codeParser.parse(args.c);

        // output
        for(var i in codeParser.TokenStream) {
            console.log(codeParser.TokenStream[i]);
        }
    }
} else if (args.l == null && args.s != null) {  // syntax analysis
    if (args.pl == null || args.c == null || args.ps == null) {
        console.log("wrong args.\n  --pl for lexical production file.\n  --ps for syntax production file.\n  -c for code file");
    } else {
        console.log("syntax analysis starts");
        // lexical analysis
        console.log("########## lexical analysis #########");
        var LA = require("./lexical_analysis/LexAnalyzer").LexAnalyzer;
        var CP = require("./lexical_analysis/CodeParser").CodeParser;
        var lexicalAnalyzer = new LA();
        lexicalAnalyzer.analyze(args.pl);
        console.log("code parsing starts");
        var codeParser  = new CP(lexicalAnalyzer.DFA);
        codeParser.parse(args.c);
        // output
        // for(var i in codeParser.TokenStream) {
        //     console.log(codeParser.TokenStream[i]);
        // }

        // syntax analysis
        console.log("########## syntax analysis ##########")
        var SA = require("./syntax_analysis/SyntaxAnalyzer").SyntaxAnalyzer;
        var CP1 = require("./syntax_analysis/CodeParser").CodeParser;
        var syntaxAnalyzer = new SA();
        syntaxAnalyzer.analyze(args.ps);
        console.log("code parsing starts");
        var syntaxCodeParser  = new CP1(syntaxAnalyzer.ACTION, syntaxAnalyzer.GOTO);
        syntaxCodeParser.parse(codeParser.TokenStream);
    }
} else {
    console.log("wrong args.\n  -l for lexical analysis.\n  -s for syntax analysis.");
}