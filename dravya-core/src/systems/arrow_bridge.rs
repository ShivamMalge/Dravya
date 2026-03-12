use wasm_bindgen::prelude::*;
use arrow::array::{Array, Float64Array};
use arrow::ffi::{FFI_ArrowArray, FFI_ArrowSchema};
use parquet::arrow::arrow_reader::ParquetRecordBatchReaderBuilder;
use bytes::Bytes;

#[wasm_bindgen]
pub struct arrowMemoryPointer {
    pub array_ptr: usize,
    pub schema_ptr: usize,
    pub data_ptr: *const f64,
    pub length: usize,
}

#[wasm_bindgen]
pub fn zeroCopyBufferView(values: &[f64]) -> arrowMemoryPointer {
    let vec = values.to_vec();
    let array = Float64Array::from(vec.clone());
    let data = array.to_data();
    
    let ffi_array = FFI_ArrowArray::new(&data);
    let ffi_schema = FFI_ArrowSchema::try_from(array.data_type()).unwrap();
    
    let data_ptr = array.values().as_ptr();
    
    std::mem::forget(vec);
    std::mem::forget(array);
    std::mem::forget(data);
    
    let array_ptr = Box::into_raw(Box::new(ffi_array)) as usize;
    let schema_ptr = Box::into_raw(Box::new(ffi_schema)) as usize;
    
    arrowMemoryPointer {
        array_ptr,
        schema_ptr,
        data_ptr,
        length: values.len(),
    }
}

#[wasm_bindgen]
pub unsafe fn freeArrowMemory(ptr: arrowMemoryPointer) {
    let _ = Box::from_raw(ptr.array_ptr as *mut FFI_ArrowArray);
    let _ = Box::from_raw(ptr.schema_ptr as *mut FFI_ArrowSchema);
}

#[wasm_bindgen]
pub fn loadParquetToMemory(data: &[u8]) -> usize {
    let bytes = Bytes::from(data.to_vec());
    let mut total_rows = 0;
    
    if let Ok(builder) = ParquetRecordBatchReaderBuilder::try_new(bytes) {
        if let Ok(reader) = builder.build() {
            for batch in reader {
                if let Ok(record_batch) = batch {
                    total_rows += record_batch.num_rows();
                }
            }
        }
    }
    
    total_rows
}
