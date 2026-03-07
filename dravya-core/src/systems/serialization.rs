use wasm_bindgen::prelude::*;
use rkyv::{Archive, Deserialize, Serialize, AlignedVec, ser::{Serializer, serializers::AllocSerializer}};
use rkyv::validation::validators::DefaultValidator;
use rkyv::check_archived_root;

#[derive(Archive, Deserialize, Serialize, Debug, PartialEq)]
#[archive(check_bytes)]
pub struct DravyaEngineSnapshot {
    pub spot: f64,
    pub strikes: Vec<f64>,
    pub maturities: Vec<f64>,
    pub vol_surface: Vec<f64>,
    pub rates_curve: Vec<f64>,
    pub timestamp: u64,
    pub computation_hash: String,
}

#[wasm_bindgen]
pub fn rkyvArchiveBuffer(
    spot: f64,
    strikes: &[f64],
    maturities: &[f64],
    vol_surface: &[f64],
    rates_curve: &[f64],
    timestamp: u64,
    computation_hash: &str
) -> Vec<u8> {
    let snapshot = DravyaEngineSnapshot {
        spot,
        strikes: strikes.to_vec(),
        maturities: maturities.to_vec(),
        vol_surface: vol_surface.to_vec(),
        rates_curve: rates_curve.to_vec(),
        timestamp,
        computation_hash: computation_hash.to_string(),
    };

    let mut serializer = AllocSerializer::<4096>::default();
    serializer.serialize_value(&snapshot).expect("Failed to serialize state");
    let bytes = serializer.into_serializer().into_inner();
    bytes.to_vec()
}

#[wasm_bindgen]
pub fn zeroDecodeAccess(buffer: &[u8]) -> f64 {
    // Treat the binary blob as a strictly aligned rkyv chunk and validate bounds.
    let mut aligned = AlignedVec::with_capacity(buffer.len());
    aligned.extend_from_slice(buffer);

    match check_archived_root::<DravyaEngineSnapshot>(&aligned) {
        Ok(archived) => {
            // Directly reads from the archived offset bytes, taking exactly 0 cycles of deserialization allocations.
            archived.spot.into()
        },
        Err(_) => -1.0
    }
}
