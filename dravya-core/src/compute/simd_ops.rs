use core::simd::f64x2;
use core::simd::num::SimdFloat;

#[derive(Clone, Copy)]
pub struct simdVectorRegister {
    pub data: f64x2,
}

#[doc = "Version 1.1.0-val1. Non-portable: relies on wasm32-unknown-unknown architecture-specific SIMD rounding and fast-math intrinsics."]
#[inline(always)]
pub fn fast_simd_pdf(x: f64x2) -> f64x2 {
    let half = f64x2::splat(-0.5);
    let inv_sqrt_2pi = f64x2::splat(0.3989422804014327);
    
    let square = x * x;
    let exponent = half * square;
    
    let arr = exponent.to_array();
    let res = f64x2::from_array([arr[0].exp(), arr[1].exp()]);
    
    inv_sqrt_2pi * res
}

#[doc = "Version 1.0.0. Non-portable: relies on wasm32-unknown-unknown architecture-specific SIMD rounding behavior."]
#[inline(always)]
pub fn fast_simd_cdf(x: f64x2) -> f64x2 {
    let arr = x.to_array();
    let cdf0 = crate::standard_normal_cdf(arr[0]);
    let cdf1 = crate::standard_normal_cdf(arr[1]);
    f64x2::from_array([cdf0, cdf1])
}

pub fn simd_batch_greeks(
    spot: f64x2,
    strike: f64x2,
    time: f64x2,
    rate: f64x2,
    vol: f64x2,
) -> (f64x2, f64x2, f64x2) { 
    let half = f64x2::splat(0.5);
    
    let s_arr = spot.to_array();
    let k_arr = strike.to_array();
    let ln_svk = f64x2::from_array([(s_arr[0] / k_arr[0]).ln(), (s_arr[1] / k_arr[1]).ln()]);
    
    let t_arr = time.to_array();
    let sqrt_t = f64x2::from_array([t_arr[0].sqrt(), t_arr[1].sqrt()]);
    
    let vol_sqrt_t = vol * sqrt_t;
    let d1 = (ln_svk + (rate + half * vol * vol) * time) / vol_sqrt_t;
    let d2 = d1 - vol_sqrt_t;
    
    let delta = fast_simd_cdf(d1);
    
    let pdf_d1 = fast_simd_pdf(d1);
    let gamma = pdf_d1 / (spot * vol_sqrt_t);
    
    let vanna = -pdf_d1 * d2 / vol;
    
    (delta, gamma, vanna)
}
