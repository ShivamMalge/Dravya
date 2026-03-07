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

#[wasm_bindgen]
pub fn get_wasm_memory_size() -> usize {
    let memory = wasm_bindgen::memory();
    let buffer = js_sys::Reflect::get(&memory, &JsValue::from_str("buffer")).unwrap_or(JsValue::NULL);
    let byte_length = js_sys::Reflect::get(&buffer, &JsValue::from_str("byteLength")).unwrap_or(JsValue::from(0));
    byte_length.as_f64().unwrap_or(0.0) as usize
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
pub struct Greeks {
    pub delta: f64,
    pub gamma: f64,
    pub theta: f64,
}

#[derive(Serialize, Clone)]
pub struct PricingResult {
    pub asset_prices: Vec<Vec<f64>>,
    pub option_values: Vec<Vec<f64>>,
    pub backward_steps: Vec<Vec<Vec<f64>>>,
    pub final_price: f64,
    pub greeks: Greeks,
}

fn binomial_tree_european_call(
    spot_price: f64,
    strike_price: f64,
    time_to_expiry: f64,
    risk_free_rate: f64,
    volatility: f64,
    steps: usize,
) -> PricingResult {
    let time_step_delta = time_to_expiry / steps as f64;
    let upside_factor = (volatility * time_step_delta.sqrt()).exp();
    let downside_factor = 1.0 / upside_factor;
    let discount_factor = (-risk_free_rate * time_step_delta).exp();
    let risk_neutral_prob = ((risk_free_rate * time_step_delta).exp() - downside_factor) / (upside_factor - downside_factor);
    let down_probability = 1.0 - risk_neutral_prob;

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
                * (risk_neutral_prob * option_grid[step + 1][node]
                    + down_probability * option_grid[step + 1][node + 1]);
            level_values.push((discounted_value * 1e6).round() / 1e6);
        }
        option_grid[step] = level_values;
        backward_steps.push(option_grid[step].clone().into_iter().map(|v| vec![v]).collect());
    }

    let final_price = option_grid[0][0];

    let node_value_up = if option_grid[1].len() > 0 { option_grid[1][0] } else { 0.0 };
    let node_value_down = if option_grid[1].len() > 1 { option_grid[1][1] } else { 0.0 };
    let asset_up = if asset_prices[1].len() > 0 { asset_prices[1][0] } else { spot_price };
    let asset_down = if asset_prices[1].len() > 1 { asset_prices[1][1] } else { spot_price };

    let asset_spread = asset_up - asset_down;
    let delta = if asset_spread.abs() > 1e-12 {
        (node_value_up - node_value_down) / asset_spread
    } else {
        0.0
    };

    let gamma = if steps >= 2 && option_grid[2].len() >= 3 {
        let node_value_uu = option_grid[2][0];
        let node_value_ud = option_grid[2][1];
        let node_value_dd = option_grid[2][2];
        let asset_uu = asset_prices[2][0];
        let asset_ud = asset_prices[2][1];
        let asset_dd = asset_prices[2][2];

        let delta_up = if (asset_uu - asset_ud).abs() > 1e-12 {
            (node_value_uu - node_value_ud) / (asset_uu - asset_ud)
        } else { 0.0 };
        let delta_down = if (asset_ud - asset_dd).abs() > 1e-12 {
            (node_value_ud - node_value_dd) / (asset_ud - asset_dd)
        } else { 0.0 };

        let h = (asset_uu - asset_dd) / 2.0;
        if h.abs() > 1e-12 { (delta_up - delta_down) / h } else { 0.0 }
    } else {
        0.0
    };

    let theta = if steps >= 2 && option_grid[2].len() >= 2 {
        let node_value_mid = option_grid[2][1];
        (node_value_mid - final_price) / (2.0 * time_step_delta)
    } else {
        0.0
    };

    let greeks = Greeks {
        delta: (delta * 1e6).round() / 1e6,
        gamma: (gamma * 1e6).round() / 1e6,
        theta: (theta * 1e6).round() / 1e6,
    };

    PricingResult {
        asset_prices,
        option_values: option_grid,
        backward_steps,
        final_price: (final_price * 1e6).round() / 1e6,
        greeks,
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
