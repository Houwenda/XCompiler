var LA = require("./lexical_analysis").LexAnalyzer;
const args:any = require("minimist")(process.argv.slice(2));

if (args.l != null && args.g == null) {  // lexical analysis
    if (args.p == null || args.c == null) {
        console.log("wrong args.\n  -p for production file.\n  -c for code file");
    } else {
        console.log("lexical analysis");
        var lexical_analysis = new LA();
        lexical_analysis.analysis(args.p, args.c);
    }
} else if (args.l == null && args.g != null) {  // grammatical analysis
    if (args.p == null || args.c == null) {
        console.log("wrong args.\n  -p for production file.\n  -c for code file");
    } else {
        console.log("grammatical analysis");;
    }
} else {
    console.log("wrong args.\n  -l for lexical analysis.\n  -g for grammatical analysis.");
}