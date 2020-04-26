## t2_grammar.json

2型文法，用于语法分析。


### 表示

表示规则：
- <大写单词>表示中间状态
- <小写单词>表示此法分析类型或别名
- 其他为单词/符号
- 各项由空格隔开
- 入口标识为`<CODE>`

文法设计：
```
<代码入口> -> <函数定义>
<函数定义> -> function <标识符> ( <参数声明> ) 函数块 end
<参数声明> -> <声明> <声明闭包>
<参数声明> ->
<声明> -> <标识符>
<声明闭包> -> , <声明> <声明闭包>
<声明闭包> -> 
<函数块> -> <函数块闭包>
<函数块闭包> -> <声明> <函数块闭包> 
<函数块闭包> -> <赋值函数> <函数块闭包> 
<函数块闭包> -> <for循环> <函数块闭包> 
<函数块闭包> -> <while循环> <函数块闭包> 
<函数块闭包> -> <分支语句> <函数块闭包> 
<函数块闭包> -> <函数返回> <函数块闭包> 
<函数块闭包> -> 
<赋值函数> -> <标识符> <赋值或函数调用> 
<赋值或函数调用> -> = <右值> 
<赋值或函数调用> -> += <右值> 
<赋值或函数调用> -> -= <右值> 
<赋值或函数调用> -> *= <右值> 
<赋值或函数调用> -> /= <右值> 
<赋值或函数调用> -> %= <右值> 
<赋值或函数调用> -> = { <参数列表> }
<赋值或函数调用> -> = { }
<参数列表> -> <参数> <参数闭包>
<参数闭包> -> , <参数> <参数闭包>
<参数闭包> -> 
<参数> -> <标识符>
<参数> -> <常量>
<右值> -> <表达式>
<右值> -> - <表达式>
<右值> -> <多项数据>
<表达式> -> <因子> <项>
<因子> -> <因式> <因式递归>
<因式> -> ( <表达式> )
<因式> -> <标识符>
<因式> -> <常量>
<项> -> + <因子> <项>
<项> -> - <因子> <项>
<项> ->
<因式递归> -> * <因式> <因式递归>
<因式递归> -> / <因式> <因式递归>
<因式递归> ->
<多项数据> -> <常量> <常量闭包>
<常量闭包> -> , <常量> <常量闭包>
<常量闭包> -> 
<for循环> -> for <标识符> = <表达式> ， <表达式> ， <表达式> do <函数块> end
<while循环> -> while ( <逻辑表达式> ) do <函数块> end
<逻辑表达式> -> <表达式> <逻辑运算符> <表达式>
<逻辑表达式> -> ( <表达式> ) <逻辑运算符> ( <表达式> )
<逻辑表达式> -> ! ( <逻辑表达式> )
<逻辑运算符> -> and 
<逻辑运算符> -> or
<逻辑运算符> -> not
<逻辑运算符> -> ==
<逻辑运算符> -> !=
<逻辑运算符> -> >
<逻辑运算符> -> >=
<逻辑运算符> -> <
<逻辑运算符> -> <=
<分支语句> -> if ( <逻辑表达式> ) then <函数块><否则语句> end
<否则语句>-> elseif ( <逻辑表达式> ) then <函数块> <否则语句>
<否则语句> -> else <函数块>
<否则语句> ->
<函数返回> -> return <因式> 
```

