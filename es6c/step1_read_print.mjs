
import rl from './node_readline.js'
import { read_str } from "./reader.mjs"
import { pr_str } from "./printer.mjs"

const { readline } = rl;

// read
const READ = str => read_str(str)

// eval
const EVAL = (ast, env) => ast

// print
const PRINT = exp => pr_str(exp)

// repl
const REP = str => PRINT(EVAL(READ(str)), {})

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