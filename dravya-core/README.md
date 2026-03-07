# dravya-core

High-performance WASM-backed algorithmic and quantitative risk engine.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Crates.io](https://img.shields.io/crates/v/dravya-core)](https://crates.io/crates/dravya-core)

## Installation

### npm (WebAssembly)

```bash
npm install @dravya/core
```

### Cargo (Rust)

```toml
[dependencies]
dravya-core = "0.1.0"
```

## API Reference

### Sorting Engine

Dutch National Flag algorithm with step-by-step history capture.

```javascript
import init, { sort_colors, sort_colors_with_history, DravyaEngine } from '@dravya/core';

await init();

const colors = new Uint8Array([2, 0, 1, 2, 1, 0]);
sort_colors(colors);

const history = sort_colors_with_history(new Uint8Array([2, 0, 1, 2, 1, 0]));

const engine = new DravyaEngine();
engine.sort_colors(colors);
const stepCount = engine.step_count();
engine.free();
```

### Option Pricing & Greeks

Cox-Ross-Rubinstein binomial tree with Delta (Δ), Gamma (Γ), and Theta (Θ).

```javascript
import init, { calculate_binomial_tree } from '@dravya/core';

await init();

const result = calculate_binomial_tree(
    100.0,
    100.0,
    1.0,
    0.05,
    0.2,
    5
);

const optionPrice = result.final_price;
const delta = result.greeks.delta;
const gamma = result.greeks.gamma;
const theta = result.greeks.theta;
const assetLattice = result.asset_prices;
const optionLattice = result.option_values;
```

### Implied Volatility Solver

Newton-Raphson root-finding for Black-Scholes implied volatility.

```javascript
import init, { calculate_implied_volatility } from '@dravya/core';

await init();

const impliedVol = calculate_implied_volatility(
    10.45,
    100.0,
    100.0,
    1.0,
    0.05
);
```

### Volatility Surface Generation

3D implied volatility surface over a Strike × Time grid.

```javascript
import init, { generate_vol_surface } from '@dravya/core';

await init();

const surface = generate_vol_surface(
    100.0,
    0.05,
    0.25,
    15,
    15
);

const ivGrid = surface.implied_vol_grid;
const strikes = surface.strike_axis;
const times = surface.time_axis;
const rows = surface.grid_rows;
const cols = surface.grid_cols;
```

### Memory Introspection

```javascript
import init, { get_wasm_memory_size } from '@dravya/core';

await init();

const wasmBufferByteLength = get_wasm_memory_size();
```

## Exported Types

| Type | Fields |
|------|--------|
| `DravyaEngine` | Stateful engine with `sort_colors()`, `sort_colors_with_history()`, `step_count()` |
| `PricingResult` | `asset_prices`, `option_values`, `backward_steps`, `final_price`, `greeks` |
| `Greeks` | `delta`, `gamma`, `theta` |
| `VolSurfaceResult` | `implied_vol_grid`, `strike_axis`, `time_axis`, `grid_rows`, `grid_cols` |

## Building from Source

```bash
cargo install wasm-pack
wasm-pack build --target web
```

## License

MIT
