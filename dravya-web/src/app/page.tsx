'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { runJsBenchmark, runWasmBenchmark, BenchmarkResult } from '../utils/benchmark';

const Visualizer = dynamic(() => import('../components/Visualizer'), { ssr: false });
const TreeVisualizer = dynamic(() => import('../components/TreeVisualizer'), { ssr: false });

type DashboardMode = 'sort' | 'binomial' | 'diagnostics';

interface BinomialResult {
    asset_prices: number[][];
    option_values: number[][];
    backward_steps: number[][][];
    final_price: number;
}

function generateShuffledArray(length: number): number[] {
    const values = [0, 1, 2];
    return Array.from({ length }, () => values[Math.floor(Math.random() * values.length)]);
}

function jsFallbackSortWithHistory(arr: number[]): number[][] {
    const state = [...arr];
    const stepHistory: number[][] = [[...state]];
    let low = 0;
    let current = 0;
    let high = state.length - 1;
    while (current <= high) {
        if (state[current] === 0) {
            [state[low], state[current]] = [state[current], state[low]];
            stepHistory.push([...state]);
            low++;
            current++;
        } else if (state[current] === 2) {
            [state[current], state[high]] = [state[high], state[current]];
            stepHistory.push([...state]);
            high--;
        } else {
            current++;
        }
    }
    return stepHistory;
}

function jsFallbackBinomialTree(
    spotPrice: number,
    strikePrice: number,
    timeToExpiry: number,
    riskFreeRate: number,
    volatility: number,
    steps: number
): BinomialResult {
    const deltaT = timeToExpiry / steps;
    const upsideFactor = Math.exp(volatility * Math.sqrt(deltaT));
    const downsideFactor = 1.0 / upsideFactor;
    const discountFactor = Math.exp(-riskFreeRate * deltaT);
    const upsideProbability = (Math.exp(riskFreeRate * deltaT) - downsideFactor) / (upsideFactor - downsideFactor);

    const assetPrices: number[][] = [];
    for (let step = 0; step <= steps; step++) {
        const level: number[] = [];
        for (let node = 0; node <= step; node++) {
            const price = spotPrice * Math.pow(upsideFactor, step - node) * Math.pow(downsideFactor, node);
            level.push(Math.round(price * 1e6) / 1e6);
        }
        assetPrices.push(level);
    }

    const optionGrid: number[][] = Array.from({ length: steps + 1 }, () => []);
    optionGrid[steps] = assetPrices[steps].map(p => Math.max(p - strikePrice, 0));
    optionGrid[steps] = optionGrid[steps].map(v => Math.round(v * 1e6) / 1e6);

    const backwardSteps: number[][][] = [optionGrid[steps].map(v => [v])];

    for (let step = steps - 1; step >= 0; step--) {
        const levelValues: number[] = [];
        for (let node = 0; node <= step; node++) {
            const discountedValue = discountFactor * (
                upsideProbability * optionGrid[step + 1][node] +
                (1 - upsideProbability) * optionGrid[step + 1][node + 1]
            );
            levelValues.push(Math.round(discountedValue * 1e6) / 1e6);
        }
        optionGrid[step] = levelValues;
        backwardSteps.push(optionGrid[step].map(v => [v]));
    }

    return {
        asset_prices: assetPrices,
        option_values: optionGrid,
        backward_steps: backwardSteps,
        final_price: Math.round(optionGrid[0][0] * 1e6) / 1e6,
    };
}

