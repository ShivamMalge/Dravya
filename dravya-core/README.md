# @dravya/core

`@dravya/core` is an institutional-grade, headless Rust/WebAssembly quantitative finance engine. It delivers high-fidelity stochastic modeling and risk sensitivity analysis powered by a heterogeneous compute pipeline (WebGPU + SIMD) and zero-copy memory architecture.

## System Architecture

### Heterogeneous Compute Pipeline
The engine prioritizes GPGPU acceleration for path-dependent simulations while maintaining hyper-optimized CPU fallbacks for environments without GPU access.

*   **WebGPU Monte Carlo Acceleration**: Massively parallel path generation kernels capable of simulating over 1,000,000 paths per second on client-side hardware.
*   **WASM SIMD-128**: Hardware-vectorized 128-bit math utilized for batch processing of Greeks and probability density functions, delivering 4x-10x performance gains over traditional scalar implementations.
*   **Rayon Parallelism**: Shared-memory multithreading using `SharedArrayBuffer` for CPU-intensive calibration and optimization tasks.

### High-Performance Networking & Ingestion
Designed for high-frequency trading (HFT) environments, the ingestion layer minimizes latency through SIMD-driven parsing and zero-allocation memory management.

*   **SIMD FIX Parser**: Accelerated Start-of-Header (SOH) scanning for sub-microsecond FIX message parsing.
*   **High-Frequency Streaming**: Integrated WebSocket and gRPC-Web clients optimized for high-throughput market data streams.
*   **Deterministic Ring Buffer**: Fixed-size arena allocation for incoming tick data, ensuring zero-allocation steady-state performance and preventing heap fragmentation.

### Zero-Copy Memory Management
Efficient data transfer between the Rust/WASM core and high-level TypeScript consumers is achieved through bit-exact memory mapping.

*   **Apache Arrow Bridge**: Industry-standard columnar memory format for zero-copy transfer of massive datasets (e.g., tick history or volatility grids).
*   **Rkyv Data Archiving**: Zero-deserialization state snapshots, enabling instantaneous persistence and recovery of engine states without parsing overhead.

## Financial Mathematics API

### Stochastic Volatility Models
The library implements standard institutional models with a focus on numerical stability and edge-case handling.

*   **Heston PDE Solver**: Finite Difference Method (FDM) implementation for pricing both European and American options under stochastic volatility.
*   **SABR Implied Volatility**: Hagan's asymptotic approximation for precise volatility smile modeling across varying maturities.
*   **Vanna-Volga Pricing**: Risk-reversal and butterfly adjustment methodologies for smile-aware risk management.

### Sensitivity Analysis (The Greeks)
Comprehensive Greek suite including first-order and high-order analytical sensitivities:
*   **Standard**: Delta, Gamma, Vega, Theta, Rho.
*   **Higher-Order**: Vanna, Volga (Vomma), Charm (Delta Decay), Color (Gamma Decay).

## Institutional Compliance (GCC Standard)

*   **Seed Determinism**: Fixed-seed lock via `set_prng_seed(u64)` ensures bit-perfect reproducibility across disparate hardware architectures for regulatory reporting.
*   **Zero-Telemetry Performance**: Strictly local execution with verified data localization. No outbound telemetry, analytics, or external network dependencies.
*   **Value-Breaking Versioning**: Versioning scheme includes `-val` tags to explicitly identify mathematical logic changes, facilitating seamless risk audits.

## Getting Started

### Installation
```bash
npm install @dravya/core
```

### Institutional Integration Workflow
Quantitative developers can instantiate the engine and lock the PRNG state for reproducible audits:

```typescript
import init, { DravyaEngine, set_prng_seed } from '@dravya/core';

// Initialize WASM module and lock seed for deterministic audits
await init();
set_prng_seed(5566778899n);

const engine = new DravyaEngine();

// GPU-Accelerated Monte Carlo Pricing
const mcResult = await price_monte_carlo_gpu(
  100.0,  // Spot
  105.0,  // Strike
  1.0,    // Time
  0.05,   // Rate
  0.25,   // Vol (Sigma)
  100000, // Path Count
  252,    // Time Steps
  0n      // Use Global Seed
);
```

### Zero-Copy Arrow Memory Export
Exporting huge datasets directly to analytical tools or visualization libraries:

```typescript
// Map internal engine data to a Float64Array view without copying
const bufferView = engine.zeroCopyBufferView(rawMarketData);
const ptr = bufferView.ptr(); // Raw memory address
const len = bufferView.len(); // Buffer length
```

## Documentation
For exhaustive method signatures and structure definitions, refer to the [API Reference](docs/API_REFERENCE.md).

## License
Institutional License / MIT. Refer to accompanying LICENSE file.
