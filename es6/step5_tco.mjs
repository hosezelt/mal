
import rl from './node_readline.js'
import { Env } from "./env.mjs"
import { ns } from "./core.mjs"
import { read_str } from "./reader.mjs"
import { pr_str } from "./printer.mjs"
import { isList } from "./types.mjs"

const { readline } = rl;

// read
const READ = str => read_str(str)

// eval
const EVAL = (ast, env) => {
    while (true) {
        if (!isList(ast)) {
            return eval_ast(ast, env);
        }
        else if (ast.length === 0) {
            return ast;
        }
        else {
            const [a0, a1, a2, a3] = ast;
            switch (a0) {
                case Symbol.for("def!"):
                    return env.set(a1, EVAL(a2, env));
                case Symbol.for("let*"):
                    let new_env = new Env(env);
                    let binding = a1;
                    binding.forEach((val, idx) => {
                        if (idx % 2 === 0) {
                            new_env.set(val, EVAL(binding[idx + 1], new_env));
                        }
                    })
                    env = new_env;
                    ast = ast[2];
                    break;
                case Symbol.for("do"):
                    let ast_arr = eval_ast(ast.slice(1, ast.length - 1), env);
                    ast = ast_arr[ast_arr.length - 1];
                    break;
                case Symbol.for("if"):
                    EVAL(a1, env) ? ast = a2 : ast = a3;
                    break;
                case Symbol.for("fn*"):
                    return {
                        malfunc: true,
                        ast: a2,
                        params: a1,
                        env,
                        fn: (...args) => EVAL(a2, new Env(env, a1, args)),
                    }
                default:
                    const [f, ...args] = eval_ast(ast, env)
                    if(f.malfunc) {
                        ast = f.ast;
                        env  = new Env(f.env, f.params, args);
                        break;
                    }
                    else {
                        return f(...args)
                    }
                    
            }
        }
    }
}

const eval_ast = (ast, env) => {
    if (Array.isArray(ast)) {
        return ast.map(token => EVAL(token, env));
    }
    else if (ast instanceof Map) {
        let new_hm = new Map()
        ast.forEach((v, k) => new_hm.set(k, EVAL(v, env)))
        return new_hm
    }
    else if (typeof ast === "symbol") {
        return env.get(ast);
    }
    else {
        return ast;
    }
}

// print
const PRINT = exp => pr_str(exp)

const repl_env = new Env(null);

ns.forEach((val, key) => repl_env.set(key, val));

// repl
const REP = str => PRINT(EVAL(READ(str), repl_env))

REP("(def! not (fn* (a) (if a false true)))")

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