export function jsSortColors(input: Uint8Array): Uint8Array {
    const colors = new Uint8Array(input);
    let low = 0;
    let current = 0;
    let high = colors.length - 1;

    while (current <= high) {
        if (colors[current] === 0) {
            const tmp = colors[low];
            colors[low] = colors[current];
            colors[current] = tmp;
            low++;
            current++;
        } else if (colors[current] === 2) {
            const tmp = colors[current];
            colors[current] = colors[high];
            colors[high] = tmp;
            high--;
        } else {
            current++;
        }
    }

    return colors;
}

export function jsSortColorsInPlace(buffer: Uint8Array): void {
    let low = 0;
    let current = 0;
    let high = buffer.length - 1;

    while (current <= high) {
        if (buffer[current] === 0) {
            const tmp = buffer[low];
            buffer[low] = buffer[current];
            buffer[current] = tmp;
            low++;
            current++;
        } else if (buffer[current] === 2) {
            const tmp = buffer[current];
            buffer[current] = buffer[high];
            buffer[high] = tmp;
            high--;
        } else {
            current++;
        }
    }
}

export function jsSortColorsWithHistory(input: Uint8Array): number[][] {
    const colors = new Uint8Array(input);
    const stepHistory: number[][] = [Array.from(colors)];
    let low = 0;
    let current = 0;
    let high = colors.length - 1;

    while (current <= high) {
        if (colors[current] === 0) {
            const tmp = colors[low];
            colors[low] = colors[current];
            colors[current] = tmp;
            stepHistory.push(Array.from(colors));
            low++;
            current++;
        } else if (colors[current] === 2) {
            const tmp = colors[current];
            colors[current] = colors[high];
            colors[high] = tmp;
            stepHistory.push(Array.from(colors));
            high--;
        } else {
            current++;
        }
    }

    return stepHistory;
}

function generateRandomUint8Array(size: number): Uint8Array {
    const arr = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
        arr[i] = Math.floor(Math.random() * 3);
    }
    return arr;
}

function fillRandomUint8Array(buffer: Uint8Array): void {
    for (let i = 0; i < buffer.length; i++) {
        buffer[i] = Math.floor(Math.random() * 3);
    }
}

function computeMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
}

export interface BenchmarkResult {
    engineName: string;
    arraySizeN: number;
    medianExecutionMs: number;
    throughputElementsPerSec: number;
    initialHeapSize: number | null;
    finalHeapSize: number | null;
    heapDeltaBytes: number | null;
    garbageProducedBytes: number | null;
    wasmBufferByteLength: number | null;
    gcImpactEstimateMs: number | null;
}

interface PerformanceMemory {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
}

function getHeapSnapshot(): { usedHeap: number; totalHeap: number } | null {
    const perf = performance as typeof performance & { memory?: PerformanceMemory };
    if (!perf.memory) return null;
    return { usedHeap: perf.memory.usedJSHeapSize, totalHeap: perf.memory.totalJSHeapSize };
}

