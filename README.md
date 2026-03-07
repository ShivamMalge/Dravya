# Dravya Engine

![Dravya Header](https://raw.githubusercontent.com/ShivamMalge/Dravya/main/dravya-web/public/favicon.ico)

**Dravya Engine** is a high-performance quantitative risk and algorithmic visualization engine. It bridges the gap between massive numerical processing and immersive browser-based 3D visualization by pairing a **Rust/WebAssembly** mathematical core with a **Next.js + Three.js** frontend.

## Features

### 1. Quantitative Finance Models
- **Binomial Lattice Engine:** A Cox-Ross-Rubinstein tree model calculating European option pricing and risk derivatives (Delta, Gamma, Theta). Visualized as a true 3D spatial node structure mapping Time, Asset Price, and Option Value.
- **Volatility Surface Mesh:** A Newton-Raphson implied volatility solver iterating over Strike × Time grids to generate continuous 3D volatility surface meshes.

### 2. Algorithmic Visualizations
- **Sorting Diagnostics:** Visualizes the memory states of algorithms like the Dutch National Flag in real-time, pulling state transitions directly from the Rust engine.
- **Hardware Telemetry:** Direct memory introspection exposing WASM linear memory boundaries versus garbage-collected JS heap allocations during stress testing.

## Tech Stack

- **Core Engine:** Rust, WebAssembly (`wasm-bindgen`), Serde
- **Frontend App:** Next.js (App Router), React, TypeScript
- **3D Graphics:** Three.js, React-Three-Fiber, Drei
- **Data Ingestion:** Rust `csv` parser for batch quantitative compute

## Architecture

The project relies on a strict monorepo layout:

```
Dravya/
├── dravya-core/       # Rust Mathematics + WASM Exporter
│   ├── src/
│   │   ├── lib.rs     # Options Math, IV Solvers, WASM Bindings
│   │   └── data.rs    # CSV parsing and batch math logic
│   └── Cargo.toml
│
└── dravya-web/        # Next.js Application
    ├── public/wasm/   # Built WASM module outputs
    └── src/
        ├── app/       # UI Dashboard and Layouts
        └── components/# Three.js Canvases (Tree, Surface, Axes3D)
```

## Running Locally

### Prerequisites
- Node.js > 18
- Rust toolchain (`rustup`)
- `wasm-pack` (`cargo install wasm-pack`)

### 1. Build the WASM Core
```bash
cd dravya-core
wasm-pack build --target web

# Copy the generated /pkg to the web public folder
cp pkg/dravya_core.js ../dravya-web/public/wasm/
cp pkg/dravya_core_bg.wasm ../dravya-web/public/wasm/
```
*(Note: Windows users can use the equivalent `Copy-Item` in PowerShell).*

### 2. Run the Next.js Frontend
```bash
cd ../dravya-web
npm install
npm run dev
```

Navigate to `http://localhost:3000` to interact with the engine.

## NPM Package
The core Rust engine is available purely as a standalone NPM package for server-side or frontend execution via JS bindings:

```bash
npm install @dravya/core
```

For package usage instructions, see the [`dravya-core` README](./dravya-core/README.md).

## License

MIT
