import rl from './node_readline.js'
import { Env } from "./env.mjs"
import { ns } from "./core.mjs"
import { read_str } from "./reader.mjs"
import { pr_str} from "./printer.mjs"
import { List, _isList, _clone, _isKeyword } from "./types.mjs"
import { createRequire } from "module"
global.require = createRequire(import.meta.url);

const { readline } = rl;

const isPair = (a) => Array.isArray(a) && a.length > 0;

const quasiquote = (ast) => {
    if (!isPair(ast)) {
        return List.from([Symbol.for("quote"), ast]);
    }
    else if (ast[0] === Symbol.for("unquote")) {
        return ast[1];
    }
    else if (isPair(ast[0]) && ast[0][0] === Symbol.for("splice-unquote")) {
        return List.from([Symbol.for("concat"), ast[0][1], quasiquote(ast.slice(1))]);
    }
    else {
        return List.from([Symbol.for("cons"), quasiquote(ast[0]), quasiquote(ast.slice(1))]);
    }

}

const isMacro = (ast, env) => {
    if (Array.isArray(ast) && typeof ast[0] === "symbol") {
        if (env.find(ast[0])) {
            return env.get(ast[0]).is_macro;
        }
    }
    return false;
}

const macroexpand = (ast, env) => {
    while (isMacro(ast, env)) {
        ast = env.get(ast[0])(...ast.slice(1));
    }
    return ast;
}



// read
const READ = str => read_str(str)

// eval
const EVAL = (ast, env) => {
    while (true) {
        if (!_isList(ast)) {
            return eval_ast(ast, env);
        }
        else if (ast.length === 0) {
            return ast;
        }
        else {
            ast = macroexpand(ast, env);
            if (!_isList(ast)) {
                return eval_ast(ast, env);
            }
            const [a0, a1, a2, a3] = ast;
            switch (a0) {
                case Symbol.for("def!"):
                    return env.set(a1, EVAL(a2, env));
                case Symbol.for("defmacro!"):
                    let func = _clone(EVAL(a2, env));
                    func.is_macro = true;
                    return env.set(a1, func);
                case Symbol.for("macroexpand"):
                    return macroexpand(ast[1], env);
                case Symbol.for("try*"):
                    try {
                        return EVAL(a1, env);
                    } catch (err) {
                        if (a2 && a2[0] === Symbol.for("catch*")) {
                            if (err instanceof Error) { err = err.message }
                            return EVAL(a2[2], new Env(env, [a2[1]], [err]))
                        } else {
                            throw err
                        }
                    }
                case Symbol.for("let*"):
                    let new_env = new Env(env);
                    let binding = a1;
                    binding.forEach((val, idx) => {
                        if (idx % 2 === 0) {
                            new_env.set(val, EVAL(binding[idx + 1], new_env));
                        }
                    })
                    env = new_env;
                    ast = a2;
                    break;
                case Symbol.for("do"):
                    eval_ast(ast.slice(1, -1), env);
                    ast = ast[ast.length - 1];
                    break;
                case Symbol.for("if"):
                    let cond = EVAL(a1, env);
                    if (cond === null || cond === false) {
                        ast = (typeof a3 !== 'undefined') ? a3 : null
                    } else {
                        ast = a2
                    }
                    break;
                case Symbol.for("fn*"):
                    return Object.assign((...args) => EVAL(a2, new Env(env, a1, args)), {
                        malfunc: true,
                        ast: a2,
                        params: a1,
                        env,
                        is_macro: false
                    });
                case Symbol.for("quote"):
                    return a1;
                case Symbol.for("quasiquote"):
                    ast = quasiquote(a1);
                    break;
                case Symbol.for("."):
                    global.evalast = eval_ast(ast.slice(2)).join(",");
                    return eval.call(process, `${Symbol.keyFor(a1)}(evalast)`)
                default:
                    if(typeof a0 === "symbol" && Symbol.keyFor(a0).slice(0, 2) === ".-") {
                        return eval(`${Symbol.keyFor(a1)}.${Symbol.keyFor(a0).slice(2)}`);
                    }
                    if(typeof a0 === "symbol" && Symbol.keyFor(a0)[0] === ".") {
                        let ast0 = pr_str(a0);
                        let ast1 = pr_str(a1);
                        let astr = eval_ast(ast.slice(2), env);
                        return eval(`${ast1}${ast0}(...astr)`);
                    }
                    const [f, ...args] = eval_ast(ast, env)
                    if (f.malfunc) {
                        ast = f.ast;
                        env = new Env(f.env, f.params, args);
                        break;
                    }
                    else if (_isKeyword(f)) {
                        return args[0][f]
                    }
                    else {
                        return f(...args)
                    }

            }
        }
    }
}

const eval_ast = (ast, env) => {
    if (ast instanceof Array) {
        return ast.map(token => EVAL(token, env));
    }
    else if (ast && ast.__type === "dictionary") {
        let new_hm = Object.create({__type: "dictionary"});
        Object.entries(ast).forEach(([k, v]) => new_hm[k] = EVAL(v, env));
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
repl_env.set(Symbol.for("eval"), (ast) => EVAL(ast, repl_env));
repl_env.set(Symbol.for("*ARGV*"), [])

// repl
const REP = str => PRINT(EVAL(READ(str), repl_env))

REP("(def! *host-language* \"Javascript\")")
REP("(def! not (fn* (a) (if a false true)))")
REP('(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\n nil)")))))')
REP("(defmacro! cond (fn* (& xs) (if (> (count xs) 0) (list 'if (first xs) (if (> (count xs) 1) (nth xs 1) (throw odd number of forms to cond)) (cons 'cond (rest (rest xs)))))))")


if (process.argv.length > 2) {
    repl_env.set(Symbol.for("*ARGV*"), process.argv.slice(3))
    REP(`(load-file "${process.argv[2]}")`)
    process.exit(0)
}

REP("(println (str \"Mal\" [ *host-language* ]))")

while (true) {

    let line = readline('user> ')
    if (line == null) break
    try {
        if (line) { console.log(REP(line)) }
    }
    catch (exc) {
        console.warn(`${exc}`)
    }

}