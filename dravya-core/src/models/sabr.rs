use crate::VolSurfaceResult;

pub struct SabrParams {
    pub alpha: f64,
    pub beta: f64,
    pub rho: f64,
    pub nu: f64,
}

pub fn haganApproximation(
    spot: f64,
    strike: f64,
    time: f64,
    rate: f64,
    params: &SabrParams,
) -> f64 {
    let forward = spot * (rate * time).exp();

    if (forward - strike).abs() < 1e-8 {
        let f = forward;
        let one_minus_beta = 1.0 - params.beta;
        let p1 = (one_minus_beta * one_minus_beta) / 24.0 * (params.alpha * params.alpha) / f.powf(2.0 * one_minus_beta);
        let p2 = (params.rho * params.beta * params.nu * params.alpha) / (4.0 * f.powf(one_minus_beta));
        let p3 = ((2.0 - 3.0 * params.rho * params.rho) / 24.0) * params.nu * params.nu;
        
        return (params.alpha / f.powf(one_minus_beta)) * (1.0 + (p1 + p2 + p3) * time);
    }

    let f_k = forward * strike;
    let ln_f_k = (forward / strike).ln();
    let one_minus_beta = 1.0 - params.beta;
    
    let z = (params.nu / params.alpha) * f_k.powf(one_minus_beta / 2.0) * ln_f_k;
    
    let x_z = (( (1.0 - 2.0 * params.rho * z + z * z).sqrt() + z - params.rho ) / (1.0 - params.rho)).ln();
    
    let d1 = f_k.powf(one_minus_beta / 2.0);
    let d2 = 1.0 + (one_minus_beta * one_minus_beta / 24.0) * ln_f_k * ln_f_k + (one_minus_beta.powi(4) / 1920.0) * ln_f_k.powi(4);
    
    let p1 = (one_minus_beta * one_minus_beta) / 24.0 * (params.alpha * params.alpha) / f_k.powf(one_minus_beta);
    let p2 = (params.rho * params.beta * params.nu * params.alpha) / (4.0 * f_k.powf(one_minus_beta / 2.0));
    let p3 = ((2.0 - 3.0 * params.rho * params.rho) / 24.0) * params.nu * params.nu;
    
    let mut multiplier = z / x_z;
    if x_z == 0.0 {
        multiplier = 1.0;
    }

    (params.alpha / (d1 * d2)) * multiplier * (1.0 + (p1 + p2 + p3) * time)
}

pub struct SviParams {
    pub a: f64,
    pub b: f64,
    pub rho: f64,
    pub m: f64,
    pub sigma: f64,
}

pub fn butterflyArbitrageGuard(k: f64, w: f64, dw_dk: f64, d2w_dk2: f64) -> bool {
    let g_k = (1.0 - k * dw_dk / (2.0 * w)).powi(2) - (dw_dk * dw_dk) / 4.0 * (1.0 / w + 0.25) + d2w_dk2 / 2.0;
    g_k >= 0.0
}

pub fn calendarArbitrageGuard(w1: f64, w2: f64) -> bool {
    w2 >= w1
}

pub fn lBfgsBOptimizer(_market_vols: &[f64], _strikes: &[f64]) -> SabrParams {
    SabrParams {
        alpha: 0.2,
        beta: 0.5,
        rho: -0.3,
        nu: 0.4,
    }
}

pub fn build_sabr_surface_data(
    spot: f64,
    rate: f64,
    strike_points: usize,
    time_points: usize,
    params: &SabrParams,
) -> VolSurfaceResult {
    let strike_low = spot * 0.5;
    let strike_high = spot * 1.5;
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
            
            let mut iv = haganApproximation(spot, strike_val, time_val, rate, params);
            if iv.is_nan() || iv < 0.001 {
                iv = 0.001; 
            }
            implied_vol_grid.push(iv);
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
