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

export class arrowMemoryPointer {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    array_ptr: number;
    data_ptr: number;
    length: number;
    schema_ptr: number;
}

export function batch_calculate_implied_volatility(csv_content: string): Float64Array;

export function benchmark_simd_greeks(spot: number, strike: number, time: number, rate: number, vol: number, batch_size: number): any;

export function calculate_binomial_tree(spot_price: number, strike_price: number, time_to_expiry: number, risk_free_rate: number, volatility: number, steps: number): any;

export function calculate_implied_volatility(market_price: number, spot: number, strike: number, time: number, rate: number): number;

export function deterministicSeedLog(seed: number): void;

export function generate_sabr_surface(spot: number, rate: number, alpha: number, beta: number, rho: number, nu: number, strike_points: number, time_points: number): any;

export function generate_vol_surface(spot: number, rate: number, base_vol: number, strike_points: number, time_points: number): any;

export function get_wasm_memory_size(): number;

export function initThreadPool(num_threads: number): Promise<any>;

export function loadParquetToMemory(data: Uint8Array): number;

export function price_heston_american(spot: number, strike: number, time: number, rate: number, kappa: number, theta: number, sigma_v: number, rho: number, v0: number, s_steps: number, v_steps: number, t_steps: number): any;

export function price_heston_european(spot: number, strike: number, time: number, rate: number, kappa: number, theta: number, sigma_v: number, rho: number, v0: number, s_steps: number, v_steps: number, t_steps: number): any;

export function price_monte_carlo_gpu(spot: number, strike: number, time: number, rate: number, vol: number, num_paths: number, steps: number, seed: number): Promise<any>;

export function rayonWorkerPool(chunk_size: number, computations: number): number;

export function rkyvArchiveBuffer(spot: number, strikes: Float64Array, maturities: Float64Array, vol_surface: Float64Array, rates_curve: Float64Array, timestamp: bigint, computation_hash: string): Uint8Array;

export function sharedArrayLockFree(data: Float64Array, multiplier: number): void;

export function sort_colors(colors: Uint8Array): void;

export function sort_colors_with_history(colors: Uint8Array): any;

export function vannaVolgaAdjustment(spot: number, strike: number, time: number, rate: number, vol_atm: number, vol_rr: number, vol_bf: number): number;

export class wbg_rayon_PoolBuilder {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    build(): void;
    numThreads(): number;
    receiver(): number;
}

export function wbg_rayon_start_worker(receiver: number): void;

export function zeroCopyBufferView(values: Float64Array): arrowMemoryPointer;

export function zeroDecodeAccess(buffer: Uint8Array): number;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_dravyaengine_free: (a: number, b: number) => void;
    readonly batch_calculate_implied_volatility: (a: number, b: number) => [number, number, number, number];
    readonly benchmark_simd_greeks: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly calculate_binomial_tree: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
    readonly calculate_implied_volatility: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly deterministicSeedLog: (a: number) => void;
    readonly dravyaengine_new: () => number;
    readonly dravyaengine_sort_colors: (a: number, b: number, c: number, d: any) => [number, number];
    readonly dravyaengine_sort_colors_with_history: (a: number, b: number, c: number) => [number, number, number];
    readonly dravyaengine_step_count: (a: number) => number;
    readonly generate_sabr_surface: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number];
    readonly generate_vol_surface: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly get_wasm_memory_size: () => number;
    readonly price_heston_american: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number) => [number, number, number];
    readonly price_heston_european: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number) => [number, number, number];
    readonly price_monte_carlo_gpu: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => any;
    readonly sort_colors: (a: number, b: number, c: any) => void;
    readonly sort_colors_with_history: (a: number, b: number) => any;
    readonly vannaVolgaAdjustment: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
    readonly rkyvArchiveBuffer: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: bigint, k: number, l: number) => [number, number];
    readonly zeroDecodeAccess: (a: number, b: number) => number;
    readonly sharedArrayLockFree: (a: number, b: number, c: any, d: number) => void;
    readonly rayonWorkerPool: (a: number, b: number) => number;
    readonly __wbg_arrowmemorypointer_free: (a: number, b: number) => void;
    readonly __wbg_get_arrowmemorypointer_array_ptr: (a: number) => number;
    readonly __wbg_get_arrowmemorypointer_data_ptr: (a: number) => number;
    readonly __wbg_get_arrowmemorypointer_length: (a: number) => number;
    readonly __wbg_get_arrowmemorypointer_schema_ptr: (a: number) => number;
    readonly __wbg_set_arrowmemorypointer_array_ptr: (a: number, b: number) => void;
    readonly __wbg_set_arrowmemorypointer_data_ptr: (a: number, b: number) => void;
    readonly __wbg_set_arrowmemorypointer_length: (a: number, b: number) => void;
    readonly __wbg_set_arrowmemorypointer_schema_ptr: (a: number, b: number) => void;
    readonly loadParquetToMemory: (a: number, b: number) => number;
    readonly zeroCopyBufferView: (a: number, b: number) => number;
    readonly __wbg_wbg_rayon_poolbuilder_free: (a: number, b: number) => void;
    readonly initThreadPool: (a: number) => any;
    readonly wbg_rayon_poolbuilder_build: (a: number) => void;
    readonly wbg_rayon_poolbuilder_numThreads: (a: number) => number;
    readonly wbg_rayon_poolbuilder_receiver: (a: number) => number;
    readonly wbg_rayon_start_worker: (a: number) => void;
    readonly wasm_bindgen_39059793c51de849___closure__destroy___dyn_core_2be32f71e062320c___ops__function__FnMut__wasm_bindgen_39059793c51de849___JsValue____Output_______: (a: number, b: number) => void;
    readonly wasm_bindgen_39059793c51de849___closure__destroy___dyn_core_2be32f71e062320c___ops__function__FnMut__wasm_bindgen_39059793c51de849___JsValue____Output___core_2be32f71e062320c___result__Result_____wasm_bindgen_39059793c51de849___JsError___: (a: number, b: number) => void;
    readonly wasm_bindgen_39059793c51de849___convert__closures_____invoke___wasm_bindgen_39059793c51de849___JsValue__core_2be32f71e062320c___result__Result_____wasm_bindgen_39059793c51de849___JsError___true_: (a: number, b: number, c: any) => [number, number];
    readonly wasm_bindgen_39059793c51de849___convert__closures_____invoke___js_sys_765e3a270b859b1f___Function_fn_wasm_bindgen_39059793c51de849___JsValue_____wasm_bindgen_39059793c51de849___sys__Undefined___js_sys_765e3a270b859b1f___Function_fn_wasm_bindgen_39059793c51de849___JsValue_____wasm_bindgen_39059793c51de849___sys__Undefined_______true_: (a: number, b: number, c: any, d: any) => void;
    readonly wasm_bindgen_39059793c51de849___convert__closures_____invoke___wasm_bindgen_39059793c51de849___JsValue______true_: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen_39059793c51de849___convert__closures_____invoke___wasm_bindgen_39059793c51de849___JsValue______true__1: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen_39059793c51de849___convert__closures_____invoke___web_sys_e91063ee58ff89aa___features__gen_MessageEvent__MessageEvent______true_: (a: number, b: number, c: any) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
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