export async function runJsBenchmark(arraySizeN: number, warmupRuns: number, officialTrials: number): Promise<BenchmarkResult> {
    const persistentBuffer = new Uint8Array(arraySizeN);

    for (let i = 0; i < warmupRuns; i++) {
        fillRandomUint8Array(persistentBuffer);
        jsSortColorsInPlace(persistentBuffer);
    }

    const trialTimings: number[] = [];
    const heapBefore = getHeapSnapshot();
    let peakGarbageProduced = 0;

    for (let trial = 0; trial < officialTrials; trial++) {
        fillRandomUint8Array(persistentBuffer);
        const preTrialHeap = getHeapSnapshot();

        const startMark = performance.now();
        jsSortColorsInPlace(persistentBuffer);
        const endMark = performance.now();

        const postTrialHeap = getHeapSnapshot();
        trialTimings.push(endMark - startMark);

        if (preTrialHeap && postTrialHeap) {
            const trialGarbage = Math.max(0, postTrialHeap.usedHeap - preTrialHeap.usedHeap);
            peakGarbageProduced = Math.max(peakGarbageProduced, trialGarbage);
        }
    }

    const heapAfter = getHeapSnapshot();

    const totalWallTime = trialTimings.reduce((a, b) => a + b, 0);
    const medianExecutionMs = computeMedian(trialTimings);
    const pureComputeTime = medianExecutionMs * officialTrials;
    const gcImpactEstimateMs = Math.max(0, totalWallTime - pureComputeTime);

    const throughputElementsPerSec = medianExecutionMs > 0
        ? Math.round(arraySizeN / (medianExecutionMs / 1000))
        : 0;

    return {
        engineName: 'JavaScript',
        arraySizeN,
        medianExecutionMs: Math.round(medianExecutionMs * 1000) / 1000,
        throughputElementsPerSec,
        initialHeapSize: heapBefore?.usedHeap ?? null,
        finalHeapSize: heapAfter?.usedHeap ?? null,
        heapDeltaBytes: heapBefore && heapAfter ? heapAfter.usedHeap - heapBefore.usedHeap : null,
        garbageProducedBytes: peakGarbageProduced > 0 ? peakGarbageProduced : null,
        wasmBufferByteLength: null,
        gcImpactEstimateMs: Math.round(gcImpactEstimateMs * 100) / 100,
    };
}

export async function runWasmBenchmark(arraySizeN: number, warmupRuns: number, officialTrials: number): Promise<BenchmarkResult | null> {
    try {
        const modulePath = '/wasm/dravya_core.js';
        const wasmModule = await (new Function('p', 'return import(p)'))(modulePath) as {
            default: () => Promise<void>;
            sort_colors: (a: Uint8Array) => void;
            get_wasm_memory_size: () => number;
        };
        await wasmModule.default();

        const persistentBuffer = new Uint8Array(arraySizeN);

        for (let i = 0; i < warmupRuns; i++) {
            fillRandomUint8Array(persistentBuffer);
            wasmModule.sort_colors(persistentBuffer);
        }

        const wasmMemoryBefore = wasmModule.get_wasm_memory_size();
        const trialTimings: number[] = [];
        const heapBefore = getHeapSnapshot();
        let peakGarbageProduced = 0;

        for (let trial = 0; trial < officialTrials; trial++) {
            fillRandomUint8Array(persistentBuffer);
            const preTrialHeap = getHeapSnapshot();

            const startMark = performance.now();
            wasmModule.sort_colors(persistentBuffer);
            const endMark = performance.now();

            const postTrialHeap = getHeapSnapshot();
            trialTimings.push(endMark - startMark);

            if (preTrialHeap && postTrialHeap) {
                const trialGarbage = Math.max(0, postTrialHeap.usedHeap - preTrialHeap.usedHeap);
                peakGarbageProduced = Math.max(peakGarbageProduced, trialGarbage);
            }
        }

        const heapAfter = getHeapSnapshot();
        const wasmMemoryAfter = wasmModule.get_wasm_memory_size();

        const totalWallTime = trialTimings.reduce((a, b) => a + b, 0);
        const medianExecutionMs = computeMedian(trialTimings);
        const pureComputeTime = medianExecutionMs * officialTrials;
        const gcImpactEstimateMs = Math.max(0, totalWallTime - pureComputeTime);

        const throughputElementsPerSec = medianExecutionMs > 0
            ? Math.round(arraySizeN / (medianExecutionMs / 1000))
            : 0;

        return {
            engineName: 'WASM (Rust)',
            arraySizeN,
            medianExecutionMs: Math.round(medianExecutionMs * 1000) / 1000,
            throughputElementsPerSec,
            initialHeapSize: heapBefore?.usedHeap ?? null,
            finalHeapSize: heapAfter?.usedHeap ?? null,
            heapDeltaBytes: heapBefore && heapAfter ? heapAfter.usedHeap - heapBefore.usedHeap : null,
            garbageProducedBytes: peakGarbageProduced > 0 ? peakGarbageProduced : null,
            wasmBufferByteLength: wasmMemoryAfter > 0 ? wasmMemoryAfter : wasmMemoryBefore,
            gcImpactEstimateMs: Math.round(gcImpactEstimateMs * 100) / 100,
        };
    } catch {
        return null;
    }
}
