'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Visualizer = dynamic(() => import('../components/Visualizer'), { ssr: false });
const TreeVisualizer = dynamic(() => import('../components/TreeVisualizer'), { ssr: false });

type DashboardMode = 'sort' | 'binomial';

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
            const modulePath = ['..', '..', 'dravya-core', 'pkg', 'dravya_core.js'].join('/');
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
            const modulePath = ['..', '..', 'dravya-core', 'pkg', 'dravya_core.js'].join('/');
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
