
import rl from './node_readline.js'
import { read_str } from "./reader.mjs"
import { pr_str } from "./printer.mjs"
import { _isList } from "./types.mjs"
import * as escodegen from "escodegen"

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
    }
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
        const [f, ...args] = compile_ast(ast, env)

        return writer[f](...args);
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
        return env.get(ast);
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
                value: ast
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
    ]
)


// repl
const REP = str => PRINT(eval(escodegen.generate(COMPILE(READ(str), repl_env))));



while (true) {

    let line = readline('user> ')
    if (line == null) break
    try {
        if (line) { console.log(REP(line)) }
    }
    catch (exc) {
        console.warn(`Error: ${exc}`)
    }

}