import { pr_str } from "./printer.mjs";
import { _isList, _equal, Atom,  _hashMap, _isKeyword, _keyword, _clone, List } from "./types.mjs";
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
        [Symbol.for("list"), (...a) => List.from([...a])],
        [Symbol.for("list?"), (a) => _isList(a)],
        [Symbol.for("vector"), (...a) => Array.from([...a])],
        [Symbol.for("vec"), (a) => Array.from(a)],
        [Symbol.for("vector?"), (a) => Object.prototype.toString.call(a) === "[object Array]"],
        [Symbol.for("cons"), (a, b) => List.from([a].concat(b))],
        [Symbol.for('conj'), (s,...a) => _isList(s) ? List.from(a.reverse().concat(s)) : Array.from(s.concat(a))],
        [Symbol.for("concat"), (...b) => List.from([].concat(...b))],
        [Symbol.for("nth"), (a, b) => b < a.length ? a[b] : _error("nth: index out of range")],
        [Symbol.for("first"), (a) => a !== null && a.length > 0 ?  a[0] : null],
        [Symbol.for("rest"), (a) => a === null ? List.from([]) : List.from(a.slice(1))],

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

        [Symbol.for("hash-map"), (...a) => _hashMap(Object.create({__type: "dictionary"}), ...a)],
        [Symbol.for("map?"), (a) => a  && a.__type === "dictionary"],
        [Symbol.for("assoc"), (a, ...b) => _hashMap(Object.assign(Object.create({__type: "dictionary"}), a), ...b) ],
        [Symbol.for("dissoc"), (a, ...b) => {
            let d = Object.assign(Object.create({__type: "dictionary"}), a);
            b.forEach(key => delete d[key]);
            return d;
        } ],
        [Symbol.for("get"), (a, b) => a && (a.__type === "dictionary" || typeof a === "object") ? a[b] : null],
        [Symbol.for("contains?"), (a, b) =>  a && a.__type === "dictionary" ? a.hasOwnProperty(b) : false],
        [Symbol.for("keys"), (a) =>  a && a.__type === "dictionary"  ? List.from([...Object.keys(a)].map(k => _keyword(k))) : List.from([])],
        [Symbol.for("vals"), (a) =>  a && a.__type === "dictionary"  ? List.from([...Object.values(a)]) : List.from([])],

        [Symbol.for("sequential?"), (a) => a instanceof Array ],
        [Symbol.for("symbol"), (a) => Symbol.for(a)],
        [Symbol.for("symbol?"), (a) => typeof a ==="symbol"],
        [Symbol.for("number?"), (a) => typeof a === "number"],
        [Symbol.for("fn?"), (a) => typeof a === "function" && !a.is_macro],
        [Symbol.for("string?"), (a) => typeof a === "string" && !_isKeyword(a)],
        [Symbol.for("seq"), (a) => a ? a.length === 0 ? null : List.from(a) : null],
        [Symbol.for("meta"), (a) => 'meta' in a ? a['meta'] : null],
        [Symbol.for("with-meta"), (a, b) => { let c = _clone(a); c.meta = b; return c }],
        [Symbol.for("macro?"), (a) => a.is_macro === true ? true : false],

        [Symbol.for("apply"), (a, ...b) => a(...b.slice(0,-1).concat(b[b.length -1]))],
        [Symbol.for("map"), (a, b) => b instanceof Array ?  Object.prototype.toString.call(b) === "[object Array]" ? Array.from(b.map(t => a(t))) : List.from(b.map(t => a(t))) : null],

        [Symbol.for("time-ms"), () => Date.now()],
    ]
)