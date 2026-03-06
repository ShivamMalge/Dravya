use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn sort_colors(colors: &mut [u8]) {
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
