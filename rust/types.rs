use std::rc::Rc;

#[derive(Debug)]
pub enum MalErr {
    ErrString(String)
}

pub enum _MalType {
    Nil,
    Number(i64),
    List(Vec<MalType>, MalType),
}

pub struct MalType(pub Rc<_MalType>);

impl MalType {
    pub fn nil() -> MalType {
        MalType(Rc::new(_MalType::Nil))
    }

    pub fn number(val: i64) -> MalType {
        MalType(Rc::new(_MalType::Number(val)))
    }

    pub fn list(vec: Vec<MalType>) -> MalType {
        MalType::list_with_meta(vec, MalType::nil())
    }

    pub fn list_with_meta(vec: Vec<MalType>, meta: MalType) -> MalType {
        MalType(Rc::new(_MalType::List(vec, meta)))
    }
}