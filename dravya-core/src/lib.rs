use wasm_bindgen::prelude::*;

#[derive(Clone)]
pub enum EngineError {
    InvalidInput,
}

impl From<EngineError> for JsValue {
    fn from(err: EngineError) -> JsValue {
        match err {
            EngineError::InvalidInput => JsValue::from_str("InvalidInput: array values must be 0, 1, or 2"),
        }
    }
}

fn validate_input(arr: &[u8]) -> Result<(), EngineError> {
    for val in arr {
        if *val > 2 {
            return Err(EngineError::InvalidInput);
        }
    }
    Ok(())
}

#[wasm_bindgen]
pub struct DravyaEngine {
    last_history: Vec<Vec<u8>>,
}

#[wasm_bindgen]
impl DravyaEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> DravyaEngine {
        DravyaEngine {
            last_history: Vec::new(),
        }
    }

    pub fn sort_colors(&mut self, colors: &mut [u8]) -> Result<(), JsValue> {
        validate_input(colors)?;
        dutch_national_flag_inplace(colors);
        Ok(())
    }

    pub fn sort_colors_with_history(&mut self, colors: &[u8]) -> Result<JsValue, JsValue> {
        validate_input(colors)?;
        self.last_history = dutch_national_flag_history(colors);
        serde_wasm_bindgen::to_value(&self.last_history).map_err(|e| JsValue::from_str(&e.to_string()))
    }

    pub fn step_count(&self) -> usize {
        self.last_history.len()
    }
}

#[wasm_bindgen]
pub fn sort_colors(colors: &mut [u8]) {
    dutch_national_flag_inplace(colors);
}

#[wasm_bindgen]
pub fn sort_colors_with_history(colors: &[u8]) -> JsValue {
    let history = dutch_national_flag_history(colors);
    serde_wasm_bindgen::to_value(&history).unwrap_or(JsValue::NULL)
}

fn dutch_national_flag_inplace(colors: &mut [u8]) {
    let mut low = 0;
    let mut current = 0;
    let mut high = colors.len().saturating_sub(1);

    while current <= high {
        match colors[current] {
            0 => {
                colors.swap(low, current);
                low += 1;
                current += 1;
            }
            1 => {
                current += 1;
            }
            2 => {
                colors.swap(current, high);
                if high == 0 {
                    break;
                }
                high -= 1;
            }
            _ => {
                current += 1;
            }
        }
    }
}

fn dutch_national_flag_history(colors: &[u8]) -> Vec<Vec<u8>> {
    let mut state = colors.to_vec();
    let mut step_history: Vec<Vec<u8>> = Vec::new();
    step_history.push(state.clone());

    let mut low = 0;
    let mut current = 0;
    let mut high = state.len().saturating_sub(1);

    while current <= high {
        match state[current] {
            0 => {
                state.swap(low, current);
                step_history.push(state.clone());
                low += 1;
                current += 1;
            }
            1 => {
                current += 1;
            }
            2 => {
                state.swap(current, high);
                step_history.push(state.clone());
                if high == 0 {
                    break;
                }
                high -= 1;
            }
            _ => {
                current += 1;
            }
        }
    }

    step_history
}

use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct BinomialTreeResult {
    pub asset_prices: Vec<Vec<f64>>,
    pub option_values: Vec<Vec<f64>>,
    pub backward_steps: Vec<Vec<Vec<f64>>>,
    pub final_price: f64,
}

