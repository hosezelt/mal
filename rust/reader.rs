use lazy_static::lazy_static;
use regex::{ Regex};

pub struct Reader{
    pub tokens: Vec<String>,
    position: usize,
}


pub fn read_str(line: String) -> Reader{
    Reader {
        tokens: tokenize(&line),
        position: 0,
    }
}


fn tokenize<'a>(line: &'a str) -> Vec<String> {
    lazy_static! {
        static ref RE: Regex = Regex::new(r###"[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)"###).unwrap();
    }
    RE.find_iter(&line)
        .map(|token| String::from(token.as_str()))
        .collect()
}