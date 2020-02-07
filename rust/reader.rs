use lazy_static::lazy_static;
use regex::{ Regex};


use crate::types::{MalType, MalErr::{self, ErrString}};

pub struct Reader {
    pub tokens: Vec<String>,
    position: usize,
}

impl Reader {
    fn next(&mut self) -> Result<String, MalErr> {
        self.position += 1;
        Ok(self.tokens
            .get(self.position - 1)
            .ok_or(ErrString("underflow".to_string()))?
            .to_string())
    }

    fn peek(&mut self) -> Result<String, MalErr> {
        Ok(self.tokens
            .get(self.position)
            .ok_or(ErrString("underflow".to_string()))?
            .to_string())
    }
}


pub fn read_str(line: String) -> Reader{
    let mut reader = Reader {
        tokens: tokenize(&line),
        position: 0,
    };

    read_form(&mut reader);
    reader
}

fn tokenize<'a>(line: &'a str) -> Vec<String> {
    lazy_static! {
        static ref RE: Regex = Regex::new(r###"[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)"###).unwrap();
    }
    RE.find_iter(&line)
        .map(|token| String::from(token.as_str()))
        .collect()
}

fn read_form(reader: &mut Reader) -> MalType {
    let token = reader.peek().unwrap();

    match token.as_str() {
        "(" => read_list(reader),
        _ => read_atom(reader),
    }
}

fn read_list(reader: &mut Reader) -> MalType {
    let mut list: Vec<MalType> = Vec::new();

    loop {
        if let token = reader.peek().unwrap() {
            if token.as_str() == ")" {
                reader.next();
                break;
            }
            list.push(read_form(reader));
        }
    }
    MalType::list(list)
}

fn read_atom(reader: &mut Reader) -> MalType {
    let token = reader.next().unwrap();
    MalType::number(token.parse().unwrap())
}