fn binomial_tree_european_call(
    spot_price: f64,
    strike_price: f64,
    time_to_expiry: f64,
    risk_free_rate: f64,
    volatility: f64,
    steps: usize,
) -> BinomialTreeResult {
    let delta_t = time_to_expiry / steps as f64;
    let upside_factor = (volatility * delta_t.sqrt()).exp();
    let downside_factor = 1.0 / upside_factor;
    let discount_factor = (-risk_free_rate * delta_t).exp();
    let upside_probability = ((risk_free_rate * delta_t).exp() - downside_factor) / (upside_factor - downside_factor);
    let downside_probability = 1.0 - upside_probability;

    let mut asset_prices: Vec<Vec<f64>> = Vec::with_capacity(steps + 1);
    for step in 0..=steps {
        let mut level: Vec<f64> = Vec::with_capacity(step + 1);
        for node in 0..=step {
            let price = spot_price
                * upside_factor.powi((step - node) as i32)
                * downside_factor.powi(node as i32);
            level.push((price * 1e6).round() / 1e6);
        }
        asset_prices.push(level);
    }

    let terminal_count = steps + 1;
    let mut option_grid: Vec<Vec<f64>> = vec![Vec::new(); steps + 1];

    let mut terminal_values: Vec<f64> = Vec::with_capacity(terminal_count);
    for node in 0..terminal_count {
        let payoff = (asset_prices[steps][node] - strike_price).max(0.0);
        terminal_values.push((payoff * 1e6).round() / 1e6);
    }
    option_grid[steps] = terminal_values;

    let mut backward_steps: Vec<Vec<Vec<f64>>> = Vec::new();
    backward_steps.push(option_grid[steps].clone().into_iter().map(|v| vec![v]).collect());

    for step in (0..steps).rev() {
        let mut level_values: Vec<f64> = Vec::with_capacity(step + 1);
        for node in 0..=step {
            let discounted_value = discount_factor
                * (upside_probability * option_grid[step + 1][node]
                    + downside_probability * option_grid[step + 1][node + 1]);
            level_values.push((discounted_value * 1e6).round() / 1e6);
        }
        option_grid[step] = level_values;
        backward_steps.push(option_grid[step].clone().into_iter().map(|v| vec![v]).collect());
    }

    let final_price = option_grid[0][0];

    BinomialTreeResult {
        asset_prices,
        option_values: option_grid,
        backward_steps,
        final_price: (final_price * 1e6).round() / 1e6,
    }
}

#[wasm_bindgen]
pub fn calculate_binomial_tree(
    spot_price: f64,
    strike_price: f64,
    time_to_expiry: f64,
    risk_free_rate: f64,
    volatility: f64,
    steps: usize,
) -> JsValue {
    let result = binomial_tree_european_call(
        spot_price, strike_price, time_to_expiry, risk_free_rate, volatility, steps,
    );
    serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sort_colors_standard() {
        let mut arr = vec![2, 0, 2, 1, 1, 0];
        dutch_national_flag_inplace(&mut arr);
        assert_eq!(arr, vec![0, 0, 1, 1, 2, 2]);
    }

    #[test]
    fn test_sort_colors_empty() {
        let mut arr: Vec<u8> = vec![];
        dutch_national_flag_inplace(&mut arr);
        assert_eq!(arr, vec![]);
    }

    #[test]
    fn test_sort_colors_single() {
        let mut arr = vec![1];
        dutch_national_flag_inplace(&mut arr);
        assert_eq!(arr, vec![1]);
    }

    #[test]
    fn test_history_captures_all_swaps() {
        let arr = vec![2, 0, 1];
        let history = dutch_national_flag_history(&arr);
        assert!(history.len() >= 2);
        assert_eq!(history[0], vec![2, 0, 1]);
        assert_eq!(*history.last().unwrap(), vec![0, 1, 2]);
    }

    #[test]
    fn test_engine_struct() {
        let mut engine = DravyaEngine::new();
        let mut arr = vec![2, 0, 1, 1, 0, 2];
        engine.sort_colors(&mut arr).unwrap();
        assert_eq!(arr, vec![0, 0, 1, 1, 2, 2]);
    }

    #[test]
    fn test_validate_rejects_invalid() {
        let arr = vec![3, 0, 1];
        assert!(validate_input(&arr).is_err());
    }

    #[test]
    fn test_validate_accepts_valid() {
        let arr = vec![2, 0, 1, 0, 2, 1];
        assert!(validate_input(&arr).is_ok());
    }

    #[test]
    fn test_binomial_tree_produces_result() {
        let result = binomial_tree_european_call(100.0, 100.0, 1.0, 0.05, 0.2, 3);
        assert!(result.final_price > 0.0);
        assert_eq!(result.asset_prices.len(), 4);
        assert_eq!(result.option_values.len(), 4);
        assert_eq!(result.asset_prices[3].len(), 4);
    }
}
