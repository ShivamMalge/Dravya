use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone)]
pub enum DravyaError {
    InvalidCsvFormat { row_number: usize, detail: String },
    EmptyCsvInput,
    StabilityViolation(String),
}

impl fmt::Display for DravyaError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DravyaError::InvalidCsvFormat { row_number, detail } => {
                write!(f, "Invalid CSV at row {}: {}", row_number, detail)
            }
            DravyaError::EmptyCsvInput => write!(f, "Empty CSV input"),
            DravyaError::StabilityViolation(msg) => write!(f, "Stability Violation: {}", msg),
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct MarketDataRow {
    pub spot: f64,
    pub strike: f64,
    pub time_to_expiry: f64,
    pub risk_free_rate: f64,
    pub market_price: f64,
    pub option_type: String,
}

pub fn parse_market_csv(csv_content: &str) -> Result<Vec<MarketDataRow>, DravyaError> {
    if csv_content.trim().is_empty() {
        return Err(DravyaError::EmptyCsvInput);
    }

    let mut csv_reader = csv::ReaderBuilder::new()
        .has_headers(true)
        .trim(csv::Trim::All)
        .from_reader(csv_content.as_bytes());

    let mut parsed_rows: Vec<MarketDataRow> = Vec::new();
    let mut row_number: usize = 1;

    for record_result in csv_reader.deserialize() {
        row_number += 1;
        let deserialied_row: MarketDataRow = record_result.map_err(|csv_err| {
            DravyaError::InvalidCsvFormat {
                row_number,
                detail: csv_err.to_string(),
            }
        })?;
        parsed_rows.push(deserialied_row);
    }

    if parsed_rows.is_empty() {
        return Err(DravyaError::EmptyCsvInput);
    }

    Ok(parsed_rows)
}

pub fn batch_calculate_iv(
    csv_content: &str,
    newton_raphson_solver: fn(f64, f64, f64, f64, f64) -> f64,
) -> Result<Vec<f64>, DravyaError> {
    let market_data = parse_market_csv(csv_content)?;
    let mut implied_vols: Vec<f64> = Vec::with_capacity(market_data.len());

    for data_row in &market_data {
        let solved_iv = newton_raphson_solver(
            data_row.market_price,
            data_row.spot,
            data_row.strike,
            data_row.time_to_expiry,
            data_row.risk_free_rate,
        );
        implied_vols.push(solved_iv);
    }

    Ok(implied_vols)
}

#[cfg(test)]
mod data_tests {
    use super::*;

    fn mock_iv_solver(_mp: f64, _s: f64, _k: f64, _t: f64, _r: f64) -> f64 {
        0.25
    }

    #[test]
    fn test_parse_valid_csv() {
        let csv_input = "spot,strike,time_to_expiry,risk_free_rate,market_price,option_type\n100,105,1.0,0.05,8.5,Call\n100,95,0.5,0.04,2.1,Put";
        let result = parse_market_csv(csv_input);
        assert!(result.is_ok());
        let rows = result.unwrap();
        assert_eq!(rows.len(), 2);
        assert_eq!(rows[0].spot, 100.0);
        assert_eq!(rows[0].strike, 105.0);
        assert_eq!(rows[1].option_type, "Put");
    }

    #[test]
    fn test_parse_empty_csv() {
        let result = parse_market_csv("");
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_invalid_csv() {
        let csv_input = "spot,strike,time_to_expiry,risk_free_rate,market_price,option_type\n100,INVALID,1.0,0.05,8.5,Call";
        let result = parse_market_csv(csv_input);
        assert!(result.is_err());
    }

    #[test]
    fn test_batch_iv() {
        let csv_input = "spot,strike,time_to_expiry,risk_free_rate,market_price,option_type\n100,105,1.0,0.05,8.5,Call\n100,95,0.5,0.04,2.1,Put";
        let result = batch_calculate_iv(csv_input, mock_iv_solver);
        assert!(result.is_ok());
        let ivs = result.unwrap();
        assert_eq!(ivs.len(), 2);
        assert_eq!(ivs[0], 0.25);
    }
}
