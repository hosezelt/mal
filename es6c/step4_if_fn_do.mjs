
import rl from './node_readline.js'
import { read_str } from "./reader.mjs"
import { pr_str } from "./printer.mjs"
import { _isList } from "./types.mjs"
import * as escodegen from "escodegen"
import { snakeToCamel } from "./utils.mjs"

global.list = (...a) => [...a];
global.isList = (a) => _isList(a);

const { readline } = rl;
const writer = {
    '+': (a, b) => {
        return {
            type: "BinaryExpression",
            operator: "+",
            left: a,
            right: b
        }
    },
    '-': (a, b) => {
        return {
            type: "BinaryExpression",
            operator: "-",
            left: a,
            right: b
        }
    },
    '*': (a, b) => {
        return {
            type: "BinaryExpression",
            operator: "*",
            left: a,
            right: b
        }
    },
    '/': (a, b) => {
        return {
            type: "BinaryExpression",
            operator: "/",
            left: a,
            right: b
        }
    },
    'and': (a, b) => {
        return {
            type: "LogicalExpression",
            operator: "&&",
            left: a,
            right: b
        }
    },
    '=': (a, b) => {
        return {
            type: "LogicalExpression",
            operator: "===",
            left: a,
            right: b
        }
    },
    '>': (a, b) => {
        return {
            type: "BinaryExpression",
            operator: ">",
            left: a,
            right: b
        }
    },
    '<': (a, b) => {
        return {
            type: "LogicalExpression",
            operator: "<",
            left: a,
            right: b
        }
    },
}
// read
const READ = str => read_str(str)

// eval
const COMPILE = (ast, env) => {
    if (!_isList(ast)) {
        return compile_ast(ast, env);
    }
    else if (ast.length === 0) {
        return ast;
    }
    else {
        if (ast[0] === Symbol.for("fn*")) {
            return {
                type: "FunctionExpression",
                params: compile_ast(ast[1]),
                body: {
                    type: "BlockStatement",
                    body: [{
                        type: "ReturnStatement",
                        argument: COMPILE(ast[2])
                    }]
                }
            }
        }
        if (ast[0] === Symbol.for("if")) {
            return {
                type: "ConditionalExpression",
                test: COMPILE(ast[1]),
                consequent: COMPILE(ast[2]),
                alternate: COMPILE(ast[3])
            }
        }
        if (ast[0] === Symbol.for("def!")) {
            return {
                type: "VariableDeclaration",
                kind: "var",
                declarations: [{
                    type: "VariableDeclarator",
                    id: COMPILE(ast[1]),
                    init: COMPILE(ast[2], env)
                }
                ]
            }
        }

        if (ast[0] === Symbol.for("let*")) {
            return {
                type: "ExpressionStatement",
                expression: {
                    type: "CallExpression",
                    arguments: [{
                        type: "ThisExpression"
                    }],
                    extra: {
                        parenthesized: true,
                        parenStart: 0
                    },
                    callee: {
                        type: "MemberExpression",
                        object: {
                            type: "FunctionExpression",
                            params: [],
                            body: {
                                type: "BlockStatement",
                                body: [{
                                    type: "VariableDeclaration",
                                    kind: "var",
                                    declarations: [{
                                        type: "VariableDeclarator",
                                        id: COMPILE(ast[1][0]),
                                        init: COMPILE(ast[1][1])
                                    }]
                                }, {
                                    type: "ReturnStatement",
                                    argument: COMPILE(ast[2])
                                }]
                            }
                        },
                        property: {
                            type: "Identifier",
                            name: "call"
                        }
                    }
                }
            }
        }

        const [f, ...args] = compile_ast(ast, env)
        if (writer.hasOwnProperty(f.name)) {
            return writer[f.name](...args);
        }

        return {
            type: "CallExpression",
            callee: f,
            arguments: args,
        }
    }
}

const compile_ast = (ast, env) => {
    if (Array.isArray(ast)) {
        return ast.map(token => COMPILE(token, env));
    }
    else if (ast instanceof Map) {
        let new_hm = new Map()
        ast.forEach((v, k) => new_hm.set(COMPILE(k, env), COMPILE(v, env)))
        return new_hm
    }
    else if (typeof ast === "symbol") {
        if (writer.hasOwnProperty(Symbol.keyFor(ast))) {
            return writer[Symbol.keyFor(ast)];
        }
        return {
            type: 'Identifier',
            name: snakeToCamel(Symbol.keyFor(ast))
        }
    }
    else {
        return ast < 0 ? {
            type: "UnaryExpression",
            operator: ast.toString()[0],
            argument: {
                type: "Literal",
                value: ast.toString().substr(1),
            }
        }
            : {
                type: "Literal",
                value: ast === undefined ? null : ast && ast.valueOf()
            }
    }
}


// print
const PRINT = exp => pr_str(exp)

const repl_env = new Map(
    [
        [Symbol.for("+"), "+"],
        [Symbol.for("-"), "-"],
        [Symbol.for("*"), "*"],
        [Symbol.for("/"), "/"],
        [Symbol.for("="), "==="],
        [Symbol.for(">"), ">"],
        [Symbol.for("<"), "<"],
        [Symbol.for("and"), "&&"],
        [Symbol.for("or"), "||"],
        [Symbol.for("list"), "list"],
        [Symbol.for("list?"), "isList"]
    ]
)



// repl
const REP = str => PRINT(eval(escodegen.generate(COMPILE(READ(str), repl_env))));



while (true) {

    let line = readline('user> ')
    if (line == null) break
    try {
        if (line) {
            let form = READ(line);
            let ast = COMPILE(form);
            let code = escodegen.generate({
                type: "Program",
                body: [
                    {
                        type: "ExpressionStatement",
                        expression: ast
                    }
                ]
            });
            let res = eval.call(process, code);
            console.log(PRINT(res));

        }
    }
    catch (exc) {
        console.warn(`Error: ${exc}`)
    }

}