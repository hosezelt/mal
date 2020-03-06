import { expect } from "chai"

import { compileProgram } from "../compiler.mjs"

const ts = (a, b) => {
    it(`${a} should compile to ${b}`, () => expect(compileProgram(a)).to.equal(b));
}

describe("should compile", () =>{
    ts("(+ 1 2)", "1 + 2;")
    ts("()", "list();")
})