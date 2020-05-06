# XCompiler

Course design of Compiler Theory, frontend of a general compiler. Lexical & syntax analysis tool implemented in Typescript.

## Installation

Install XCompiler with git & npm.

```
git clone https://github.com/Houwenda/XCompiler.git
cd XCompiler/src/
npm install
```

## Usage

### Input

productions file & code file.

Productions file contains the productions of the grammar, lexical analysis require type-3 grammar productions while syntax analysis require type-2 grammar productions.

Code file contains the code you want to parse.

### Output

Lexical analysis prints out the token stream of code file.

Syntax analysis tells whether the code file complies with the type-2 grammar.

### Lexical analysis

Using NFA & DFA method.

Args:
- -l lexical analysis
- -p productions file
- -c code files

example
```shell
tsc --build src/tsconfig.json
cd src/build
node index.js -l -p ../../examples/t3_grammar.json -c ../../examples/test1/code1.txt
```

### Syntax analysis

Using LR(1) method.

Args:
- -s syntax analysis
- --pl lexical productions file
- --ps syntax productions file
- -c code file

example
```shell
tsc --build src/tsconfig.json
cd src/build

# test1
node index.js -s --pl ../../examples/t3_grammar.json --ps ../../examples/test1/t2_grammar.json -c ../../examples/test1/code1.txt > debug.txt

# test2
node index.js -s --pl ../../examples/t3_grammar.json --ps ../../examples/test2/t2_lua.json -c ../../examples/test2/code_unit.txt > debug.txt

# test3
node index.js -s --pl ../../examples/t3_grammar.json --ps ../../examples/test2/t2_lua.json -c ../../examples/test2/code_complete.txt > debug.txt
```

debug
```shell
node index.js -s --pl ../../examples/t3_grammar.json --ps ../../examples/t2_debug.json -c ../../examples/code_debug.txt  > debug.txt
```