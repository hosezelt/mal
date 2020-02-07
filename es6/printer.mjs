import { Vector, isList, _isKeyword  } from "./types.mjs"

export function pr_str(malType, printReadably) {
    if (typeof printReadably === 'undefined') { printReadably = true }
    let _r = printReadably;
    if (isList(malType)) {
        let str = malType.map(token => pr_str(token, _r)).join(" ");
        return `(${str})`
    }
    else if (malType instanceof Vector) {
        let str = malType.map(token => pr_str(token, _r)).join(" ");
        return `[${str}]`
    }
    else if (malType instanceof Map) {
        let ret = []
        for (let [k,v] of malType) {
            ret.push(pr_str(k,_r), pr_str(v,_r))
        }
        return "{" + ret.join(' ') + "}"
    }
    else if (typeof malType === "string") {
        if (_isKeyword(malType)) {
            return ":" + malType.slice(1);
        }
        if (_r) {
            return '"' + malType.replace(/\\/g, "\\\\")
                .replace(/"/g, '\\"')
                .replace(/\n/g, "\\n") + '"'
        } else {
            return malType;
        }
    }
    else if (typeof malType === 'symbol') {
        return Symbol.keyFor(malType)
    }
    else if (malType === null) {
        return "nil";
    }
    else if (malType === false) {
        return "false";
    }
    else if (malType === true) {
        return "true";
    }
    else if (typeof malType === "function") {
        return "#<function>";
    }
    else{
        return malType.toString();
    }
}