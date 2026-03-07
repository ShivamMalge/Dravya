use wasm_bindgen::prelude::*;
use std::fmt;

#[derive(Debug, Clone)]
pub enum DravyaError {
    InvalidInput(String),
    InvalidCsvFormat { row_number: usize, detail: String },
    EmptyCsvInput,
    StabilityViolation(String),
    SerializationError(String),
    ComputeError(String),
    StreamingError(String),
}

impl fmt::Display for DravyaError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DravyaError::InvalidInput(msg) => write!(f, "Invalid Input: {}", msg),
            DravyaError::InvalidCsvFormat { row_number, detail } => {
                write!(f, "Invalid CSV at row {}: {}", row_number, detail)
            }
            DravyaError::EmptyCsvInput => write!(f, "Empty CSV input"),
            DravyaError::StabilityViolation(msg) => write!(f, "Stability Violation: {}", msg),
            DravyaError::SerializationError(msg) => write!(f, "Serialization Error: {}", msg),
            DravyaError::ComputeError(msg) => write!(f, "Compute Error: {}", msg),
            DravyaError::StreamingError(msg) => write!(f, "Streaming Error: {}", msg),
        }
    }
}

impl std::error::Error for DravyaError {}

impl From<DravyaError> for JsValue {
    fn from(err: DravyaError) -> JsValue {
        // Map Rust error to a standard JavaScript Error object
        let js_error = js_sys::Error::new(&err.to_string());
        JsValue::from(js_error)
    }
}
