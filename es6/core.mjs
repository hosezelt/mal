import { pr_str } from "./printer.mjs";
import { isList, _equal, Atom, Vector, _hashMap, _isKeyword, _keyword } from "./types.mjs";
import { read_str } from "./reader.mjs";
import rl from './node_readline.js'

const { readline } = rl;
import * as fs from "fs";

const _error = (e) => {
    throw new Error(e);
}

export const ns = new Map(
    [
        [Symbol.for("throw"), (a) => {throw new Error(typeof a === "string" ? a : pr_str(a))}],

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
        [Symbol.for("str"), (...a) => a.map(s => pr_str(s, false)).join("")],
        [Symbol.for("prn"), (...a) => console.log(...a.map(s => pr_str(s, true))) || null],
        [Symbol.for("println"), (...a) => console.log(...a.map(s => pr_str(s, false))) || null],
        [Symbol.for("read-string"), (a) => read_str(a)],
        [Symbol.for("slurp"), (a) => fs.readFileSync(a, 'utf-8')],
        [Symbol.for("readline"), (a) => readline(`${a}> `)],
        
        [Symbol.for("count"), (a) => a ? a.length : 0],
        [Symbol.for("empty?"), (a) => a.length === 0],
        [Symbol.for("list"), (...a) => [...a]],
        [Symbol.for("list?"), (a) => isList(a)],
        [Symbol.for("vector"), (...a) => Vector.from(a)],
        [Symbol.for("vector?"), (a) => a instanceof Vector],
        [Symbol.for("cons"), (a, b) => [a].concat(b)],
        [Symbol.for("conj"), (a, b) => {throw new Error("Not implemented")}],
        [Symbol.for("concat"), (...b) => [].concat(...b)],
        [Symbol.for("nth"), (a, b) => b < a.length ? a[b] : _error("nth: index out of range")],
        [Symbol.for("first"), (a) => a === null ? null : a[0]],
        [Symbol.for("rest"), (a) => a === null ? [] : Array.from(a.slice(1))],

        [Symbol.for("atom"), (a, ...b) => new Atom(a)],
        [Symbol.for("atom?"), (a, ...b) => (a instanceof Atom)],
        [Symbol.for("deref"), (a, ...b) => a ? a.val : null],
        [Symbol.for("reset!"), (a, ...b) => a.val = b[0]],
        [Symbol.for("swap!"), (atm,f,...args) => atm.val = f(...[atm.val].concat(args))],

        [Symbol.for("nil?"), (a) => a === null],
        [Symbol.for("true?"), (a) => a === true],
        [Symbol.for("false?"), (a) => a === false],
        [Symbol.for("keyword"), (a) => _keyword(a)],
        [Symbol.for("keyword?"), (a) => _isKeyword(a)],

        [Symbol.for("hash-map"), (...a) => _hashMap(new Map(), ...a)],
        [Symbol.for("map?"), (a) => a instanceof Map],
        [Symbol.for("assoc"), (a, ...b) => _hashMap(new Map(a), ...b) ],
        [Symbol.for("dissoc"), (a, ...b) => {
            let d = new Map(a);
            b.forEach(key => d.delete(key));
            return d;
        } ],
        [Symbol.for("get"), (a, b) => a instanceof Map ? a.get(b) : null],
        [Symbol.for("contains?"), (a, b) => a instanceof Map ? a.has(b) : false],
        [Symbol.for("keys"), (a) => a instanceof Map ? [...a.keys()] : []],
        [Symbol.for("vals"), (a) => a instanceof Map ? [...a.values()] : []],

        [Symbol.for("sequential?"), (a) => a instanceof Vector || a instanceof Array ],
        [Symbol.for("symbol"), (a) => Symbol.for(a)],
        [Symbol.for("symbol?"), (a) => typeof a ==="symbol"],
        [Symbol.for("number?"), (a) => typeof a === "number"],
        [Symbol.for("fn?"), (a) => typeof a === "function"],
        [Symbol.for("string?"), (a) => typeof a === "string" && !_isKeyword(a)],
        [Symbol.for("seq"), (a) => {throw new Error("Not implemented")}],
        [Symbol.for("meta"), (a) => {throw new Error("Not implemented")}],
        [Symbol.for("with-meta"), (a) => {throw new Error("Not implemented")}],

        [Symbol.for("apply"), (a, ...b) => a(...(b.slice(0,-1).concat(Array.from(b[b.length -1]))))],
        [Symbol.for("map"), (a, b) => Array.from(b.map(t => a(t)))],

        [Symbol.for("time-ms"), () => Date.now()],
    ]
)