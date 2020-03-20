import { List, _hashMap, _keyword } from "./types.mjs"

class Reader {
    constructor(tokens) {
        this.tokens = tokens
        this.position = 0
    }
    next() { return this.tokens[this.position++] }
    peek() { return this.tokens[this.position] }
}

function tokenize(code) {
    const re = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;

    let matches = [...code.matchAll(re)];

    return matches.map((match) => match[1]).filter((match) => match[0] !== ";");
}

function read_form(reader) {
    let token = reader.peek();

    switch (token) {
        case "@":
            reader.next()
            return List.from([Symbol.for("deref"), read_form(reader)]);
        case "'":
            reader.next()
            return List.from([Symbol.for("quote"), read_form(reader)]);
        case "`":
            reader.next()
            return List.from([Symbol.for("quasiquote"), read_form(reader)]);
        case "~":
            reader.next()
            return List.from([Symbol.for("unquote"), read_form(reader)]);
        case "~@":
            reader.next()
            return List.from([Symbol.for("splice-unquote"), read_form(reader)]);
        case "^":
            reader.next()
            var meta = read_form(reader)
            return List.from([Symbol.for("with-meta"), read_form(reader), meta]);
        case "(":
            return read_list(reader);
        case ")":
            throw new Error("Expected (")
        case "{":
            return read_hash_map(reader, "}");
        case "}":
            throw new Error("Expected {")
        case "[":
            return read_vector(reader, "]");
        case "]":
            throw new Error("Expected [")
        default:
            return read_atom(reader);
    }
}

function read_list(reader, end = ")") {
    let list = [];
    reader.next();
    let token;
    while ((token = reader.peek()) !== end) {
        if (!token) {
            throw new Error("EOF")
        }
        let item = read_form(reader);
        list.push(item);
    }
    reader.next();
    return List.from(list);
}

function read_vector(reader) {
    return Array.from(read_list(reader, "]"));
}

function read_hash_map(reader) {
    return _hashMap(Object.create({__type: "dictionary"}), ...read_list(reader, '}'))
}

function read_atom(reader) {
    const token = reader.next();

    if (token.match(/^-?[0-9]+$/)) {
        return parseInt(token);
    }
    else if (token.match(/^-?[0-9][0-9.]*$/)) {
        return parseFloat(token, 10)
    }
    else if (token.match(/^"(?:\\.|[^\\"])*"$/)) {
        return token.slice(1, token.length - 1)
            .replace(/\\(.)/g, (_, c) => c === "n" ? "\n" : c)
    }
    else if (token[0] === ":") {
        return _keyword(token.slice(1));
    }
    else if (token[0] === "\"") {
        throw new Error("expected '\"', got EOF");
    }
    else if (token === "nil") {
        return null;
    }
    else if (token === "false") {
        return false;
    }
    else if (token === "true") {
        return true;
    }
    else {
        return Symbol.for(token);
    }

}

export function read_str(code) {
    let tokens = tokenize(code);
    if (tokens.length === 0) throw new Error("Input Expected");
    let reader = new Reader(tokens);

    return read_form(reader);
}