拓广文法（自动拓广，`<empty>`已做删除处理）：
```
(0) <S'> -> <CODE> 
(1) <CODE> -> <FUNCTION_DEFINITION> 
(2) <FUNCTION_DEFINITION> -> function <identifier> ( <ARGS_STATEMENT> ) <FUNCTION_BLOCK> end 
(3) <ARGS_STATEMENT> -> <STATEMENT> <STATEMENT_CLOSURE> 
(4) <ARGS_STATEMENT> -> 
(5) <STATEMENT> -> <identifier> 
(6) <STATEMENT_CLOSURE> -> , <STATEMENT> <STATEMENT_CLOSURE> 
(7) <STATEMENT_CLOSURE> -> 
(8) <FUNCTION_BLOCK> -> <FUNCTION_BLOCK_CLOSURE> 
(9) <FUNCTION_BLOCK_CLOSURE> -> <STATEMENT> <FUNCTION_BLOCK_CLOSURE> 
(10) <FUNCTION_BLOCK_CLOSURE> -> <ASSIGNMENT_FUNCTION> <FUNCTION_BLOCK_CLOSURE> 
(11) <FUNCTION_BLOCK_CLOSURE> -> <FOR_LOOP> <FUNCTION_BLOCK_CLOSURE> 
(12) <FUNCTION_BLOCK_CLOSURE> -> <WHILE_LOOP> <FUNCTION_BLOCK_CLOSURE> 
(13) <FUNCTION_BLOCK_CLOSURE> -> <BRANCH_SENTENCE> <FUNCTION_BLOCK_CLOSURE> 
(14) <FUNCTION_BLOCK_CLOSURE> -> <FUNCTION_RETURN> <FUNCTION_BLOCK_CLOSURE> 
(15) <FUNCTION_BLOCK_CLOSURE> -> 
(16) <ASSIGNMENT_FUNCTION> -> <identifier> <ASSIGNMENT_OR_FUNCTION_CALL> 
(17) <ASSIGNMENT_OR_FUNCTION_CALL> -> = <RIGHT_VALUE> 
(18) <ASSIGNMENT_OR_FUNCTION_CALL> -> += <RIGHT_VALUE> 
(19) <ASSIGNMENT_OR_FUNCTION_CALL> -> -= <RIGHT_VALUE> 
(20) <ASSIGNMENT_OR_FUNCTION_CALL> -> *= <RIGHT_VALUE> 
(21) <ASSIGNMENT_OR_FUNCTION_CALL> -> /= <RIGHT_VALUE> 
(22) <ASSIGNMENT_OR_FUNCTION_CALL> -> %= <RIGHT_VALUE> 
(23) <ASSIGNMENT_OR_FUNCTION_CALL> -> = { <ARGS_LIST> } 
(24) <ASSIGNMENT_OR_FUNCTION_CALL> -> { } 
(25) <ARGS_LIST> -> <ARG> <ARG_CLOSURE> 
(26) <ARG_CLOSURE> -> , <ARG> <ARG_CLOSURE> 
(27) <ARG_CLOSURE> -> 
(28) <ARG> -> <identifier> 
(29) <ARG> -> <constant> 
(30) <RIGHT_VALUE> -> <EXPRESSION> 
(31) <RIGHT_VALUE> -> - <EXPRESSION> 
(32) <RIGHT_VALUE> -> <MULTIPULE_DATA> 
(33) <EXPRESSION> -> <FACTOR> <TERM> 
(34) <FACTOR> -> <FACTOR_FORMULA> <FACTOR_FORMULA_RECURSION> 
(35) <FACTOR_FORMULA> -> ( <EXPRESSION> ) 
(36) <FACTOR_FORMULA> -> <identifier> 
(37) <FACTOR_FORMULA> -> <constant> 
(38) <TERM> -> + <FACTOR> <TERM> 
(39) <TERM> -> - <FACTOR> <TERM> 
(40) <TERM> -> 
(41) <FACTOR_FORMULA_RECURSION> -> * <FACTOR_FORMULA> <FACTOR_FORMULA_RECURSION> 
(42) <FACTOR_FORMULA_RECURSION> -> / <FACTOR_FORMULA> <FACTOR_FORMULA_RECURSION> 
(43) <FACTOR_FORMULA_RECURSION> -> 
(44) <MULTIPULE_DATA> -> <constant> <CONSTANT_CLOSURE> 
(45) <CONSTANT_CLOSURE> -> , <constant> <CONSTANT_CLOSURE> 
(46) <CONSTANT_CLOSURE> -> 
(47) <FOR_LOOP> -> for <identifier> = <EXPRESSION> , <EXPRESSION> , <EXPRESSION> do <FUNCTION_BLOCK> end 
(48) <WHILE_LOOP> -> while ( <LOGICAL_EXPRESSION> ) do <FUNCTION_BLOCK> end 
(49) <LOGICAL_EXPRESSION> -> <EXPRESSION> <LOGICAL_OPERATOR> <EXPRESSION> 
(50) <LOGICAL_EXPRESSION> -> ( <LOGICAL_EXPRESSION> ) <LOGICAL_OPERATOR> ( <LOGICAL_EXPRESSION> ) 
(51) <LOGICAL_EXPRESSION> -> ! ( <LOGICAL_EXPRESSION> ) 
(52) <LOGICAL_OPERATOR> -> and 
(53) <LOGICAL_OPERATOR> -> or 
(54) <LOGICAL_OPERATOR> -> not 
(55) <LOGICAL_OPERATOR> -> == 
(56) <LOGICAL_OPERATOR> -> != 
(57) <LOGICAL_OPERATOR> -> > 
(58) <LOGICAL_OPERATOR> -> >= 
(59) <LOGICAL_OPERATOR> -> < 
(60) <LOGICAL_OPERATOR> -> <= 
(61) <BRANCH_SENTENCE> -> if ( <LOGICAL_EXPRESSION> ) then <FUNCTION_BLOCK> <ELSE_SENTENCE> end 
(62) <ELSE_SENTENCE> -> elseif ( <LOGICAL_EXPRESSION> ) then <FUNCTION_BLOCK> <ELSE_SENTENCE> 
(63) <ELSE_SENTENCE> -> else <FUNCTION_BLOCK> 
(64) <ELSE_SENTENCE> -> 
(65) <FUNCTION_RETURN> -> return <FACTOR_FORMULA> 
```

