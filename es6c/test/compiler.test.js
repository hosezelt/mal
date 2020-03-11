import { expect } from "chai"

import { compileProgram } from "../compiler.mjs"

const is = (a, b) => {
    it(`${a} should compile to ${b}`, () => expect(compileProgram(a)).to.equal(b));
}

describe("should compile literals", () =>{
    is("nil", "void 0;")
    is("true", "true;")
    is("false", "false;")
    is("1", "1;")
    is("-1", "-1;")
    is("\"hello snip\"", "'hello snip';")
    is("()", "list();")
    is("[]", "[];")
})

describe("should correctly compile functions", () => {
    is("(fn* [a] (+ 1 a))", "a =>\n    1 + a;")
    is("(fn* [a b] (+ b a))", "(a, b) =>\n    b + a;")
})

describe("should correctly compile declarations", () => {
    is("(def! a 2)", "var a = 2;")
    is("(def! b (fn* [a] (+ 1 a)))", "var b = a =>\n    1 + a;")
})

describe("should compile invocations", () => {
    is("(+ 1 2)", "1 + 2;")
    is("(add 1 2)", "add(1, 2);")
    is("(:require [path :refer [resolve]])", "import { resolve } from \"path\"")
})
