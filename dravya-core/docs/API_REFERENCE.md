# @dravya/core API Reference

This document provides exhaustive technical documentation for the `@dravya/core` library, a headless Rust/WebAssembly quantitative finance engine.

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Financial Mathematics](#financial-mathematics)
3. [Data Ingestion & Streaming](#data-ingestion--streaming)
4. [Compliance & Determinism](#compliance--determinism)

---

## System Architecture

### Heterogeneous Compute Engine
The engine utilizes a hybrid execution model, prioritizing hardware acceleration where available.

#### WebGPU Monte Carlo
- **`price_monte_carlo_gpu(spot: f64, strike: f64, time: f64, rate: f64, vol: f64, num_paths: u32, steps: u32, seed: f64) -> Promise<JsValue>`**
  Asynchronous entry point for GPGPU-accelerated stochastic simulations. Automatically falls back to SIMD-accelerated CPU execution if WebGPU is unavailable.
- **`McParams` (Struct)**: Configuration parameters for path generation.
- **`MonteCarloResult` (Struct)**: Encapsulates final price and path statistics.

#### WASM SIMD Integration
- **`simdVectorRegister` (Struct)**: Low-level wrapper for 128-bit vector registers.
- **`simd_batch_greeks(s, k, t, r, v)`**: Computes Greeks for a batch of options utilizing wider bus widths.
- **`fast_simd_pdf` / `fast_simd_cdf`**: Hardware-vectorized implementations of standard normal distribution functions.

### Zero-Copy Data Pipelines

#### Apache Arrow Bridge
- **`zeroCopyBufferView(values: Float64Array) -> arrowMemoryPointer`**
  Creates a stable memory pointer for raw WASM linear memory, allowing direct access from high-level languages without serialization overhead.
- **`loadParquetToMemory(data: Uint8Array) -> usize`**
  Efficient ingestion of Parquet-encoded financial datasets.

#### Rkyv Serialization
- **`rkyvArchiveBuffer(engineState: DravyaEngineSnapshot) -> Uint8Array`**
  Serializes engine state into an archive that supports zero-deserialization access.
- **`zeroDecodeAccess(buffer: Uint8Array) -> f64`**
  Instantly reads specific values from an archived state without parsing the entire buffer.

---

## Financial Mathematics

### Stochastic Volatility Models

#### Heston Model (FDM)
- **`price_heston_european(...)` / `price_heston_american(...)`**
  Solves the Heston partial differential equation using Finite Difference Methods.
- **`HestonParams` (Struct)**:
  - `kappa`: Mean reversion speed
  - `theta`: Long-term variance
  - `sigma_v`: Volatility of variance (Vol-of-Vol)
  - `rho`: Correlation
  - `v0`: Initial variance

#### SABR Model
- **`haganApproximation(...)`**: Implementation of Hagan's asymptotic formula for implied volatility.
- **`generate_sabr_surface(...)`**: Generates a full volatility smile surface based on SABR parameters.
- **`SabrParams` (Struct)**: `alpha`, `beta`, `rho`, `nu`.

### Risk Management & Greeks
- **`Greeks` (Struct)**: High-precision Delta, Gamma, Theta, Vanna, Volga, Charm, and Color.
- **`vannaVolgaAdjustment(...)`**: Implementation of the Vanna-Volga pricing correction for smile dynamics.

---

## Data Ingestion & Streaming

### High-Frequency Ingestion
- **`wsMarketStream`**: WebSocket-based real-time data ingestion engine.
- **`grpcWebClient`**: Low-latency gRPC client for analytical stream consumption.

### Institutional FIX Parser
- **`fixSimdScanner`**: SIMD-accelerated scanner for SOH (Start of Header) delimiters in FIX messages.
- **`tagValueMap(...)`**: Zero-copy mapping of FIX tags to Arrow-compatible memory buffers.

### Memory Management
- **`tickRingBuffer`**: Fixed-size arena for high-frequency tick data, ensuring zero-allocation steady-state performance.
- **`arenaSteadyState()`**: Validates that all memory pools have reached a stable, non-fragmented state.

---

## Compliance & Determinism

### Reproducibility
- **`set_prng_seed(seed: u64)`**
  Explicitly locks the global PRNG state for deterministic path generation across all hardware architectures.

### Versioning
- **`get_model_version()`**: Returns the semantic version and mathematical variant ID.
- **`valueBreakingVersionCheck()`**: Programmatic check to verify if the current build includes logic changes that affect numerical outputs.

### Data Localization
All computations are strictly local to the WASM runtime environment, ensuring compliance with data residency and zero-telemetry directives.
