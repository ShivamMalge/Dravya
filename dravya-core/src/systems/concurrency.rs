pub use wasm_bindgen_rayon::init_thread_pool;
use wasm_bindgen::prelude::*;
use rayon::prelude::*;

#[wasm_bindgen]
pub fn sharedArrayLockFree(data: &mut [f64], multiplier: f64) {
    // This requires a `SharedArrayBuffer` from JS, passed dynamically over the WASM boundary.
    // Rayon uses `par_iter_mut` to divide the array evenly among pre-instantiated workers in an lock-free manner.
    data.par_iter_mut().for_each(|x| {
        *x *= multiplier;
    });
}

#[wasm_bindgen]
pub fn rayonWorkerPool(chunk_size: usize, computations: usize) -> f64 {
    // Dispatch massive batch-processing workloads across the static Worker Pool.
    let vec: Vec<usize> = (0..computations).collect();
    
    // Reduces down across chunks processing in parallel threads.
    let sum: usize = vec.par_chunks(chunk_size)
        .map(|chunk| {
            chunk.iter().fold(0usize, |acc, &x| acc.wrapping_add(x))
        })
        .sum();
        
    sum as f64
}
