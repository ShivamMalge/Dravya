'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Visualizer = dynamic(() => import('../components/Visualizer'), {
    ssr: false,
});

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

export default function Home() {
    const [stepHistory, setStepHistory] = useState<number[][]>([[2, 0, 1, 2, 1, 0]]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(300);
    const playbackIntervalId = useRef<ReturnType<typeof setTimeout> | null>(null);

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
                playbackIntervalId.current = setTimeout(advanceStep, playbackSpeed);
                return nextStep;
            });
        };

        playbackIntervalId.current = setTimeout(advanceStep, playbackSpeed);

        return () => {
            if (playbackIntervalId.current) {
                clearTimeout(playbackIntervalId.current);
            }
        };
    }, [isPlaying, playbackSpeed, stepHistory.length]);

    const stepForward = useCallback(() => {
        stopPlayback();
        setCurrentStep(prev => Math.min(prev + 1, stepHistory.length - 1));
    }, [stepHistory.length, stopPlayback]);

    const stepBackward = useCallback(() => {
        stopPlayback();
        setCurrentStep(prev => Math.max(prev - 1, 0));
    }, [stopPlayback]);

    const hasHistory = stepHistory.length > 1;

    return (
        <main style={{
            padding: '2rem',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            maxWidth: '900px',
            margin: '0 auto',
        }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Dravya Engine</h1>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <button onClick={executeSort} style={buttonStyle('#3b82f6')}>
                    Sort
                </button>
                <button onClick={handleShuffle} style={buttonStyle('#6b7280')}>
                    Shuffle
                </button>
                {hasHistory && (
                    <>
                        <button onClick={playSimulation} disabled={isPlaying} style={buttonStyle('#10b981', isPlaying)}>
                            {isPlaying ? 'Playing...' : 'Play'}
                        </button>
                        <button onClick={stopPlayback} disabled={!isPlaying} style={buttonStyle('#ef4444', !isPlaying)}>
                            Stop
                        </button>
                        <button onClick={stepBackward} disabled={currentStep === 0} style={buttonStyle('#8b5cf6', currentStep === 0)}>
                            ◀ Step
                        </button>
                        <button onClick={stepForward} disabled={currentStep >= stepHistory.length - 1} style={buttonStyle('#8b5cf6', currentStep >= stepHistory.length - 1)}>
                            Step ▶
                        </button>
                    </>
                )}
            </div>

            {hasHistory && (
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, marginRight: '0.5rem' }}>
                        Speed: {playbackSpeed}ms
                    </label>
                    <input
                        type="range"
                        min={50}
                        max={1000}
                        step={50}
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                        style={{ verticalAlign: 'middle', width: '200px' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af', marginLeft: '0.75rem' }}>
                        Step {currentStep + 1} / {stepHistory.length}
                    </span>
                </div>
            )}

            <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
            }}>
                [{currentData.join(', ')}]
            </div>

            <Visualizer data={currentData} />
        </main>
    );
}

function buttonStyle(bg: string, disabled = false): React.CSSProperties {
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
