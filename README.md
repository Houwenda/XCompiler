# XCompiler

Course design of Compiler Theory.

## Usage

### Input

productions file & code file.

Productions file contains the productions of the grammar, lexical analysis require type-3 grammar productions while grammatical analysis require type-2 grammar productions.

Code file contains the code you want to parse.

### Output

Lexical analysis prints out the token stream of code file.

Grammatical analysis tells whether the code file complies with the type-2 grammar.

### Lexical analysis

Using NFA & DFA method.

Args
- -l lexical analysis
- -p productions file
- -c code files

example
```shell
tsc --build src/tsconfig.json
cd src/build
node index.js -l -p ../../examples/t3_grammar.json -c ../../examples/code.txt
```

### grammatical analysis

Using LR(1) method.

Args
- -g grammatical analysis
- -p productions file
- -c code file

example
```shell
node index.js -g -p ../../examples/t2_grammar.json -c ../../examples/code.txt
```