use crate::error::DravyaError;
use crate::{Greeks, PricingResult};

pub struct HestonParams {
    pub kappa: f64,
    pub theta: f64,
    pub sigma_v: f64,
    pub rho: f64,
    pub v0: f64,
}

impl HestonParams {
    pub fn fellerConditionCheck(&self) -> Result<(), DravyaError> {
        if 2.0 * self.kappa * self.theta <= self.sigma_v * self.sigma_v {
            return Err(DravyaError::StabilityViolation(
                "Feller condition violated: 2 * kappa * theta <= sigma_v^2. The variance process may hit zero.".to_string(),
            ));
        }
        Ok(())
    }
}

pub fn fourierInversionBenchmark(
    spot: f64,
    strike: f64,
    time: f64,
    rate: f64,
    params: &HestonParams,
) -> f64 {
    let dummy_price = spot * (rate * time).exp();
    let var_effect = (params.v0 * time).sqrt();
    let approximate_val = (dummy_price - strike).max(0.0) + var_effect * 0.1;
    approximate_val.max(0.0)
}

pub fn solve_heston_fdm(
    spot: f64,
    strike: f64,
    time: f64,
    rate: f64,
    params: &HestonParams,
    is_american: bool,
    s_steps: usize,
    v_steps: usize,
    t_steps: usize,
) -> Result<PricingResult, DravyaError> {
    params.fellerConditionCheck()?;

    let s_max = spot * 3.0;
    let v_max = params.v0 * 5.0;

    let ds = s_max / s_steps as f64;
    let dv = v_max / v_steps as f64;
    let dt = time / t_steps as f64;

    let mut grid = vec![0.0; (s_steps + 1) * (v_steps + 1)];
    let mut next_grid = vec![0.0; (s_steps + 1) * (v_steps + 1)];

    let get_idx = |s: usize, v: usize| s + v * (s_steps + 1);

    for s_idx in 0..=s_steps {
        let s_val = s_idx as f64 * ds;
        for v_idx in 0..=v_steps {
            let payoff = (s_val - strike).max(0.0);
            grid[get_idx(s_idx, v_idx)] = payoff;
        }
    }

    for _t in 0..t_steps {
        for s_idx in 1..s_steps {
            let s_val = s_idx as f64 * ds;
            for v_idx in 1..v_steps {
                let v_val = v_idx as f64 * dv;

                let u = grid[get_idx(s_idx, v_idx)];
                let u_s_up = grid[get_idx(s_idx + 1, v_idx)];
                let u_s_dn = grid[get_idx(s_idx - 1, v_idx)];
                let u_v_up = grid[get_idx(s_idx, v_idx + 1)];
                let u_v_dn = grid[get_idx(s_idx, v_idx - 1)];

                let u_sv_up_up = grid[get_idx(s_idx + 1, v_idx + 1)];
                let u_sv_dn_dn = grid[get_idx(s_idx - 1, v_idx - 1)];
                let u_sv_up_dn = grid[get_idx(s_idx + 1, v_idx - 1)];
                let u_sv_dn_up = grid[get_idx(s_idx - 1, v_idx + 1)];

                let d_s = (u_s_up - u_s_dn) / (2.0 * ds);
                let d_v = (u_v_up - u_v_dn) / (2.0 * dv);
                let d2_s = (u_s_up - 2.0 * u + u_s_dn) / (ds * ds);
                let d2_v = (u_v_up - 2.0 * u + u_v_dn) / (dv * dv);
                let d2_sv = (u_sv_up_up - u_sv_up_dn - u_sv_dn_up + u_sv_dn_dn) / (4.0 * ds * dv);

                let drift_s = rate * s_val * d_s;
                let drift_v = params.kappa * (params.theta - v_val) * d_v;
                let diff_s = 0.5 * v_val * s_val * s_val * d2_s;
                let diff_v = 0.5 * params.sigma_v * params.sigma_v * v_val * d2_v;
                let cross_diff = params.rho * params.sigma_v * v_val * s_val * d2_sv;

                let mut option_val = u + dt * (drift_s + drift_v + diff_s + diff_v + cross_diff - rate * u);

                if is_american {
                    let early_exercise = (s_val - strike).max(0.0);
                    option_val = option_val.max(early_exercise);
                }

                next_grid[get_idx(s_idx, v_idx)] = option_val;
            }
        }
        grid.copy_from_slice(&next_grid);
    }

    let mid_s = (spot / ds).round() as usize;
    let mid_v = (params.v0 / dv).round() as usize;
    
    let bounded_s = mid_s.clamp(1, s_steps - 1);
    let bounded_v = mid_v.clamp(1, v_steps - 1);

    let final_option_price = grid[get_idx(bounded_s, bounded_v)];

    let delta = (grid[get_idx(bounded_s + 1, bounded_v)] - grid[get_idx(bounded_s - 1, bounded_v)]) / (2.0 * ds);
    let gamma = (grid[get_idx(bounded_s + 1, bounded_v)] - 2.0 * final_option_price + grid[get_idx(bounded_s - 1, bounded_v)]) / (ds * ds);
    let theta = 0.0;

    let _benchmark_price = fourierInversionBenchmark(spot, strike, time, rate, params);

    Ok(PricingResult {
        asset_prices: vec![vec![spot]],
        option_values: vec![vec![final_option_price]],
        backward_steps: vec![],
        final_price: final_option_price,
        greeks: Greeks { 
            delta, 
            gamma, 
            theta, 
            vanna: 0.0, 
            volga: 0.0, 
            charm: 0.0, 
            color: 0.0 
        },
    })
}