export default function Home() {
    const [activeMode, setActiveMode] = useState<DashboardMode>('sort');

    const [stepHistory, setStepHistory] = useState<number[][]>([[2, 0, 1, 2, 1, 0]]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeedMs, setPlaybackSpeedMs] = useState(300);
    const playbackIntervalId = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [spotPrice, setSpotPrice] = useState(100);
    const [strikePrice, setStrikePrice] = useState(100);
    const [timeToExpiry, setTimeToExpiry] = useState(1.0);
    const [riskFreeRate, setRiskFreeRate] = useState(0.05);
    const [volatilityParam, setVolatilityParam] = useState(0.2);
    const [treeSteps, setTreeSteps] = useState(4);
    const [binomialResult, setBinomialResult] = useState<BinomialResult | null>(null);

    const [stressArraySize, setStressArraySize] = useState(100000);
    const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);
    const [jsBenchmarkResult, setJsBenchmarkResult] = useState<BenchmarkResult | null>(null);
    const [wasmBenchmarkResult, setWasmBenchmarkResult] = useState<BenchmarkResult | null>(null);

    const currentData = stepHistory[currentStep] || stepHistory[0];

    const stopPlayback = useCallback(() => {
        if (playbackIntervalId.current) {
            clearTimeout(playbackIntervalId.current);
            playbackIntervalId.current = null;
        }
        setIsPlaying(false);
    }, []);

    const executeSort = useCallback(async () => {
        stopPlayback();
        try {
            const modulePath = '/wasm/dravya_core.js';
            const wasmModule = await (new Function('p', 'return import(p)'))(modulePath) as {
                default: () => Promise<void>;
                sort_colors_with_history: (a: Uint8Array) => number[][];
            };
            await wasmModule.default();
            const buffer = new Uint8Array(stepHistory[0]);
            const history = wasmModule.sort_colors_with_history(buffer);
            setStepHistory(history);
            setCurrentStep(0);
        } catch {
            const history = jsFallbackSortWithHistory(stepHistory[0]);
            setStepHistory(history);
            setCurrentStep(0);
        }
    }, [stepHistory, stopPlayback]);

    const handleShuffle = useCallback(() => {
        stopPlayback();
        const freshArray = generateShuffledArray(6);
        setStepHistory([freshArray]);
        setCurrentStep(0);
    }, [stopPlayback]);

    const playSimulation = useCallback(() => {
        if (stepHistory.length <= 1) return;
        setIsPlaying(true);
        setCurrentStep(0);
    }, [stepHistory]);

    useEffect(() => {
        if (!isPlaying) return;
        const advanceStep = () => {
            setCurrentStep(prev => {
                const nextStep = prev + 1;
                if (nextStep >= stepHistory.length) {
                    setIsPlaying(false);
                    return prev;
                }
                playbackIntervalId.current = setTimeout(advanceStep, playbackSpeedMs);
                return nextStep;
            });
        };
        playbackIntervalId.current = setTimeout(advanceStep, playbackSpeedMs);
        return () => {
            if (playbackIntervalId.current) clearTimeout(playbackIntervalId.current);
        };
    }, [isPlaying, playbackSpeedMs, stepHistory.length]);

    const stepForward = useCallback(() => {
        stopPlayback();
        setCurrentStep(prev => Math.min(prev + 1, stepHistory.length - 1));
    }, [stepHistory.length, stopPlayback]);

    const stepBackward = useCallback(() => {
        stopPlayback();
        setCurrentStep(prev => Math.max(prev - 1, 0));
    }, [stopPlayback]);

    const executeBinomialTree = useCallback(async () => {
        try {
            const modulePath = '/wasm/dravya_core.js';
            const wasmModule = await (new Function('p', 'return import(p)'))(modulePath) as {
                default: () => Promise<void>;
                calculate_binomial_tree: (s: number, k: number, t: number, r: number, v: number, n: number) => BinomialResult;
            };
            await wasmModule.default();
            const result = wasmModule.calculate_binomial_tree(spotPrice, strikePrice, timeToExpiry, riskFreeRate, volatilityParam, treeSteps);
            setBinomialResult(result);
        } catch {
            const result = jsFallbackBinomialTree(spotPrice, strikePrice, timeToExpiry, riskFreeRate, volatilityParam, treeSteps);
            setBinomialResult(result);
        }
    }, [spotPrice, strikePrice, timeToExpiry, riskFreeRate, volatilityParam, treeSteps]);

    const runStressTest = useCallback(async () => {
        setIsRunningBenchmark(true);
        setJsBenchmarkResult(null);
        setWasmBenchmarkResult(null);

        await new Promise(r => setTimeout(r, 50));
        const jsResult = await runJsBenchmark(stressArraySize, 3, 5);
        setJsBenchmarkResult(jsResult);

        const wasmResult = await runWasmBenchmark(stressArraySize, 3, 5);
        setWasmBenchmarkResult(wasmResult);

        setIsRunningBenchmark(false);
    }, [stressArraySize]);

    const hasHistory = stepHistory.length > 1;

    return (
        <main style={{ padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '960px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Dravya Engine</h1>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => setActiveMode('sort')}
                    style={modeTabStyle(activeMode === 'sort')}
                >
                    Sort Visualizer
                </button>
                <button
                    onClick={() => setActiveMode('binomial')}
                    style={modeTabStyle(activeMode === 'binomial')}
                >
                    Binomial Tree
                </button>
                <button
                    onClick={() => setActiveMode('diagnostics')}
                    style={modeTabStyle(activeMode === 'diagnostics')}
                >
                    Diagnostics
                </button>
            </div>

            {activeMode === 'sort' && (
                <div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <button onClick={executeSort} style={btnStyle('#3b82f6')}>Sort</button>
                        <button onClick={handleShuffle} style={btnStyle('#6b7280')}>Shuffle</button>
                        {hasHistory && (
                            <>
                                <button onClick={playSimulation} disabled={isPlaying} style={btnStyle('#10b981', isPlaying)}>
                                    {isPlaying ? 'Playing...' : 'Play'}
                                </button>
                                <button onClick={stopPlayback} disabled={!isPlaying} style={btnStyle('#ef4444', !isPlaying)}>Stop</button>
                                <button onClick={stepBackward} disabled={currentStep === 0} style={btnStyle('#8b5cf6', currentStep === 0)}>◀</button>
                                <button onClick={stepForward} disabled={currentStep >= stepHistory.length - 1} style={btnStyle('#8b5cf6', currentStep >= stepHistory.length - 1)}>▶</button>
                            </>
                        )}
                    </div>
                    {hasHistory && (
                        <div style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                            <label style={{ fontWeight: 600, marginRight: '0.5rem' }}>Speed: {playbackSpeedMs}ms</label>
                            <input type="range" min={50} max={1000} step={50} value={playbackSpeedMs}
                                onChange={(e) => setPlaybackSpeedMs(Number(e.target.value))} style={{ width: '180px', verticalAlign: 'middle' }} />
                            <span style={{ color: '#9ca3af', marginLeft: '0.75rem' }}>Step {currentStep + 1} / {stepHistory.length}</span>
                        </div>
                    )}
                    <div style={{ padding: '0.6rem 1rem', backgroundColor: '#f3f4f6', borderRadius: '6px', marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                        [{currentData.join(', ')}]
                    </div>
                    <Visualizer data={currentData} />
                </div>
            )}

            {activeMode === 'binomial' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                        <SliderParam label="Spot Price" value={spotPrice} min={10} max={500} step={5} onChange={setSpotPrice} />
                        <SliderParam label="Strike Price" value={strikePrice} min={10} max={500} step={5} onChange={setStrikePrice} />
                        <SliderParam label="Time (years)" value={timeToExpiry} min={0.1} max={5} step={0.1} onChange={setTimeToExpiry} />
                        <SliderParam label="Risk-Free Rate" value={riskFreeRate} min={0.01} max={0.2} step={0.01} onChange={setRiskFreeRate} />
                        <SliderParam label="Volatility" value={volatilityParam} min={0.05} max={1.0} step={0.05} onChange={setVolatilityParam} />
                        <SliderParam label="Steps" value={treeSteps} min={2} max={8} step={1} onChange={setTreeSteps} />
                    </div>
                    <button onClick={executeBinomialTree} style={btnStyle('#10b981')}>Calculate Tree</button>
                    {binomialResult && (
                        <div style={{ marginTop: '1rem' }}>
                            <TreeVisualizer
                                assetPrices={binomialResult.asset_prices}
                                optionValues={binomialResult.option_values}
                                finalPrice={binomialResult.final_price}
                            />
                        </div>
                    )}
                </div>
            )}

            {activeMode === 'diagnostics' && (
                <div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, marginRight: '0.5rem' }}>
                            Array Size (N): {stressArraySize.toLocaleString()}
                        </label>
                        <input type="range" min={1000} max={5000000} step={10000} value={stressArraySize}
                            onChange={(e) => setStressArraySize(Number(e.target.value))}
                            style={{ width: '300px', verticalAlign: 'middle' }} />
                    </div>
                    <button onClick={runStressTest} disabled={isRunningBenchmark} style={btnStyle('#8b5cf6', isRunningBenchmark)}>
                        {isRunningBenchmark ? 'Running Benchmark...' : 'Run Stress Test'}
                    </button>
                    {(jsBenchmarkResult || wasmBenchmarkResult) && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #334155' }}>
                                        <th style={thStyle}>Metric</th>
                                        <th style={thStyle}>JavaScript</th>
                                        <th style={thStyle}>WASM (Rust)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={trStyle}>
                                        <td style={tdStyle}>Execution Time</td>
                                        <td style={tdStyle}>{jsBenchmarkResult ? `${jsBenchmarkResult.medianExecutionMs} ms` : '—'}</td>
                                        <td style={tdStyle}>{wasmBenchmarkResult ? `${wasmBenchmarkResult.medianExecutionMs} ms` : 'N/A'}</td>
                                    </tr>
                                    <tr style={trStyle}>
                                        <td style={tdStyle}>Throughput</td>
                                        <td style={tdStyle}>{jsBenchmarkResult ? formatThroughput(jsBenchmarkResult.throughputElementsPerSec) : '—'}</td>
                                        <td style={tdStyle}>{wasmBenchmarkResult ? formatThroughput(wasmBenchmarkResult.throughputElementsPerSec) : 'N/A'}</td>
                                    </tr>
                                    <tr style={trStyle}>
                                        <td style={tdStyle}>Heap Delta</td>
                                        <td style={tdStyle}>{jsBenchmarkResult && jsBenchmarkResult.heapDeltaBytes != null ? formatBytes(jsBenchmarkResult.heapDeltaBytes) : 'N/A'}</td>
                                        <td style={tdStyle}>{wasmBenchmarkResult && wasmBenchmarkResult.heapDeltaBytes != null ? formatBytes(wasmBenchmarkResult.heapDeltaBytes) : 'N/A'}</td>
                                    </tr>
                                    <tr style={trStyle}>
                                        <td style={tdStyle}>Garbage Produced</td>
                                        <td style={tdStyle}>{jsBenchmarkResult && jsBenchmarkResult.garbageProducedBytes != null ? formatBytes(jsBenchmarkResult.garbageProducedBytes) : 'N/A'}</td>
                                        <td style={tdStyle}>{wasmBenchmarkResult && wasmBenchmarkResult.garbageProducedBytes != null ? formatBytes(wasmBenchmarkResult.garbageProducedBytes) : 'N/A'}</td>
                                    </tr>
                                    <tr style={trStyle}>
                                        <td style={tdStyle}>WASM Linear Memory</td>
                                        <td style={tdStyle}>—</td>
                                        <td style={tdStyle}>{wasmBenchmarkResult && wasmBenchmarkResult.wasmBufferByteLength != null ? formatBytes(wasmBenchmarkResult.wasmBufferByteLength) : 'N/A'}</td>
                                    </tr>
                                    <tr style={trStyle}>
                                        <td style={tdStyle}>GC Impact</td>
                                        <td style={tdStyle}>{jsBenchmarkResult && jsBenchmarkResult.gcImpactEstimateMs != null ? `${jsBenchmarkResult.gcImpactEstimateMs} ms` : 'N/A'}</td>
                                        <td style={tdStyle}>{wasmBenchmarkResult && wasmBenchmarkResult.gcImpactEstimateMs != null ? `${wasmBenchmarkResult.gcImpactEstimateMs} ms` : 'N/A'}</td>
                                    </tr>
                                    {jsBenchmarkResult && wasmBenchmarkResult && (
                                        <tr style={{ ...trStyle, backgroundColor: '#f0fdf4' }}>
                                            <td style={{ ...tdStyle, fontWeight: 700, color: '#10b981' }}>Speedup</td>
                                            <td style={tdStyle}>baseline</td>
                                            <td style={{ ...tdStyle, fontWeight: 700, color: '#10b981' }}>
                                                {wasmBenchmarkResult.medianExecutionMs > 0
                                                    ? `${(jsBenchmarkResult.medianExecutionMs / wasmBenchmarkResult.medianExecutionMs).toFixed(2)}x`
                                                    : '—'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}

function SliderParam({ label, value, min, max, step, onChange }: {
    label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
    return (
        <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                {label}: {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(2) : value}
            </label>
            <input type="range" min={min} max={max} step={step} value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                style={{ width: '100%' }} />
        </div>
    );
}

function modeTabStyle(isActive: boolean): React.CSSProperties {
    return {
        padding: '0.5rem 1.2rem',
        cursor: 'pointer',
        backgroundColor: isActive ? '#3b82f6' : '#1e293b',
        color: '#fff',
        border: isActive ? '2px solid #60a5fa' : '2px solid #334155',
        borderRadius: '6px',
        fontSize: '0.9rem',
        fontWeight: 600,
    };
}

function btnStyle(bg: string, disabled = false): React.CSSProperties {
    return {
        padding: '0.5rem 1.2rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: bg,
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '0.9rem',
        fontWeight: 600,
        opacity: disabled ? 0.5 : 1,
    };
}

const thStyle: React.CSSProperties = {
    padding: '0.6rem 0.75rem',
    textAlign: 'left',
    color: '#1e293b',
    fontSize: '0.8rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
};

const trStyle: React.CSSProperties = {
    borderBottom: '1px solid #1e293b',
};

const tdStyle: React.CSSProperties = {
    padding: '0.6rem 0.75rem',
    color: '#334155',
};

function formatThroughput(elementsPerSec: number): string {
    if (elementsPerSec >= 1_000_000_000) return `${(elementsPerSec / 1_000_000_000).toFixed(2)}B/sec`;
    if (elementsPerSec >= 1_000_000) return `${(elementsPerSec / 1_000_000).toFixed(2)}M/sec`;
    if (elementsPerSec >= 1_000) return `${(elementsPerSec / 1_000).toFixed(1)}K/sec`;
    return `${elementsPerSec}/sec`;
}

function formatBytes(bytes: number): string {
    if (bytes < 0) return `−${formatBytes(Math.abs(bytes))}`;
    if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
}

