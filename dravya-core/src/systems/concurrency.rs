pub use wasm_bindgen_rayon::init_thread_pool;
use wasm_bindgen::prelude::*;
use rayon::prelude::*;

#[wasm_bindgen]
pub fn sharedArrayLockFree(data: &mut [f64], multiplier: f64) -> Result<(), JsValue> {
    data.par_iter_mut().for_each(|x| {
        *x *= multiplier;
    });
    Ok(())
}

#[wasm_bindgen]
pub fn rayonWorkerPool(chunk_size: usize, computations: usize) -> Result<f64, JsValue> {
    let vec: Vec<usize> = (0..computations).collect();
    let sum: usize = vec.par_chunks(chunk_size)
        .map(|chunk| {
            chunk.iter().fold(0usize, |acc, &x| acc.wrapping_add(x))
        })
        .sum();
    Ok(sum as f64)
}
