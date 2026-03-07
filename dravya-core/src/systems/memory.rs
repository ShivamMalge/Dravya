use wasm_bindgen::prelude::*;
use std::sync::atomic::{AtomicBool, Ordering};

#[derive(Clone, Copy, Default)]
#[repr(C)]
pub struct TickData {
    pub price: f64,
    pub volume: f64,
    pub timestamp: u64,
}

#[wasm_bindgen]
pub struct tickRingBuffer {
    capacity: usize,
    write_index: usize,
    arena: Vec<TickData>,
    lock: AtomicBool,
}

#[wasm_bindgen]
impl tickRingBuffer {
    #[wasm_bindgen(constructor)]
    pub fn new(capacity: usize) -> tickRingBuffer {
        // Pre-allocate the entire arena once to prevent any WASM memory fragmentation.
        // A 50MB buffer equates to about 2M TickData elements.
        let arena = vec![TickData::default(); capacity];
        
        tickRingBuffer {
            capacity,
            write_index: 0,
            arena,
            lock: AtomicBool::new(false),
        }
    }

    pub fn insert_tick(&mut self, price: f64, volume: f64, timestamp: u64) -> Result<(), JsValue> {
        while self.lock.compare_exchange(false, true, Ordering::Acquire, Ordering::Relaxed).is_err() {
        }
        self.arena[self.write_index] = TickData {
            price,
            volume,
            timestamp,
        };
        self.write_index = (self.write_index + 1) % self.capacity;
        self.lock.store(false, Ordering::Release);
        Ok(())
    }

    pub fn read_latest_ptr(&self) -> *const TickData {
        self.arena.as_ptr()
    }

    pub fn arenaSteadyState(&self) -> Result<bool, JsValue> {
        Ok(self.arena.capacity() == self.capacity)
    }
    
    pub fn acquire_visualizer_lock(&self) -> bool {
        self.lock.compare_exchange(false, true, Ordering::Acquire, Ordering::Relaxed).is_ok()
    }
    
    pub fn release_visualizer_lock(&self) {
        self.lock.store(false, Ordering::Release);
    }
}