中间状态对照表：
| 状态                            | 描述           |
| ------------------------------- | -------------- |
| `<CODE>`                        | 代码入口       |
| `<FUNCTION_DEFINITION>`         | 函数定义       |
| `<ARGS_STATEMENT>`              | 参数声明       |
| `<FUNCTION_BLOCK>`              | 函数块         |
| `<STATEMENT>`                   | 声明           |
| `<STATEMENT_CLOSURE>`           | 声明闭包       |
| `<FUNCTION_BLOCK_CLOSURE>`      | 函数块闭包     |
| `<ASSIGNTMENT_FUNCTION>`        | 赋值函数       |
| `<FOR_LOOP>`                    | for循环        |
| `<WHILE_LOOP>`                  | while循环      |
| `<BRANCH_SENTENCE>`             | 分支语句       |
| `<FUNCTION_RETURN>`             | 函数返回       |
| `<ASSIGNMENT_OR_FUNCTION_CALL>` | 赋值或函数调用 |
| `<RIGHT_VALUE>`                 | 右值           |
| `<ARGS_LIST>`                   | 参数列表       |
| `<ARG>`                         | 参数           |
| `<ARG_CLOSURE>`                 | 参数闭包       |
| `<EXPRESSION>`                  | 表达式         |
| `<MULTIPULE_DATA>`              | 多个数据       |
| `<FACTOR>`                      | 因子           |
| `<TERM>`                        | 项             |
| `<FACTOR_FORMULA>`              | 因式           |
| `<FACTOR_FORMULA_RECURSION>`    | 因式递归       |
| `<CONSTANT_CLOSURE>`            | 常量闭包       |
| `<LOGICAL_EXPRESSION>`          | 逻辑表达式     |
| `<LOGICAL_OPERATOR>`            | 逻辑运算符     |
| `<ELSE_SENTENCE>`               | 分支转移       |

类型或别名对照表：
| 别名           | 描述   |
| -------------- | ------ |
| `<constant>`   | 常量   |
| `<identifier>` | 标识符 |
| `<empty>`      | 空     |

## t3_grammar.json

3型右递归文法，用于词法分析。

Token包含关键字、常量、分隔符、运算符、标识符五类。

常数支持科学计数法和虚数。

`<`和`>`之间用来表示一个字符或一类字符，`->`表示推出。


### 常数

正则：
```
regex: -?\d+(\.\d+)?(E(\+|\-)\d+(\.\d+)?)?((\+|\-)(\d+(\.\d+)?)?i)?
simplified: -?\d+\(.\d+)?(E(\+|-)\d+(\.\d+)?)?(\[+-](\d+(\.\d+)?)?i)?
```

