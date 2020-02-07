import { pr_str } from "./printer.mjs";
import { isList } from "./types.mjs";
import { _equal } from "./types.mjs";
import { read_str } from "./reader.mjs";
import * as path from "path";
import * as fs from "fs";

export const ns = new Map(
    [
        [Symbol.for("+"), (a, b) => a + b],
        [Symbol.for("-"), (a, b) => a - b],
        [Symbol.for("*"), (a, b) => a * b],
        [Symbol.for("/"), (a, b) => a / b],
        [Symbol.for("="), (a, b) => _equal(a,b)],
        [Symbol.for("<"), (a, b) => a < b],
        [Symbol.for("<="), (a, b) => a <= b],
        [Symbol.for(">"), (a, b) => a > b],
        [Symbol.for(">="), (a, b) => a >= b],

        [Symbol.for("pr-str"), (...a) => a.map(s => pr_str(s, true)).join(" ")],
        [Symbol.for("str"), (...a) => a.map(s => pr_str(s, false)).join(" ")],
        [Symbol.for("prn"), (...a) => console.log(...a.map(s => pr_str(s, true))) || null],
        [Symbol.for("println"), (...a) => console.log(...a.map(s => pr_str(s, false))) || null],
       
        [Symbol.for("count"), (a) => a ? a.length : 0],
        [Symbol.for("empty?"), (a) => a.length === 0],
        [Symbol.for("list"), (...a) => [...a]],
        [Symbol.for("list?"), (a) => isList(a)],

        [Symbol.for("read-string"), (a) => read_str(a)],
        [Symbol.for("slurp"), (a) => fs.readFileSync(a)],
    ]
)