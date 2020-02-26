export const _isList = (obj) => Array.isArray(obj) && !(obj instanceof Vector) && !(_isKeyword(obj));

export class Vector extends Array { };

export function _hashMap(hm, ...args) {
    if (args.length % 2 === 1) {
        throw new Error('Odd number of assoc arguments')
    }
    for (let i = 0; i < args.length; i += 2) { hm.set(args[i], args[i + 1]) }
    return hm
};

export function _equal(a, b) {
    if (a === b) return true;

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (var i = 0; i < a.length; ++i) {
            if (!_equal(a[i], b[i])) return false;
        } 
        return true;
    }

    if (a instanceof Map && b instanceof Map) {
        for (const entry of a) {
            if(!_equal(b.get(entry[0]), entry[1])) return false;
        }
        return true
    }

    return false;
}

export const _keyword = obj => _isKeyword(obj) ? obj : '\u029e' + obj
export const _isKeyword = obj => typeof obj === 'string' && obj[0] === '\u029e'

export class Atom{
    constructor(val) {
        this.val = val;
    }
}

export function _clone(obj, new_meta) {
    let new_obj = null
    if (_isList(obj)) {
        new_obj = obj.slice(0)
    } else if (obj instanceof Vector) {
        new_obj = Vector.from(obj)
    } else if (obj instanceof Map) {
        new_obj = new Map(obj.entries())
    } else if (obj instanceof Function) {
        let f = (...a) => obj.apply(f, a)  // new function instance
        new_obj = Object.assign(f, obj)    // copy original properties
    } else {
        throw Error('Unsupported type for clone')
    }
    if (typeof new_meta !== 'undefined') { new_obj.meta = new_meta }
    return new_obj
}