转换过程：
```
(\d+ => \d\d*) => -?\d\d*(\.\d\d*)?(E(\+|\-)\d\d*(\.\d\d*)?)?((\+|\-)(\d\d*(\.\d\d*)?)?i)?
(x? => (x|)) => (\-|)\d\d*((\.\d\d*)|)((E(\+|\-)\d\d*((\.\d\d*)|))|)(((\+|\-)((\d\d*((\.\d\d*)|))|)i)|)

step0: A
A->(\-|)\d\d*((\.\d\d*)|)((E(\+|\-)\d\d*((\.\d\d*)|))|)(((\+|\-)((\d\d*((\.\d\d*)|))|)i)|)

step1: B
A->(\-|)B
B->\d\d*((\.\d\d*)|)((E(\+|\-)\d\d*((\.\d\d*)|))|)(((\+|\-)((\d\d*((\.\d\d*)|))|)i)|)

step2: C
A->-B (!)
A->B (!)
B->\dC (!)
C->\d*((\.\d\d*)|)((E(\+|\-)\d\d*((\.\d\d*)|))|)(((\+|\-)((\d\d*((\.\d\d*)|))|)i)|)

step3:
C->\dC (!)
C->((\.\d\d*)|)((E(\+|\-)\d\d*((\.\d\d*)|))|)(((\+|\-)((\d\d*((\.\d\d*)|))|)i)|)

step4: D
C->((\.\d\d*)|)D
D->((E(\+|\-)\d\d*((\.\d\d*)|))|)(((\+|\-)((\d\d*((\.\d\d*)|))|)i)|)

step5: E
C->\.\d\d*D
C->D (!)
D->((\E(\+|\-)\d\d*((\.\d\d*)|))|)E
E->(((\+|\-)((\d\d*((\.\d\d*)|))|)i)|)

step6: F
C->\.F (!)
F->\d\d*D
D->E (!)
D->\E(\+|\-)\d\d*((\.\d\d*)|)E
E->(\+|\-)((\d\d*((\.\d\d*)|))|)i
E-><empty> (!)

step7: G, H, I
F->\dG (!)
G->\d*D
D->\EH (!)
H->(\+|\-)\d\d*((\.\d\d*)|)E
E->(\+|\-)I
I->((\d\d*((\.\d\d*)|))|)i

step8: J, K
G->\dG (!)
G->D (!)
H->(\+|\-)J
J->\d\d*((\.\d\d*)|)E
E->\+I (!)
E->\-I (!)
I->((\d\d*((\.\d\d*)|))|)K
K->i (!)

step9: L
H->\+J (!)
H->\-J (!)
J->\dL (!)
L->\d*((\.\d\d*)|)E
I->\d\d*((\.\d\d*)|)K
I->K (!)

step10: M
L->\dL (!)
L->((\.\d\d*)|)E
I->\dM (!)
M->\d*((\.\d\d*)|)K

step11:
L->\.\d\d*E
L->E (!)
M->\dM (!)
M->((\.\d\d*)|)K

step12: N
L->\.N (!)
N->\d\d*E
M->\.\d\d*K
M->K (!)

step13: O, P
N->\dO (!)
O->\d*E
M->\.P (!)
P->\d\d*K

step14: Q
O->\dO (!)
O->E (!)
P->\dQ (!)
Q->\d*K

step15:
Q->\dQ (!)
Q->K (!)

```

示例：
```
10
0.1428571
1.46E+10
2.00E-01
12+i
12-10i
13+1.2i
3E+1.0-10.3i
-10
-0.1428571
-1.46E+10
-2.00E-01
-12+i
-12-10i
-13+1.2i
-3E+1.0+10.3i
```

产生式
```
A-><->B
A->B
B-><digit>C
C-><digit>C
C->D
C-><.>F
D->E
E-><empty>
F-><digit>G
D-><E>H
G-><digit>G
G->D
E-><+>I
E-><->I
H-><+>J
H-><->J
J-><digit>L
I->K
K-><i>
L-><digit>L
I-><digit>M
L->E
M-><digit>M
L-><.>N
M->K
N-><digit>O
M-><.>P
O-><digit>O
O->E
P-><digit>Q
Q-><digit>Q
Q->K

PS：<digit>表示数字，<empty>表示空
```

### 变量名/常量名

正则：
```
[a-zA-Z_][0-9a-zA-Z_]*
```

产生式：
```
A-><letter>B
A-><_>B
B-><letter>B
B-><digit>B
B-><_>B
B-><empty>

PS：<digit>表示数字，<empty>表示空，<letter>表示字母（含大小写）
```

### 字符串

正则：
```
(".*")|('.*')
```

产生式：
```
A-><">B
B-><dot1>B,
B-><">,
A-><'>C,
C-><dot2>C,
C-><'>

PS：<dot1>表示除*换行*和*回车*以及*双引号*外的其他字符。<dot2>表示除*换行*和*回车*以及*单引号*外的其他字符。
DFA中没有正则里的贪婪和懒惰匹配模式问题，因此这里的<dot1><dot2>需要将引号排除，解析器默认使用贪婪匹配。
```

状态这里用单个大写字母表示，实际上支持字符串，除END_NODE外（为保留状态）

别名对照表：

| 别名       | 描述                       |
| ---------- | -------------------------- |
| `<digit>`  | 数字                       |
| `<empty>`  | 空                         |
| `<letter>` | 字母（含大小写）           |
| `<dot1>`   | 除LF、LR、双引号外其他字符 |
| `<dot2>`   | 除LF、LR、单引号外其他字符 |



## code.txt

示例代码，作为词法分析器的输入。

测试用例使用类似Lua和C++语法。
