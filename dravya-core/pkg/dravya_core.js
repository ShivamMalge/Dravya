/* @ts-self-types="./dravya_core.d.ts" */

export class DravyaEngine {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DravyaEngineFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_dravyaengine_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.dravyaengine_new();
        this.__wbg_ptr = ret >>> 0;
        DravyaEngineFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {Uint8Array} colors
     */
    sort_colors(colors) {
        var ptr0 = passArray8ToWasm0(colors, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.dravyaengine_sort_colors(this.__wbg_ptr, ptr0, len0, colors);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {Uint8Array} colors
     * @returns {any}
     */
    sort_colors_with_history(colors) {
        const ptr0 = passArray8ToWasm0(colors, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.dravyaengine_sort_colors_with_history(this.__wbg_ptr, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @returns {number}
     */
    step_count() {
        const ret = wasm.dravyaengine_step_count(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) DravyaEngine.prototype[Symbol.dispose] = DravyaEngine.prototype.free;

export class arrowMemoryPointer {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(arrowMemoryPointer.prototype);
        obj.__wbg_ptr = ptr;
        arrowMemoryPointerFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        arrowMemoryPointerFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_arrowmemorypointer_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get array_ptr() {
        const ret = wasm.__wbg_get_arrowmemorypointer_array_ptr(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get data_ptr() {
        const ret = wasm.__wbg_get_arrowmemorypointer_data_ptr(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get length() {
        const ret = wasm.__wbg_get_arrowmemorypointer_length(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get schema_ptr() {
        const ret = wasm.__wbg_get_arrowmemorypointer_schema_ptr(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set array_ptr(arg0) {
        wasm.__wbg_set_arrowmemorypointer_array_ptr(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set data_ptr(arg0) {
        wasm.__wbg_set_arrowmemorypointer_data_ptr(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set length(arg0) {
        wasm.__wbg_set_arrowmemorypointer_length(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set schema_ptr(arg0) {
        wasm.__wbg_set_arrowmemorypointer_schema_ptr(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) arrowMemoryPointer.prototype[Symbol.dispose] = arrowMemoryPointer.prototype.free;

/**
 * @param {string} csv_content
 * @returns {Float64Array}
 */
export function batch_calculate_implied_volatility(csv_content) {
    const ptr0 = passStringToWasm0(csv_content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.batch_calculate_implied_volatility(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v2;
}

/**
 * @param {number} spot
 * @param {number} strike
 * @param {number} time
 * @param {number} rate
 * @param {number} vol
 * @param {number} batch_size
 * @returns {any}
 */
export function benchmark_simd_greeks(spot, strike, time, rate, vol, batch_size) {
    const ret = wasm.benchmark_simd_greeks(spot, strike, time, rate, vol, batch_size);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {number} spot_price
 * @param {number} strike_price
 * @param {number} time_to_expiry
 * @param {number} risk_free_rate
 * @param {number} volatility
 * @param {number} steps
 * @returns {any}
 */
export function calculate_binomial_tree(spot_price, strike_price, time_to_expiry, risk_free_rate, volatility, steps) {
    const ret = wasm.calculate_binomial_tree(spot_price, strike_price, time_to_expiry, risk_free_rate, volatility, steps);
    return ret;
}

/**
 * @param {number} market_price
 * @param {number} spot
 * @param {number} strike
 * @param {number} time
 * @param {number} rate
 * @returns {number}
 */
export function calculate_implied_volatility(market_price, spot, strike, time, rate) {
    const ret = wasm.calculate_implied_volatility(market_price, spot, strike, time, rate);
    return ret;
}

/**
 * @param {number} seed
 */
export function deterministicSeedLog(seed) {
    wasm.deterministicSeedLog(seed);
}

/**
 * @param {number} spot
 * @param {number} rate
 * @param {number} alpha
 * @param {number} beta
 * @param {number} rho
 * @param {number} nu
 * @param {number} strike_points
 * @param {number} time_points
 * @returns {any}
 */
export function generate_sabr_surface(spot, rate, alpha, beta, rho, nu, strike_points, time_points) {
    const ret = wasm.generate_sabr_surface(spot, rate, alpha, beta, rho, nu, strike_points, time_points);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {number} spot
 * @param {number} rate
 * @param {number} base_vol
 * @param {number} strike_points
 * @param {number} time_points
 * @returns {any}
 */
export function generate_vol_surface(spot, rate, base_vol, strike_points, time_points) {
    const ret = wasm.generate_vol_surface(spot, rate, base_vol, strike_points, time_points);
    return ret;
}

/**
 * @returns {number}
 */
export function get_wasm_memory_size() {
    const ret = wasm.get_wasm_memory_size();
    return ret >>> 0;
}

/**
 * @param {Uint8Array} data
 * @returns {number}
 */
export function loadParquetToMemory(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.loadParquetToMemory(ptr0, len0);
    return ret >>> 0;
}

/**
 * @param {number} spot
 * @param {number} strike
 * @param {number} time
 * @param {number} rate
 * @param {number} kappa
 * @param {number} theta
 * @param {number} sigma_v
 * @param {number} rho
 * @param {number} v0
 * @param {number} s_steps
 * @param {number} v_steps
 * @param {number} t_steps
 * @returns {any}
 */
export function price_heston_american(spot, strike, time, rate, kappa, theta, sigma_v, rho, v0, s_steps, v_steps, t_steps) {
    const ret = wasm.price_heston_american(spot, strike, time, rate, kappa, theta, sigma_v, rho, v0, s_steps, v_steps, t_steps);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {number} spot
 * @param {number} strike
 * @param {number} time
 * @param {number} rate
 * @param {number} kappa
 * @param {number} theta
 * @param {number} sigma_v
 * @param {number} rho
 * @param {number} v0
 * @param {number} s_steps
 * @param {number} v_steps
 * @param {number} t_steps
 * @returns {any}
 */
export function price_heston_european(spot, strike, time, rate, kappa, theta, sigma_v, rho, v0, s_steps, v_steps, t_steps) {
    const ret = wasm.price_heston_european(spot, strike, time, rate, kappa, theta, sigma_v, rho, v0, s_steps, v_steps, t_steps);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {number} spot
 * @param {number} strike
 * @param {number} time
 * @param {number} rate
 * @param {number} vol
 * @param {number} num_paths
 * @param {number} steps
 * @param {number} seed
 * @returns {Promise<any>}
 */
export function price_monte_carlo_gpu(spot, strike, time, rate, vol, num_paths, steps, seed) {
    const ret = wasm.price_monte_carlo_gpu(spot, strike, time, rate, vol, num_paths, steps, seed);
    return ret;
}

/**
 * @param {number} spot
 * @param {Float64Array} strikes
 * @param {Float64Array} maturities
 * @param {Float64Array} vol_surface
 * @param {Float64Array} rates_curve
 * @param {bigint} timestamp
 * @param {string} computation_hash
 * @returns {Uint8Array}
 */
export function rkyvArchiveBuffer(spot, strikes, maturities, vol_surface, rates_curve, timestamp, computation_hash) {
    const ptr0 = passArrayF64ToWasm0(strikes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(maturities, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayF64ToWasm0(vol_surface, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArrayF64ToWasm0(rates_curve, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    const ptr4 = passStringToWasm0(computation_hash, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len4 = WASM_VECTOR_LEN;
    const ret = wasm.rkyvArchiveBuffer(spot, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, timestamp, ptr4, len4);
    var v6 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v6;
}

/**
 * @param {Uint8Array} colors
 */
export function sort_colors(colors) {
    var ptr0 = passArray8ToWasm0(colors, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    wasm.sort_colors(ptr0, len0, colors);
}

/**
 * @param {Uint8Array} colors
 * @returns {any}
 */
export function sort_colors_with_history(colors) {
    const ptr0 = passArray8ToWasm0(colors, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.sort_colors_with_history(ptr0, len0);
    return ret;
}

/**
 * @param {number} spot
 * @param {number} strike
 * @param {number} time
 * @param {number} rate
 * @param {number} vol_atm
 * @param {number} vol_rr
 * @param {number} vol_bf
 * @returns {number}
 */
export function vannaVolgaAdjustment(spot, strike, time, rate, vol_atm, vol_rr, vol_bf) {
    const ret = wasm.vannaVolgaAdjustment(spot, strike, time, rate, vol_atm, vol_rr, vol_bf);
    return ret;
}

/**
 * @param {Float64Array} values
 * @returns {arrowMemoryPointer}
 */
export function zeroCopyBufferView(values) {
    const ptr0 = passArrayF64ToWasm0(values, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.zeroCopyBufferView(ptr0, len0);
    return arrowMemoryPointer.__wrap(ret);
}

/**
 * @param {Uint8Array} buffer
 * @returns {number}
 */
export function zeroDecodeAccess(buffer) {
    const ptr0 = passArray8ToWasm0(buffer, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.zeroDecodeAccess(ptr0, len0);
    return ret;
}

function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_Error_83742b46f01ce22d: function(arg0, arg1) {
            const ret = Error(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_String_8564e559799eccda: function(arg0, arg1) {
            const ret = String(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_Window_84483f7af9c60d06: function(arg0) {
            const ret = arg0.Window;
            return ret;
        },
        __wbg_WorkerGlobalScope_ab3a96a72cd85de0: function(arg0) {
            const ret = arg0.WorkerGlobalScope;
            return ret;
        },
        __wbg___wbindgen_copy_to_typed_array_d2f20acdab8e0740: function(arg0, arg1, arg2) {
            new Uint8Array(arg2.buffer, arg2.byteOffset, arg2.byteLength).set(getArrayU8FromWasm0(arg0, arg1));
        },
        __wbg___wbindgen_debug_string_5398f5bb970e0daa: function(arg0, arg1) {
            const ret = debugString(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_is_function_3c846841762788c1: function(arg0) {
            const ret = typeof(arg0) === 'function';
            return ret;
        },
        __wbg___wbindgen_is_object_781bc9f159099513: function(arg0) {
            const val = arg0;
            const ret = typeof(val) === 'object' && val !== null;
            return ret;
        },
        __wbg___wbindgen_is_undefined_52709e72fb9f179c: function(arg0) {
            const ret = arg0 === undefined;
            return ret;
        },
        __wbg___wbindgen_memory_edb3f01e3930bbf6: function() {
            const ret = wasm.memory;
            return ret;
        },
        __wbg___wbindgen_number_get_34bb9d9dcfa21373: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_string_get_395e606bd0ee4427: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_6ddd609b62940d55: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg__wbg_cb_unref_6b5b6b8576d35cb1: function(arg0) {
            arg0._wbg_cb_unref();
        },
        __wbg_beginComputePass_9375c71b502a0455: function(arg0, arg1) {
            const ret = arg0.beginComputePass(arg1);
            return ret;
        },
        __wbg_beginRenderPass_fd9b3599b40a4e9d: function(arg0, arg1) {
            const ret = arg0.beginRenderPass(arg1);
            return ret;
        },
        __wbg_buffer_60b8043cd926067d: function(arg0) {
            const ret = arg0.buffer;
            return ret;
        },
        __wbg_call_2d781c1f4d5c0ef8: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.call(arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_clearBuffer_b84962a8f0aa90b1: function(arg0, arg1, arg2, arg3) {
            arg0.clearBuffer(arg1, arg2, arg3);
        },
        __wbg_clearBuffer_f84175d32a71c1db: function(arg0, arg1, arg2) {
            arg0.clearBuffer(arg1, arg2);
        },
        __wbg_configure_97342a5a768c09bf: function(arg0, arg1) {
            arg0.configure(arg1);
        },
        __wbg_copyBufferToBuffer_ff5f3818f4aae39f: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            arg0.copyBufferToBuffer(arg1, arg2, arg3, arg4, arg5);
        },
        __wbg_copyBufferToTexture_66b359a9bd725e76: function(arg0, arg1, arg2, arg3) {
            arg0.copyBufferToTexture(arg1, arg2, arg3);
        },
        __wbg_copyExternalImageToTexture_0244f8dd1e9d3666: function(arg0, arg1, arg2, arg3) {
            arg0.copyExternalImageToTexture(arg1, arg2, arg3);
        },
        __wbg_copyTextureToBuffer_ed31c6ed5fb0a178: function(arg0, arg1, arg2, arg3) {
            arg0.copyTextureToBuffer(arg1, arg2, arg3);
        },
        __wbg_copyTextureToTexture_fe5c187e35852e73: function(arg0, arg1, arg2, arg3) {
            arg0.copyTextureToTexture(arg1, arg2, arg3);
        },
        __wbg_createBindGroupLayout_4bafc99be90ff601: function(arg0, arg1) {
            const ret = arg0.createBindGroupLayout(arg1);
            return ret;
        },
        __wbg_createBindGroup_754d11219b67ca3a: function(arg0, arg1) {
            const ret = arg0.createBindGroup(arg1);
            return ret;
        },
        __wbg_createBuffer_585f53c980a46c80: function(arg0, arg1) {
            const ret = arg0.createBuffer(arg1);
            return ret;
        },
        __wbg_createCommandEncoder_5245feb4bc162e3b: function(arg0, arg1) {
            const ret = arg0.createCommandEncoder(arg1);
            return ret;
        },
        __wbg_createComputePipeline_c503d3663c315b5d: function(arg0, arg1) {
            const ret = arg0.createComputePipeline(arg1);
            return ret;
        },
        __wbg_createPipelineLayout_f5affbb320321657: function(arg0, arg1) {
            const ret = arg0.createPipelineLayout(arg1);
            return ret;
        },
        __wbg_createQuerySet_7ea147f670344315: function(arg0, arg1) {
            const ret = arg0.createQuerySet(arg1);
            return ret;
        },
        __wbg_createRenderBundleEncoder_09daab6411147213: function(arg0, arg1) {
            const ret = arg0.createRenderBundleEncoder(arg1);
            return ret;
        },
        __wbg_createRenderPipeline_19c47d00e98d4d60: function(arg0, arg1) {
            const ret = arg0.createRenderPipeline(arg1);
            return ret;
        },
        __wbg_createSampler_58b4fb3e4edaac2f: function(arg0, arg1) {
            const ret = arg0.createSampler(arg1);
            return ret;
        },
        __wbg_createShaderModule_ee0f8a959b0f7694: function(arg0, arg1) {
            const ret = arg0.createShaderModule(arg1);
            return ret;
        },
        __wbg_createTexture_b0f46a76611fcc11: function(arg0, arg1) {
            const ret = arg0.createTexture(arg1);
            return ret;
        },
        __wbg_createView_ea89449bf935aae8: function(arg0, arg1) {
            const ret = arg0.createView(arg1);
            return ret;
        },
        __wbg_destroy_4e983840e408b877: function(arg0) {
            arg0.destroy();
        },
        __wbg_destroy_850986b5679d1c9a: function(arg0) {
            arg0.destroy();
        },
        __wbg_destroy_dbabe68ae90d269e: function(arg0) {
            arg0.destroy();
        },
        __wbg_dispatchWorkgroupsIndirect_dbd5b7b0b3c254b4: function(arg0, arg1, arg2) {
            arg0.dispatchWorkgroupsIndirect(arg1, arg2);
        },
        __wbg_dispatchWorkgroups_6ee9d5a6ce45b349: function(arg0, arg1, arg2, arg3) {
            arg0.dispatchWorkgroups(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0);
        },
        __wbg_document_c0320cd4183c6d9b: function(arg0) {
            const ret = arg0.document;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_drawIndexedIndirect_ccdd49ad96c56a1f: function(arg0, arg1, arg2) {
            arg0.drawIndexedIndirect(arg1, arg2);
        },
        __wbg_drawIndexedIndirect_d471e7025af81960: function(arg0, arg1, arg2) {
            arg0.drawIndexedIndirect(arg1, arg2);
        },
        __wbg_drawIndexed_1702492d59a47fd1: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            arg0.drawIndexed(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4, arg5 >>> 0);
        },
        __wbg_drawIndexed_65b316e01808838f: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            arg0.drawIndexed(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4, arg5 >>> 0);
        },
        __wbg_drawIndirect_21df95add1c99821: function(arg0, arg1, arg2) {
            arg0.drawIndirect(arg1, arg2);
        },
        __wbg_drawIndirect_e70b1c753d40ae86: function(arg0, arg1, arg2) {
            arg0.drawIndirect(arg1, arg2);
        },
        __wbg_draw_39f93fd169d46879: function(arg0, arg1, arg2, arg3, arg4) {
            arg0.draw(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
        },
        __wbg_draw_ed75a545c7294fd4: function(arg0, arg1, arg2, arg3, arg4) {
            arg0.draw(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
        },
        __wbg_end_0f83bf598d056f18: function(arg0) {
            arg0.end();
        },
        __wbg_end_83ca5b2c3a835c0f: function(arg0) {
            arg0.end();
        },
        __wbg_error_0bfcc2fa021d2d65: function(arg0) {
            const ret = arg0.error;
            return ret;
        },
        __wbg_executeBundles_eca349a0aa326da6: function(arg0, arg1) {
            arg0.executeBundles(arg1);
        },
        __wbg_features_62957b709b1920ad: function(arg0) {
            const ret = arg0.features;
            return ret;
        },
        __wbg_features_a1d3722fcf227919: function(arg0) {
            const ret = arg0.features;
            return ret;
        },
        __wbg_finish_9153ab51653482f3: function(arg0) {
            const ret = arg0.finish();
            return ret;
        },
        __wbg_finish_a208817305958f64: function(arg0) {
            const ret = arg0.finish();
            return ret;
        },
        __wbg_finish_af20f6b480146535: function(arg0, arg1) {
            const ret = arg0.finish(arg1);
            return ret;
        },
        __wbg_finish_ed287af5f0b31c21: function(arg0, arg1) {
            const ret = arg0.finish(arg1);
            return ret;
        },
        __wbg_getBindGroupLayout_a355dd2e3f85e6a7: function(arg0, arg1) {
            const ret = arg0.getBindGroupLayout(arg1 >>> 0);
            return ret;
        },
        __wbg_getBindGroupLayout_c4e025f3bd535641: function(arg0, arg1) {
            const ret = arg0.getBindGroupLayout(arg1 >>> 0);
            return ret;
        },
        __wbg_getContext_a9236f98f1f7fe7c: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.getContext(getStringFromWasm0(arg1, arg2));
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        }, arguments); },
        __wbg_getContext_f04bf8f22dcb2d53: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.getContext(getStringFromWasm0(arg1, arg2));
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        }, arguments); },
        __wbg_getCurrentTexture_fe2f125c8290a060: function(arg0) {
            const ret = arg0.getCurrentTexture();
            return ret;
        },
        __wbg_getMappedRange_dfe3aadc720182df: function(arg0, arg1, arg2) {
            const ret = arg0.getMappedRange(arg1, arg2);
            return ret;
        },
        __wbg_getPreferredCanvasFormat_1526aa242f263004: function(arg0) {
            const ret = arg0.getPreferredCanvasFormat();
            return (__wbindgen_enum_GpuTextureFormat.indexOf(ret) + 1 || 95) - 1;
        },
        __wbg_get_3ef1eba1850ade27: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(arg0, arg1);
            return ret;
        }, arguments); },
        __wbg_get_c7546417fb0bec10: function(arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_gpu_a3357ac66c09a517: function(arg0) {
            const ret = arg0.gpu;
            return ret;
        },
        __wbg_has_934262a65a914df3: function(arg0, arg1, arg2) {
            const ret = arg0.has(getStringFromWasm0(arg1, arg2));
            return ret;
        },
        __wbg_instanceof_GpuAdapter_812393144f747a28: function(arg0) {
            let result;
            try {
                result = arg0 instanceof GPUAdapter;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_GpuCanvasContext_7d8c2aee896960ef: function(arg0) {
            let result;
            try {
                result = arg0 instanceof GPUCanvasContext;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_GpuOutOfMemoryError_5661073b28c982a3: function(arg0) {
            let result;
            try {
                result = arg0 instanceof GPUOutOfMemoryError;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_GpuValidationError_b2b2abc70da536b4: function(arg0) {
            let result;
            try {
                result = arg0 instanceof GPUValidationError;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Object_be1962063fcc0c9f: function(arg0) {
            let result;
            try {
                result = arg0 instanceof Object;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Window_23e677d2c6843922: function(arg0) {
            let result;
            try {
                result = arg0 instanceof Window;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_label_0ff434301c1dc29f: function(arg0, arg1) {
            const ret = arg1.label;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_length_ea16607d7b61445b: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_limits_00c50879fa9a15a7: function(arg0) {
            const ret = arg0.limits;
            return ret;
        },
        __wbg_limits_94f1cd0da18d4c22: function(arg0) {
            const ret = arg0.limits;
            return ret;
        },
        __wbg_log_524eedafa26daa59: function(arg0) {
            console.log(arg0);
        },
        __wbg_mapAsync_5dd79aaf4f56c0f0: function(arg0, arg1, arg2, arg3) {
            const ret = arg0.mapAsync(arg1 >>> 0, arg2, arg3);
            return ret;
        },
        __wbg_maxBindGroups_d7b545d814773df1: function(arg0) {
            const ret = arg0.maxBindGroups;
            return ret;
        },
        __wbg_maxBindingsPerBindGroup_b26d015df21bbdfa: function(arg0) {
            const ret = arg0.maxBindingsPerBindGroup;
            return ret;
        },
        __wbg_maxBufferSize_de4fb5ea32634d2e: function(arg0) {
            const ret = arg0.maxBufferSize;
            return ret;
        },
        __wbg_maxComputeInvocationsPerWorkgroup_b666c8d42afcfb7c: function(arg0) {
            const ret = arg0.maxComputeInvocationsPerWorkgroup;
            return ret;
        },
        __wbg_maxComputeWorkgroupSizeX_bfe6212af4533b2f: function(arg0) {
            const ret = arg0.maxComputeWorkgroupSizeX;
            return ret;
        },
        __wbg_maxComputeWorkgroupSizeY_31156375aa7b93a4: function(arg0) {
            const ret = arg0.maxComputeWorkgroupSizeY;
            return ret;
        },
        __wbg_maxComputeWorkgroupSizeZ_9c96c3749eb89a89: function(arg0) {
            const ret = arg0.maxComputeWorkgroupSizeZ;
            return ret;
        },
        __wbg_maxComputeWorkgroupStorageSize_d4d4f855ff543384: function(arg0) {
            const ret = arg0.maxComputeWorkgroupStorageSize;
            return ret;
        },
        __wbg_maxComputeWorkgroupsPerDimension_d3c6855db6a1497a: function(arg0) {
            const ret = arg0.maxComputeWorkgroupsPerDimension;
            return ret;
        },
        __wbg_maxDynamicStorageBuffersPerPipelineLayout_4a71448e3d67653e: function(arg0) {
            const ret = arg0.maxDynamicStorageBuffersPerPipelineLayout;
            return ret;
        },
        __wbg_maxDynamicUniformBuffersPerPipelineLayout_5d7e7ab3786be24d: function(arg0) {
            const ret = arg0.maxDynamicUniformBuffersPerPipelineLayout;
            return ret;
        },
        __wbg_maxInterStageShaderComponents_9d05c7ae8c47498d: function(arg0) {
            const ret = arg0.maxInterStageShaderComponents;
            return ret;
        },
        __wbg_maxSampledTexturesPerShaderStage_672c74b8d59a31cc: function(arg0) {
            const ret = arg0.maxSampledTexturesPerShaderStage;
            return ret;
        },
        __wbg_maxSamplersPerShaderStage_b417de86ba96244d: function(arg0) {
            const ret = arg0.maxSamplersPerShaderStage;
            return ret;
        },
        __wbg_maxStorageBufferBindingSize_fcff90d733f4dff6: function(arg0) {
            const ret = arg0.maxStorageBufferBindingSize;
            return ret;
        },
        __wbg_maxStorageBuffersPerShaderStage_bf5d03da6fbc393e: function(arg0) {
            const ret = arg0.maxStorageBuffersPerShaderStage;
            return ret;
        },
        __wbg_maxStorageTexturesPerShaderStage_4b8048876f1a3bfe: function(arg0) {
            const ret = arg0.maxStorageTexturesPerShaderStage;
            return ret;
        },
        __wbg_maxTextureArrayLayers_d6f3b298c8c3f211: function(arg0) {
            const ret = arg0.maxTextureArrayLayers;
            return ret;
        },
        __wbg_maxTextureDimension1D_bf6699d60b3d6d53: function(arg0) {
            const ret = arg0.maxTextureDimension1D;
            return ret;
        },
        __wbg_maxTextureDimension2D_0dffed57b5b5494c: function(arg0) {
            const ret = arg0.maxTextureDimension2D;
            return ret;
        },
        __wbg_maxTextureDimension3D_2c64863f596dfe80: function(arg0) {
            const ret = arg0.maxTextureDimension3D;
            return ret;
        },
        __wbg_maxUniformBufferBindingSize_99ce6228c6b1a159: function(arg0) {
            const ret = arg0.maxUniformBufferBindingSize;
            return ret;
        },
        __wbg_maxUniformBuffersPerShaderStage_6c2eb8354f6591e3: function(arg0) {
            const ret = arg0.maxUniformBuffersPerShaderStage;
            return ret;
        },
        __wbg_maxVertexAttributes_93cb29cb7eb03efc: function(arg0) {
            const ret = arg0.maxVertexAttributes;
            return ret;
        },
        __wbg_maxVertexBufferArrayStride_5348a5f186321487: function(arg0) {
            const ret = arg0.maxVertexBufferArrayStride;
            return ret;
        },
        __wbg_maxVertexBuffers_b853e682ab401f10: function(arg0) {
            const ret = arg0.maxVertexBuffers;
            return ret;
        },
        __wbg_message_408e560bce2d5baa: function(arg0, arg1) {
            const ret = arg1.message;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_minStorageBufferOffsetAlignment_defeef24db62c786: function(arg0) {
            const ret = arg0.minStorageBufferOffsetAlignment;
            return ret;
        },
        __wbg_minUniformBufferOffsetAlignment_5709e95a6f039bcc: function(arg0) {
            const ret = arg0.minUniformBufferOffsetAlignment;
            return ret;
        },
        __wbg_navigator_583ffd4fc14c0f7a: function(arg0) {
            const ret = arg0.navigator;
            return ret;
        },
        __wbg_navigator_9cebf56f28aa719b: function(arg0) {
            const ret = arg0.navigator;
            return ret;
        },
        __wbg_new_a70fbab9066b301f: function() {
            const ret = new Array();
            return ret;
        },
        __wbg_new_ab79df5bd7c26067: function() {
            const ret = new Object();
            return ret;
        },
        __wbg_new_from_slice_22da9388ac046e50: function(arg0, arg1) {
            const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_new_typed_aaaeaf29cf802876: function(arg0, arg1) {
            try {
                var state0 = {a: arg0, b: arg1};
                var cb0 = (arg0, arg1) => {
                    const a = state0.a;
                    state0.a = 0;
                    try {
                        return wasm_bindgen_39059793c51de849___convert__closures_____invoke___js_sys_765e3a270b859b1f___Function_fn_wasm_bindgen_39059793c51de849___JsValue_____wasm_bindgen_39059793c51de849___sys__Undefined___js_sys_765e3a270b859b1f___Function_fn_wasm_bindgen_39059793c51de849___JsValue_____wasm_bindgen_39059793c51de849___sys__Undefined_______true_(a, state0.b, arg0, arg1);
                    } finally {
                        state0.a = a;
                    }
                };
                const ret = new Promise(cb0);
                return ret;
            } finally {
                state0.a = state0.b = 0;
            }
        },
        __wbg_new_typed_bccac67128ed885a: function() {
            const ret = new Array();
            return ret;
        },
        __wbg_new_with_byte_offset_and_length_b2ec5bf7b2f35743: function(arg0, arg1, arg2) {
            const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
            return ret;
        },
        __wbg_now_c6d7a7d35f74f6f1: function(arg0) {
            const ret = arg0.now();
            return ret;
        },
        __wbg_performance_28be169151161678: function(arg0) {
            const ret = arg0.performance;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_popErrorScope_a78bee8446b72279: function(arg0) {
            const ret = arg0.popErrorScope();
            return ret;
        },
        __wbg_prototypesetcall_d62e5099504357e6: function(arg0, arg1, arg2) {
            Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
        },
        __wbg_pushErrorScope_1e02cbedfeae6073: function(arg0, arg1) {
            arg0.pushErrorScope(__wbindgen_enum_GpuErrorFilter[arg1]);
        },
        __wbg_push_e87b0e732085a946: function(arg0, arg1) {
            const ret = arg0.push(arg1);
            return ret;
        },
        __wbg_querySelectorAll_ccbf0696a1c6fed8: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.querySelectorAll(getStringFromWasm0(arg1, arg2));
            return ret;
        }, arguments); },
        __wbg_queueMicrotask_0c399741342fb10f: function(arg0) {
            const ret = arg0.queueMicrotask;
            return ret;
        },
        __wbg_queueMicrotask_a082d78ce798393e: function(arg0) {
            queueMicrotask(arg0);
        },
        __wbg_queue_86095a7bbfecffb7: function(arg0) {
            const ret = arg0.queue;
            return ret;
        },
        __wbg_requestAdapter_200309a5193bf1eb: function(arg0, arg1) {
            const ret = arg0.requestAdapter(arg1);
            return ret;
        },
        __wbg_requestDevice_125eeb799c66e4b6: function(arg0, arg1) {
            const ret = arg0.requestDevice(arg1);
            return ret;
        },
        __wbg_resolveQuerySet_a3e53789e95185d3: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            arg0.resolveQuerySet(arg1, arg2 >>> 0, arg3 >>> 0, arg4, arg5 >>> 0);
        },
        __wbg_resolve_ae8d83246e5bcc12: function(arg0) {
            const ret = Promise.resolve(arg0);
            return ret;
        },
        __wbg_setBindGroup_1d442a48a595b3bf: function(arg0, arg1, arg2) {
            arg0.setBindGroup(arg1 >>> 0, arg2);
        },
        __wbg_setBindGroup_504394ea36cb4add: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            arg0.setBindGroup(arg1 >>> 0, arg2, getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
        },
        __wbg_setBindGroup_5d01c655b2a7befe: function(arg0, arg1, arg2) {
            arg0.setBindGroup(arg1 >>> 0, arg2);
        },
        __wbg_setBindGroup_8420d8ef9f49bbba: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            arg0.setBindGroup(arg1 >>> 0, arg2, getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
        },
        __wbg_setBindGroup_bf56e5d623ae0a95: function(arg0, arg1, arg2) {
            arg0.setBindGroup(arg1 >>> 0, arg2);
        },
        __wbg_setBindGroup_cd569ab5be10d0b3: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            arg0.setBindGroup(arg1 >>> 0, arg2, getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
        },
        __wbg_setBlendConstant_1a70f218a633617e: function(arg0, arg1) {
            arg0.setBlendConstant(arg1);
        },
        __wbg_setIndexBuffer_1d2dd076f925d2ec: function(arg0, arg1, arg2, arg3) {
            arg0.setIndexBuffer(arg1, __wbindgen_enum_GpuIndexFormat[arg2], arg3);
        },
        __wbg_setIndexBuffer_3882ded30efe8699: function(arg0, arg1, arg2, arg3, arg4) {
            arg0.setIndexBuffer(arg1, __wbindgen_enum_GpuIndexFormat[arg2], arg3, arg4);
        },
        __wbg_setIndexBuffer_452b4561a3899ce8: function(arg0, arg1, arg2, arg3, arg4) {
            arg0.setIndexBuffer(arg1, __wbindgen_enum_GpuIndexFormat[arg2], arg3, arg4);
        },
        __wbg_setIndexBuffer_d05b723ebb2004a2: function(arg0, arg1, arg2, arg3) {
            arg0.setIndexBuffer(arg1, __wbindgen_enum_GpuIndexFormat[arg2], arg3);
        },
        __wbg_setPipeline_41c08398b6fdbaf5: function(arg0, arg1) {
            arg0.setPipeline(arg1);
        },
        __wbg_setPipeline_9f00755767652963: function(arg0, arg1) {
            arg0.setPipeline(arg1);
        },
        __wbg_setPipeline_c75036e1cbd58786: function(arg0, arg1) {
            arg0.setPipeline(arg1);
        },
        __wbg_setScissorRect_103aee4136a0b8bf: function(arg0, arg1, arg2, arg3, arg4) {
            arg0.setScissorRect(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
        },
        __wbg_setStencilReference_d2cd6bbf177426c7: function(arg0, arg1) {
            arg0.setStencilReference(arg1 >>> 0);
        },
        __wbg_setVertexBuffer_923bd23cd3da619c: function(arg0, arg1, arg2, arg3) {
            arg0.setVertexBuffer(arg1 >>> 0, arg2, arg3);
        },
        __wbg_setVertexBuffer_96aa126628c421ae: function(arg0, arg1, arg2, arg3, arg4) {
            arg0.setVertexBuffer(arg1 >>> 0, arg2, arg3, arg4);
        },
        __wbg_setVertexBuffer_e1e02336688a3924: function(arg0, arg1, arg2, arg3, arg4) {
            arg0.setVertexBuffer(arg1 >>> 0, arg2, arg3, arg4);
        },
        __wbg_setVertexBuffer_f2936fdbb904abbd: function(arg0, arg1, arg2, arg3) {
            arg0.setVertexBuffer(arg1 >>> 0, arg2, arg3);
        },
        __wbg_setViewport_a2868622b5237556: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            arg0.setViewport(arg1, arg2, arg3, arg4, arg5, arg6);
        },
        __wbg_set_282384002438957f: function(arg0, arg1, arg2) {
            arg0[arg1 >>> 0] = arg2;
        },
        __wbg_set_6be42768c690e380: function(arg0, arg1, arg2) {
            arg0[arg1] = arg2;
        },
        __wbg_set_7eaa4f96924fd6b3: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = Reflect.set(arg0, arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_set_e80615d7a9a43981: function(arg0, arg1, arg2) {
            arg0.set(arg1, arg2 >>> 0);
        },
        __wbg_set_height_98a1a397672657e2: function(arg0, arg1) {
            arg0.height = arg1 >>> 0;
        },
        __wbg_set_height_b6548a01bdcb689a: function(arg0, arg1) {
            arg0.height = arg1 >>> 0;
        },
        __wbg_set_onuncapturederror_e4269b42b6a94b67: function(arg0, arg1) {
            arg0.onuncapturederror = arg1;
        },
        __wbg_set_width_576343a4a7f2cf28: function(arg0, arg1) {
            arg0.width = arg1 >>> 0;
        },
        __wbg_set_width_c0fcaa2da53cd540: function(arg0, arg1) {
            arg0.width = arg1 >>> 0;
        },
        __wbg_size_f31e7f807537ca60: function(arg0) {
            const ret = arg0.size;
            return ret;
        },
        __wbg_static_accessor_GLOBAL_8adb955bd33fac2f: function() {
            const ret = typeof global === 'undefined' ? null : global;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_GLOBAL_THIS_ad356e0db91c7913: function() {
            const ret = typeof globalThis === 'undefined' ? null : globalThis;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_SELF_f207c857566db248: function() {
            const ret = typeof self === 'undefined' ? null : self;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_WINDOW_bb9f1ba69d61b386: function() {
            const ret = typeof window === 'undefined' ? null : window;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_submit_fa002a371d622a03: function(arg0, arg1) {
            arg0.submit(arg1);
        },
        __wbg_then_098abe61755d12f6: function(arg0, arg1) {
            const ret = arg0.then(arg1);
            return ret;
        },
        __wbg_then_9e335f6dd892bc11: function(arg0, arg1, arg2) {
            const ret = arg0.then(arg1, arg2);
            return ret;
        },
        __wbg_then_bc59d1943397ca4e: function(arg0, arg1, arg2) {
            const ret = arg0.then(arg1, arg2);
            return ret;
        },
        __wbg_unmap_fa9902769025442b: function(arg0) {
            arg0.unmap();
        },
        __wbg_usage_b39863f16cf0f3d0: function(arg0) {
            const ret = arg0.usage;
            return ret;
        },
        __wbg_valueOf_5c6da6c9a85f34dc: function(arg0) {
            const ret = arg0.valueOf();
            return ret;
        },
        __wbg_writeBuffer_8ff0ce799fa73af6: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            arg0.writeBuffer(arg1, arg2, arg3, arg4, arg5);
        },
        __wbg_writeTexture_0ff4670b961f7196: function(arg0, arg1, arg2, arg3, arg4) {
            arg0.writeTexture(arg1, arg2, arg3, arg4);
        },
        __wbg_writeTimestamp_3189accd0719f57d: function(arg0, arg1, arg2) {
            arg0.writeTimestamp(arg1, arg2 >>> 0);
        },
        __wbindgen_cast_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { dtor_idx: 389, function: Function { arguments: [Externref], shim_idx: 390, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen_39059793c51de849___closure__destroy___dyn_core_2be32f71e062320c___ops__function__FnMut__wasm_bindgen_39059793c51de849___JsValue____Output_______, wasm_bindgen_39059793c51de849___convert__closures_____invoke___wasm_bindgen_39059793c51de849___JsValue______true_);
            return ret;
        },
        __wbindgen_cast_0000000000000002: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { dtor_idx: 389, function: Function { arguments: [NamedExternref("GPUUncapturedErrorEvent")], shim_idx: 390, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen_39059793c51de849___closure__destroy___dyn_core_2be32f71e062320c___ops__function__FnMut__wasm_bindgen_39059793c51de849___JsValue____Output_______, wasm_bindgen_39059793c51de849___convert__closures_____invoke___wasm_bindgen_39059793c51de849___JsValue______true__1);
            return ret;
        },
        __wbindgen_cast_0000000000000003: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { dtor_idx: 397, function: Function { arguments: [Externref], shim_idx: 398, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen_39059793c51de849___closure__destroy___dyn_core_2be32f71e062320c___ops__function__FnMut__wasm_bindgen_39059793c51de849___JsValue____Output___core_2be32f71e062320c___result__Result_____wasm_bindgen_39059793c51de849___JsError___, wasm_bindgen_39059793c51de849___convert__closures_____invoke___wasm_bindgen_39059793c51de849___JsValue__core_2be32f71e062320c___result__Result_____wasm_bindgen_39059793c51de849___JsError___true_);
            return ret;
        },
        __wbindgen_cast_0000000000000004: function(arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_cast_0000000000000005: function(arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
            const ret = getArrayU8FromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_cast_0000000000000006: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_cast_0000000000000007: function(arg0) {
            // Cast intrinsic for `U64 -> Externref`.
            const ret = BigInt.asUintN(64, arg0);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./dravya_core_bg.js": import0,
    };
}

function wasm_bindgen_39059793c51de849___convert__closures_____invoke___wasm_bindgen_39059793c51de849___JsValue______true_(arg0, arg1, arg2) {
    wasm.wasm_bindgen_39059793c51de849___convert__closures_____invoke___wasm_bindgen_39059793c51de849___JsValue______true_(arg0, arg1, arg2);
}

function wasm_bindgen_39059793c51de849___convert__closures_____invoke___wasm_bindgen_39059793c51de849___JsValue______true__1(arg0, arg1, arg2) {
    wasm.wasm_bindgen_39059793c51de849___convert__closures_____invoke___wasm_bindgen_39059793c51de849___JsValue______true__1(arg0, arg1, arg2);
}

function wasm_bindgen_39059793c51de849___convert__closures_____invoke___wasm_bindgen_39059793c51de849___JsValue__core_2be32f71e062320c___result__Result_____wasm_bindgen_39059793c51de849___JsError___true_(arg0, arg1, arg2) {
    const ret = wasm.wasm_bindgen_39059793c51de849___convert__closures_____invoke___wasm_bindgen_39059793c51de849___JsValue__core_2be32f71e062320c___result__Result_____wasm_bindgen_39059793c51de849___JsError___true_(arg0, arg1, arg2);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

function wasm_bindgen_39059793c51de849___convert__closures_____invoke___js_sys_765e3a270b859b1f___Function_fn_wasm_bindgen_39059793c51de849___JsValue_____wasm_bindgen_39059793c51de849___sys__Undefined___js_sys_765e3a270b859b1f___Function_fn_wasm_bindgen_39059793c51de849___JsValue_____wasm_bindgen_39059793c51de849___sys__Undefined_______true_(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen_39059793c51de849___convert__closures_____invoke___js_sys_765e3a270b859b1f___Function_fn_wasm_bindgen_39059793c51de849___JsValue_____wasm_bindgen_39059793c51de849___sys__Undefined___js_sys_765e3a270b859b1f___Function_fn_wasm_bindgen_39059793c51de849___JsValue_____wasm_bindgen_39059793c51de849___sys__Undefined_______true_(arg0, arg1, arg2, arg3);
}


const __wbindgen_enum_GpuErrorFilter = ["validation", "out-of-memory", "internal"];


const __wbindgen_enum_GpuIndexFormat = ["uint16", "uint32"];


const __wbindgen_enum_GpuTextureFormat = ["r8unorm", "r8snorm", "r8uint", "r8sint", "r16uint", "r16sint", "r16float", "rg8unorm", "rg8snorm", "rg8uint", "rg8sint", "r32uint", "r32sint", "r32float", "rg16uint", "rg16sint", "rg16float", "rgba8unorm", "rgba8unorm-srgb", "rgba8snorm", "rgba8uint", "rgba8sint", "bgra8unorm", "bgra8unorm-srgb", "rgb9e5ufloat", "rgb10a2unorm", "rg11b10ufloat", "rg32uint", "rg32sint", "rg32float", "rgba16uint", "rgba16sint", "rgba16float", "rgba32uint", "rgba32sint", "rgba32float", "stencil8", "depth16unorm", "depth24plus", "depth24plus-stencil8", "depth32float", "depth32float-stencil8", "bc1-rgba-unorm", "bc1-rgba-unorm-srgb", "bc2-rgba-unorm", "bc2-rgba-unorm-srgb", "bc3-rgba-unorm", "bc3-rgba-unorm-srgb", "bc4-r-unorm", "bc4-r-snorm", "bc5-rg-unorm", "bc5-rg-snorm", "bc6h-rgb-ufloat", "bc6h-rgb-float", "bc7-rgba-unorm", "bc7-rgba-unorm-srgb", "etc2-rgb8unorm", "etc2-rgb8unorm-srgb", "etc2-rgb8a1unorm", "etc2-rgb8a1unorm-srgb", "etc2-rgba8unorm", "etc2-rgba8unorm-srgb", "eac-r11unorm", "eac-r11snorm", "eac-rg11unorm", "eac-rg11snorm", "astc-4x4-unorm", "astc-4x4-unorm-srgb", "astc-5x4-unorm", "astc-5x4-unorm-srgb", "astc-5x5-unorm", "astc-5x5-unorm-srgb", "astc-6x5-unorm", "astc-6x5-unorm-srgb", "astc-6x6-unorm", "astc-6x6-unorm-srgb", "astc-8x5-unorm", "astc-8x5-unorm-srgb", "astc-8x6-unorm", "astc-8x6-unorm-srgb", "astc-8x8-unorm", "astc-8x8-unorm-srgb", "astc-10x5-unorm", "astc-10x5-unorm-srgb", "astc-10x6-unorm", "astc-10x6-unorm-srgb", "astc-10x8-unorm", "astc-10x8-unorm-srgb", "astc-10x10-unorm", "astc-10x10-unorm-srgb", "astc-12x10-unorm", "astc-12x10-unorm-srgb", "astc-12x12-unorm", "astc-12x12-unorm-srgb"];
const DravyaEngineFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_dravyaengine_free(ptr >>> 0, 1));
const arrowMemoryPointerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_arrowmemorypointer_free(ptr >>> 0, 1));

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => state.dtor(state.a, state.b));

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            state.dtor(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8, 8) >>> 0;
    getFloat64ArrayMemory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasm;
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedFloat64ArrayMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('dravya_core_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
