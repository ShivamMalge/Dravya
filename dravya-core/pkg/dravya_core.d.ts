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

export function batch_calculate_implied_volatility(csv_content: string): Float64Array;

export function calculate_binomial_tree(spot_price: number, strike_price: number, time_to_expiry: number, risk_free_rate: number, volatility: number, steps: number): any;

export function calculate_implied_volatility(market_price: number, spot: number, strike: number, time: number, rate: number): number;

export function generate_sabr_surface(spot: number, rate: number, alpha: number, beta: number, rho: number, nu: number, strike_points: number, time_points: number): any;

export function generate_vol_surface(spot: number, rate: number, base_vol: number, strike_points: number, time_points: number): any;

export function get_wasm_memory_size(): number;

export function price_heston_american(spot: number, strike: number, time: number, rate: number, kappa: number, theta: number, sigma_v: number, rho: number, v0: number, s_steps: number, v_steps: number, t_steps: number): any;

export function price_heston_european(spot: number, strike: number, time: number, rate: number, kappa: number, theta: number, sigma_v: number, rho: number, v0: number, s_steps: number, v_steps: number, t_steps: number): any;

export function sort_colors(colors: Uint8Array): void;

export function sort_colors_with_history(colors: Uint8Array): any;

export function vannaVolgaAdjustment(spot: number, strike: number, time: number, rate: number, vol_atm: number, vol_rr: number, vol_bf: number): number;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_dravyaengine_free: (a: number, b: number) => void;
    readonly batch_calculate_implied_volatility: (a: number, b: number) => [number, number, number, number];
    readonly calculate_binomial_tree: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
    readonly calculate_implied_volatility: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly dravyaengine_new: () => number;
    readonly dravyaengine_sort_colors: (a: number, b: number, c: number, d: any) => [number, number];
    readonly dravyaengine_sort_colors_with_history: (a: number, b: number, c: number) => [number, number, number];
    readonly dravyaengine_step_count: (a: number) => number;
    readonly generate_sabr_surface: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number];
    readonly generate_vol_surface: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly get_wasm_memory_size: () => number;
    readonly price_heston_american: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number) => [number, number, number];
    readonly price_heston_european: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number) => [number, number, number];
    readonly sort_colors: (a: number, b: number, c: any) => void;
    readonly sort_colors_with_history: (a: number, b: number) => any;
    readonly vannaVolgaAdjustment: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
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
