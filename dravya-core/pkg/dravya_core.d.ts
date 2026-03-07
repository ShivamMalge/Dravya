/* tslint:disable */
/* eslint-disable */

export class DravyaEngine {
    free(): void;
    [Symbol.dispose](): void;
    constructor();
    sort_colors(colors: Uint8Array): void;
    sort_colors_with_history(colors: Uint8Array): any;
    step_count(): number;
}

export function calculate_binomial_tree(spot_price: number, strike_price: number, time_to_expiry: number, risk_free_rate: number, volatility: number, steps: number): any;

export function get_wasm_memory_size(): number;

export function sort_colors(colors: Uint8Array): void;

export function sort_colors_with_history(colors: Uint8Array): any;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_dravyaengine_free: (a: number, b: number) => void;
    readonly calculate_binomial_tree: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
    readonly dravyaengine_new: () => number;
    readonly dravyaengine_sort_colors: (a: number, b: number, c: number, d: any) => [number, number];
    readonly dravyaengine_sort_colors_with_history: (a: number, b: number, c: number) => [number, number, number];
    readonly dravyaengine_step_count: (a: number) => number;
    readonly get_wasm_memory_size: () => number;
    readonly sort_colors: (a: number, b: number, c: any) => void;
    readonly sort_colors_with_history: (a: number, b: number) => any;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
