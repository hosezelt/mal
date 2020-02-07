
import rl from './node_readline.js'
import { Env } from "./env.mjs"
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
        switch (ast[0]) {
        case Symbol.for("def!"):
            return env.set(ast[1], EVAL(ast[2], env));
        case Symbol.for("let*"):
            let new_env = new Env(env);
            let binding = ast[1];
            binding.forEach((val, idx) => {
                if(idx % 2 === 0) {
                    new_env.set(val, EVAL(binding[idx + 1], new_env));
                }
            })            
            return EVAL(ast[2], new_env);
        default:
            const [f, ...args] = eval_ast(ast, env)
            return f(...args)
        }
    }
}

const eval_ast = (ast, env) => {
    if(Array.isArray(ast)) {
        return ast.map(token => EVAL(token, env));
    }
    else if (ast instanceof Map) {
        let new_hm = new Map()
        ast.forEach((v, k) => new_hm.set(k, EVAL(v, env)))
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

const repl_env = new Env(null);
repl_env.set(Symbol.for("+"), (a, b) => a + b);
repl_env.set(Symbol.for("-"), (a, b) => a - b);
repl_env.set(Symbol.for("*"), (a, b) => a * b);
repl_env.set(Symbol.for("/"), (a, b) => a / b);

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