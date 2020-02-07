
import rl from './node_readline.js'
import { read_str } from "./reader.mjs"
import { pr_str } from "./printer.mjs"
import { isList } from "./types.mjs"

const { readline } = rl;

// read
const READ = str => read_str(str)

// eval
const EVAL = (ast, env) => {
    if(!isList(ast)) {
        return eval_ast(ast, env);
    }
    else if (ast.length === 0) {
        return ast;
    }
    else {
        const [f, ...args] = eval_ast(ast, env)
        return f(...args)
    }
}

const eval_ast = (ast, env) => {
    if(Array.isArray(ast)) {
        return ast.map(token => EVAL(token, env));
    }
    else if (ast instanceof Map) {
        let new_hm = new Map()
        ast.forEach((v, k) => new_hm.set(EVAL(k, env), EVAL(v, env)))
        return new_hm
    }
    else if (typeof ast ==="symbol") {
        return env.get(ast);
    }
    else {
        return ast;
    }
}

// print
const PRINT = exp => pr_str(exp)

const repl_env = new Map(
    [
        [Symbol.for("+"), (a, b) => a + b],
        [Symbol.for("-"), (a, b) => a - b],
        [Symbol.for("*"), (a, b) => a * b],
        [Symbol.for("/"), (a, b) => a / b],
    ]
)

// repl
const REP = str => PRINT(EVAL(READ(str), repl_env))



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