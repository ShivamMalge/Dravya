# Software Bill of Materials (SBOM) - @dravya/core

This document tracks the provenance and audit status of all dependencies used in the Dravya Core library.

## Dependency Inventory

| Crate | Version | Provenance | Audit Status |
|---|---|---|---|
| `wasm-bindgen` | 0.2 | Official | Verified |
| `serde` | 1.0 | Official | Verified |
| `csv` | 1.3 | Official | Verified |
| `wgpu` | 0.19 | Official | Verified |
| `arrow` | 54.0 | Apache | Verified |
| `parquet` | 54.0 | Apache | Verified |
| `rkyv` | 0.7 | Official | Verified |
| `rayon` | 1.8 | Official | Verified |
| `tonic` | 0.11 | Official | Verified |

## Telemetry Audit Results
- **External Telemetry**: Absolute Zero. No tracking, usage reporting, or unauthorized beacons found.
- **Data Localization**: All processing is strictly confined to the WebAssembly linear memory buffer (`SharedArrayBuffer` when using multithreading).
- **Network Isolation**: Networking is restricted to user-initiated WebSocket and gRPC-Web connections for market data ingestion only.

## Compliance
- **Regulatory Alignment**: SEBI / RBI Institutional GCC standards.
- **Determinism**: Verified cross-architecture bit-parity for stochastics.
