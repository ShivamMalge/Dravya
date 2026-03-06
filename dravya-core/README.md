# dravya-core

High-performance algorithmic visualization engine with WebAssembly support.

## Install

### Cargo (Rust)

```toml
[dependencies]
dravya-core = "0.1.0"
```

### npm (WASM)

```bash
npm install @dravya/core
```

## Usage

### WASM (Browser)

```javascript
import init, { sort_colors_with_history } from '@dravya/core';

await init();
const history = sort_colors_with_history(new Uint8Array([2, 0, 1, 2, 1, 0]));
```

`history` is a 2D array where each element is a snapshot of the array after every swap operation — perfect for step-by-step visualization.

### WASM (Stateful Engine)

```javascript
import init, { DravyaEngine } from '@dravya/core';

await init();
const engine = new DravyaEngine();
const history = engine.sort_colors_with_history(new Uint8Array([2, 0, 1, 2, 1, 0]));
console.log(engine.step_count());
```

### Rust (Native)

```rust
use dravya_core::DravyaEngine;

let mut engine = DravyaEngine::new();
let mut arr = vec![2, 0, 1, 2, 1, 0];
engine.sort_colors(&mut arr).unwrap();
assert_eq!(arr, vec![0, 0, 1, 1, 2, 2]);
```

## API

| Function | Description |
|---|---|
| `sort_colors(colors)` | In-place Dutch National Flag sort |
| `sort_colors_with_history(colors)` | Returns full swap history as 2D array |
| `DravyaEngine::new()` | Stateful engine constructor |
| `DravyaEngine::sort_colors(colors)` | Stateful in-place sort with validation |
| `DravyaEngine::sort_colors_with_history(colors)` | Stateful sort returning history |
| `DravyaEngine::step_count()` | Number of steps in last history |

## License

MIT
