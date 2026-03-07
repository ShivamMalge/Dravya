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
    heapUsedBytes: number | null;
}

interface PerformanceMemory {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
}

function getHeapUsed(): number | null {
    const perf = performance as typeof performance & { memory?: PerformanceMemory };
    return perf.memory ? perf.memory.usedJSHeapSize : null;
}

export async function runJsBenchmark(arraySizeN: number, warmupRuns: number, officialTrials: number): Promise<BenchmarkResult> {
    for (let i = 0; i < warmupRuns; i++) {
        const warmupData = generateRandomUint8Array(arraySizeN);
        jsSortColors(warmupData);
    }

    const trialTimings: number[] = [];
    let peakHeapUsedBytes: number | null = null;

    for (let trial = 0; trial < officialTrials; trial++) {
        const trialData = generateRandomUint8Array(arraySizeN);
        const heapBefore = getHeapUsed();

        const startMark = performance.now();
        jsSortColors(trialData);
        const endMark = performance.now();

        const heapAfter = getHeapUsed();
        trialTimings.push(endMark - startMark);

        if (heapBefore !== null && heapAfter !== null) {
            const heapDelta = heapAfter - heapBefore;
            if (peakHeapUsedBytes === null || heapDelta > peakHeapUsedBytes) {
                peakHeapUsedBytes = heapDelta;
            }
        }
    }

    const medianExecutionMs = computeMedian(trialTimings);
    const throughputElementsPerSec = medianExecutionMs > 0
        ? Math.round(arraySizeN / (medianExecutionMs / 1000))
        : 0;

    return {
        engineName: 'JavaScript',
        arraySizeN,
        medianExecutionMs: Math.round(medianExecutionMs * 1000) / 1000,
        throughputElementsPerSec,
        heapUsedBytes: peakHeapUsedBytes,
    };
}

export async function runWasmBenchmark(arraySizeN: number, warmupRuns: number, officialTrials: number): Promise<BenchmarkResult | null> {
    try {
        const modulePath = '/wasm/dravya_core.js';
        const wasmModule = await (new Function('p', 'return import(p)'))(modulePath) as {
            default: () => Promise<void>;
            sort_colors: (a: Uint8Array) => void;
        };
        await wasmModule.default();

        for (let i = 0; i < warmupRuns; i++) {
            const warmupData = generateRandomUint8Array(arraySizeN);
            wasmModule.sort_colors(warmupData);
        }

        const trialTimings: number[] = [];
        let peakHeapUsedBytes: number | null = null;

        for (let trial = 0; trial < officialTrials; trial++) {
            const trialData = generateRandomUint8Array(arraySizeN);
            const heapBefore = getHeapUsed();

            const startMark = performance.now();
            wasmModule.sort_colors(trialData);
            const endMark = performance.now();

            const heapAfter = getHeapUsed();
            trialTimings.push(endMark - startMark);

            if (heapBefore !== null && heapAfter !== null) {
                const heapDelta = heapAfter - heapBefore;
                if (peakHeapUsedBytes === null || heapDelta > peakHeapUsedBytes) {
                    peakHeapUsedBytes = heapDelta;
                }
            }
        }

        const medianExecutionMs = computeMedian(trialTimings);
        const throughputElementsPerSec = medianExecutionMs > 0
            ? Math.round(arraySizeN / (medianExecutionMs / 1000))
            : 0;

        return {
            engineName: 'WASM (Rust)',
            arraySizeN,
            medianExecutionMs: Math.round(medianExecutionMs * 1000) / 1000,
            throughputElementsPerSec,
            heapUsedBytes: peakHeapUsedBytes,
        };
    } catch {
        return null;
    }
}
