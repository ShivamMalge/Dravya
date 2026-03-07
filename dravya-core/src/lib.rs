use wasm_bindgen::prelude::*;

pub mod data;
pub mod models;

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

fn standard_normal_cdf(x: f64) -> f64 {
    let a1 = 0.254829592;
    let a2 = -0.284496736;
    let a3 = 1.421413741;
    let a4 = -1.453152027;
    let a5 = 1.061405429;
    let p = 0.3275911;
    let sign = if x < 0.0 { -1.0 } else { 1.0 };
    let abs_x = x.abs() / core::f64::consts::SQRT_2;
    let t = 1.0 / (1.0 + p * abs_x);
    let y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * (-abs_x * abs_x).exp();
    0.5 * (1.0 + sign * y)
}

fn standard_normal_pdf(x: f64) -> f64 {
    (-0.5 * x * x).exp() / (2.0 * core::f64::consts::PI).sqrt()
}

fn bs_call_price(spot: f64, strike: f64, time: f64, rate: f64, vol: f64) -> f64 {
    if time <= 0.0 || vol <= 0.0 {
        return (spot - strike).max(0.0);
    }
    let d1 = ((spot / strike).ln() + (rate + 0.5 * vol * vol) * time) / (vol * time.sqrt());
    let d2 = d1 - vol * time.sqrt();
    spot * standard_normal_cdf(d1) - strike * (-rate * time).exp() * standard_normal_cdf(d2)
}

fn bs_vega(spot: f64, strike: f64, time: f64, rate: f64, vol: f64) -> f64 {
    if time <= 0.0 || vol <= 0.0 {
        return 0.0;
    }
    let d1 = ((spot / strike).ln() + (rate + 0.5 * vol * vol) * time) / (vol * time.sqrt());
    spot * standard_normal_pdf(d1) * time.sqrt()
}

fn newton_raphson_iv(
    market_price: f64,
    spot: f64,
    strike: f64,
    time: f64,
    rate: f64,
) -> f64 {
    let newton_tolerance = 1e-5;
    let max_iterations = 100;
    let mut implied_vol = 0.3;

    for _ in 0..max_iterations {
        let model_price = bs_call_price(spot, strike, time, rate, implied_vol);
        let vega_value = bs_vega(spot, strike, time, rate, implied_vol);

        if vega_value.abs() < 1e-12 {
            break;
        }

        let price_error = model_price - market_price;
        implied_vol -= price_error / vega_value;

        if implied_vol < 0.001 {
            implied_vol = 0.001;
        }
        if implied_vol > 5.0 {
            implied_vol = 5.0;
        }

        if price_error.abs() < newton_tolerance {
            break;
        }
    }

    (implied_vol * 1e6).round() / 1e6
}

#[derive(Serialize, Clone)]
pub struct VolSurfaceResult {
    pub implied_vol_grid: Vec<f64>,
    pub strike_axis: Vec<f64>,
    pub time_axis: Vec<f64>,
    pub grid_rows: usize,
    pub grid_cols: usize,
}

fn generate_vol_surface_data(
    spot: f64,
    rate: f64,
    base_vol: f64,
    strike_points: usize,
    time_points: usize,
) -> VolSurfaceResult {
    let strike_low = spot * 0.8;
    let strike_high = spot * 1.2;
    let time_low = 0.1;
    let time_high = 2.0;

    let mut strike_axis: Vec<f64> = Vec::with_capacity(strike_points);
    for i in 0..strike_points {
        let fraction = i as f64 / (strike_points - 1).max(1) as f64;
        let strike_val = strike_low + fraction * (strike_high - strike_low);
        strike_axis.push((strike_val * 100.0).round() / 100.0);
    }

    let mut time_axis: Vec<f64> = Vec::with_capacity(time_points);
    for j in 0..time_points {
        let fraction = j as f64 / (time_points - 1).max(1) as f64;
        let time_val = time_low + fraction * (time_high - time_low);
        time_axis.push((time_val * 1000.0).round() / 1000.0);
    }

    let mut implied_vol_grid: Vec<f64> = Vec::with_capacity(strike_points * time_points);

    for j in 0..time_points {
        let time_val = time_axis[j];
        for i in 0..strike_points {
            let strike_val = strike_axis[i];

            let moneyness = (strike_val / spot).ln();
            let skew_bump = 0.1 * moneyness * moneyness;
            let term_bump = 0.02 / time_val.sqrt();
            let synthetic_vol = base_vol + skew_bump + term_bump;

            let synthetic_market_price = bs_call_price(spot, strike_val, time_val, rate, synthetic_vol);
            let solved_iv = newton_raphson_iv(synthetic_market_price, spot, strike_val, time_val, rate);

            implied_vol_grid.push(solved_iv);
        }
    }

    VolSurfaceResult {
        implied_vol_grid,
        strike_axis,
        time_axis,
        grid_rows: time_points,
        grid_cols: strike_points,
    }
}

#[wasm_bindgen]
pub fn calculate_implied_volatility(
    market_price: f64,
    spot: f64,
    strike: f64,
    time: f64,
    rate: f64,
) -> f64 {
    newton_raphson_iv(market_price, spot, strike, time, rate)
}

#[wasm_bindgen]
pub fn generate_vol_surface(
    spot: f64,
    rate: f64,
    base_vol: f64,
    strike_points: usize,
    time_points: usize,
) -> JsValue {
    let result = generate_vol_surface_data(spot, rate, base_vol, strike_points, time_points);
    serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
}

#[wasm_bindgen]
pub fn batch_calculate_implied_volatility(csv_content: &str) -> Result<Vec<f64>, JsValue> {
    data::batch_calculate_iv(csv_content, newton_raphson_iv)
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

#[wasm_bindgen]
pub fn price_heston_european(
    spot: f64, strike: f64, time: f64, rate: f64,
    kappa: f64, theta: f64, sigma_v: f64, rho: f64, v0: f64,
    s_steps: usize, v_steps: usize, t_steps: usize
) -> Result<JsValue, JsValue> {
    let params = models::heston::HestonParams { kappa, theta, sigma_v, rho, v0 };
    let result = models::heston::solve_heston_fdm(spot, strike, time, rate, &params, false, s_steps, v_steps, t_steps)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    serde_wasm_bindgen::to_value(&result).map_err(|e| JsValue::from_str(&e.to_string()))
}

#[wasm_bindgen]
pub fn price_heston_american(
    spot: f64, strike: f64, time: f64, rate: f64,
    kappa: f64, theta: f64, sigma_v: f64, rho: f64, v0: f64,
    s_steps: usize, v_steps: usize, t_steps: usize
) -> Result<JsValue, JsValue> {
    let params = models::heston::HestonParams { kappa, theta, sigma_v, rho, v0 };
    let result = models::heston::solve_heston_fdm(spot, strike, time, rate, &params, true, s_steps, v_steps, t_steps)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    serde_wasm_bindgen::to_value(&result).map_err(|e| JsValue::from_str(&e.to_string()))
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
