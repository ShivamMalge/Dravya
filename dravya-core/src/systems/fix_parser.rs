use wasm_bindgen::prelude::*;
use std::simd::{u8x64, cmp::SimdPartialEq};

#[wasm_bindgen]
pub struct fixSimdScanner {
    buffer: Vec<u8>,
}

#[wasm_bindgen]
impl fixSimdScanner {
    #[wasm_bindgen(constructor)]
    pub fn new() -> fixSimdScanner {
        fixSimdScanner {
            buffer: Vec::with_capacity(65536),
        }
    }

    pub fn tagValueMap(&mut self, payload: &[u8]) -> usize {
        self.buffer.clear();
        self.buffer.extend_from_slice(payload);

        let mut count = 0;
        let soh = u8x64::splat(0x01);
        
        let chunks = self.buffer.chunks_exact(64);
        let remainder = chunks.remainder();

        for chunk in chunks {
            let simd_chunk = u8x64::from_slice(chunk);
            let mask = simd_chunk.simd_eq(soh);
            count += mask.to_bitmask().count_ones() as usize;
        }

        for &byte in remainder {
            if byte == 0x01 {
                count += 1;
            }
        }
        
        count
    }
}
