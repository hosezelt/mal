extern crate rustyline;
extern crate regex;
extern crate lazy_static;

use rustyline::error::ReadlineError;
use rustyline::Editor;

mod types;
mod reader;
mod printer;


struct Ast {
    tokens: String
}

fn read(input: String) -> Ast {
    let test = reader::read_str(input);
    println!("{:?}", test.tokens);
    Ast { tokens: String::from("hello") }
}

fn eval(ast: Ast) -> String {
    ast.tokens
}

fn print(exp: String) -> String {
    exp
}

fn rep(line: String) -> String {
    return print(eval(read(line)));
}

fn main() {
    let mut rl = Editor::<()>::new();
    if rl.load_history("history.txt").is_err() {
        println!("No previous history.");
    }

    loop {
        let readline = rl.readline("user> ");
        match readline {
            Ok(line) => {
                rl.add_history_entry(line.as_str());
                let exp = rep(line);
                println!("{}", exp);
            },
            Err(ReadlineError::Interrupted) => {
                println!("CTRL-C");
                break
            },
            Err(ReadlineError::Eof) => {
                println!("CTRL-D");
                break
            },
            Err(err) => {
                println!("Error: {:?}", err);
                break
            }
        }
        rl.save_history("history.txt").unwrap();
    }
}