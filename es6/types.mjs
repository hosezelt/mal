export const _isList = (obj) =>  obj && Object.prototype.toString.call(obj) === "[object List]";

export const _isVector = (obj) =>  Object.prototype.toString.call(obj) === "[object Array]";

export class List extends Array { 
    constructor() {
        super();
        this.__type = "list";
    }

    get [Symbol.toStringTag]() {
        return 'List';
      }
}

export function _hashMap(hm, ...args) {
    if (args.length % 2 === 1) {
        throw new Error('Odd number of assoc arguments')
    }
    for (let i = 0; i < args.length; i += 2) { hm[args[i]] = args[i + 1] }
    return hm
};

export function _equal(a, b) {
    if (a === b) return true;

    if(Object.prototype.toString.call(a) === "[object String]" 
        && Object.prototype.toString.call(b) === "[object String]" )
        {
            return a.toString() === b.toString()
        }

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (var i = 0; i < a.length; ++i) {
            if (!_equal(a[i], b[i])) return false;
        } 
        return true;
    }

    if (a && b && a.__type==="dictionary" && b.__type ==="dictionary") {

        for (const entry of Object.entries(a)) {
            if(!_equal(b[entry[0]], entry[1])) return false;
        }
        return true
    }

    return false;
}

export const _keyword = obj => {
    if(_isKeyword(obj)) return obj;
    let newKeyword = new String(obj);
    newKeyword.__type = "keyword";
    return newKeyword;
};

export const _isKeyword = obj => Object.prototype.toString.call(obj) ==="[object String]" && obj.__type === "keyword"

export class Atom{
    constructor(val) {
        this.val = val;
    }
}

export function _clone(obj, new_meta) {
    let new_obj = null
    if (_isList(obj)) {
        new_obj = obj.slice(0)
    } else if (obj instanceof Array) {
        new_obj = Array.from(obj)
    } else if (obj && obj.__type === "dictionary") {
        new_obj = Object.assign(Object.create({__type: "dictionary"}), obj);
    } else if (obj instanceof Function) {
        let f = (...a) => obj.apply(f, a)  // new function instance
        new_obj = Object.assign(f, obj)    // copy original properties
    } else {
        throw Error('Unsupported type for clone')
    }
    if (typeof new_meta !== 'undefined') { new_obj.meta = new_meta }
    return new_obj
}