
import { read_str } from "./reader.mjs"
import { pr_str } from "./printer.mjs"
import { _isList, _equal, List, _isVector } from "./types.mjs"
import * as escodegen from "escodegen"
import { snakeToCamel } from "./utils.mjs"

global.list = (...a) => List.from([...a]);
global.isList = (a) => _isList(a);
global.isVector = (a) => _isVector(a);
global._equal = _equal;
global.isEmpty = (a) => a.length === 0;
global.count = (a) => a ? a.length : 0;
global.prn = (...a) => console.log(...a.map(s => pr_str(s, true))) || null;
global.prStr = (...a) => a.map(s => pr_str(s, true)).join(" ");
global.str = (...a) => a.map(s => pr_str(s, false)).join("");
global.println = (...a) => console.log(...a.map(s => pr_str(s, false))) || null
global.readString = (a) => read_str(a);

const writer = { //Native fns
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
    'not': (a) => {
        return {
            type: "UnaryExpression",
            operator: "!",
            argument: a
        }
    },
    '=': (a, b) => {
        return {
            type: "CallExpression",
            callee: {
                type: "Identifier",
                name: "_equal"
            },
            arguments: [a, b],
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
    '>=': (a, b) => {
        return {
            type: "BinaryExpression",
            operator: ">=",
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
    '<=': (a, b) => {
        return {
            type: "BinaryExpression",
            operator: "<=",
            left: a,
            right: b
        }
    },
}

const compile_params = (ast) => {
    let compiled_ast = [];
    for (let [idx, val] of ast.entries()) {
        if (val === Symbol.for("&")) {
            compiled_ast.push({
                type: "RestElement",
                argument: COMPILE(ast[idx + 1])
            })
            break;
        }
        else {
            compiled_ast.push(COMPILE(ast[idx]));
        }
    }

    return compiled_ast;
}

const compile_declarations = (ast) => {
    let decl = [];
    for (let i = 0; i < ast.length - 1; i += 2) {
        decl.push(
            {
                type: "VariableDeclaration",
                kind: "var",
                declarations: [{
                    type: "VariableDeclarator",
                    id: COMPILE(ast[i]),
                    init: COMPILE(ast[i + 1])
                }]
            }
        )
    }
    return decl;
}

// eval
const COMPILE = (ast, env) => {
    if (!_isList(ast)) {
        return compile_ast(ast, env);
    }
    else if (ast.length === 0) {
        return ast;
    }
    else {  //Special forms
        if (ast[0] === Symbol.for("fn*")) {
            return {
                type: "ArrowFunctionExpression",
                params: compile_params(ast[1]),
                body: COMPILE(ast[2])
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
        if (ast[0] === Symbol.for(":require")) {
            return {
                type: "ImportDeclaration",
                specifiers: [
                    { type: "ImportDefaultSpecifier"}
                ],
                declarations: [{
                    type: "VariableDeclarator",
                    id: COMPILE(ast[1]),
                    init: COMPILE(ast[2], env)
                }
                ]
            }
        }
        if (ast[0] === Symbol.for("quote")) {
            return {
                type: "Literal",
                value: prStr(ast[1])
            }
        }
        if (ast[0] === Symbol.for("do")) {
            return {
                type: "CallExpression",
                arguments: [],
                callee: {
                    type: "ArrowFunctionExpression",
                    params: [],
                    body: {
                        type: "BlockStatement",
                        body: [
                            ...compile_ast(ast.slice(1, -1), env).map(ast => { return { type: "ExpressionStatement", expression: ast } }),
                            {
                                type: "ReturnStatement",
                                argument: COMPILE(ast.slice(-1)[0])
                            }
                        ]
                    }
                }
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
                    callee: {
                        type: "MemberExpression",
                        object: {
                            type: "ArrowFunctionExpression",
                            params: [],
                            body: {
                                type: "BlockStatement",
                                body: [...compile_declarations(ast[1]),
                                {
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

const compile_ast = (ast, env) => { //Data types
    if (_isVector(ast)) {
        return {
            type: "ArrayExpression",
            elements: ast.map(token => COMPILE(token, env))
        }
    }
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

export const compileProgram = (str) => {
    let forms = readString(str);
    const ast = forms.map(form => COMPILE(form));
    let code = escodegen.generate({
        type: "Program",
        body: ast

    });
    return code;
}

export const PRINT = exp => pr_str(exp)