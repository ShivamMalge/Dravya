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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sort_colors_standard() {
        let mut arr = vec![2, 0, 2, 1, 1, 0];
        sort_colors(&mut arr);
        assert_eq!(arr, vec![0, 0, 1, 1, 2, 2]);
    }

    #[test]
    fn test_sort_colors_empty() {
        let mut arr: Vec<u8> = vec![];
        sort_colors(&mut arr);
        assert_eq!(arr, vec![]);
    }

    #[test]
    fn test_sort_colors_single() {
        let mut arr = vec![1];
        sort_colors(&mut arr);
        assert_eq!(arr, vec![1]);
    }
}
