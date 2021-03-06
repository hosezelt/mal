export class Env {
    constructor(outer, binds, exprs) {
        this.outer = outer;
        this.data = new Map();
        if(Array.isArray(binds)) {
            for (let [idx, val] of binds.entries()) {
                if(val === Symbol.for("&")) {
                    this.data.set(binds[idx + 1], exprs.slice(idx));
                    break;
                }
                else {
                    this.data.set(val, exprs[idx]);
                }
            }
        }
    }

    set(sym, mal) {
        this.data.set(sym, mal);
        return mal;
    }

    find(sym) {
        return this.data.has(sym) ? this : (this.outer ? this.outer.find(sym) : null);
    }
 
    get(sym) {
        let env = this.find(sym);
        if(!env) throw new Error(`'${Symbol.keyFor(sym)}' not found`);
        return env.data.get(sym);
    }
 }