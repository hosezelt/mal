import rl from './node_readline.js'
import fs from 'fs'
import path from 'path'
import commander from "commander"
import vm from "vm"
import { createRequire } from "module"
global.require = createRequire(import.meta.url);

const { readline } = rl;

import { compileProgram, PRINT } from "./compiler.mjs"

const program = new commander.Command()
program
    .option('-c, --compile <path>', 'compile a file')
    .option('-o, --output <path>', 'output location of compiled file')

program.parse(process.argv);

const fullFilePath = process.argv[1];
const dirPath = path.dirname(fullFilePath);

if (program.compile) {
    const source = fs.readFileSync(path.resolve(dirPath, program.compile), "utf-8");

    let code = compileProgram(source);

    const outputPath = program.output ? path.resolve(dirPath, program.output) : path.resolve(dirPath, path.dirname(program.compile), path.basename(program.compile, ".jisp") + ".js")

    fs.writeFileSync(outputPath, code);
    process.exit(0);
}

let context = vm.createContext(global);
 
while (true) {

    let line = readline('user> ')
    if (line == null) break
    try {
        if (line) {
            let code = compileProgram(line);
            let res = vm.runInContext(code, context);
            console.log(PRINT(res));
        }
    }
    catch (exc) {
        console.warn(`Error: ${exc}`)
    }

}