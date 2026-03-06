'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

const Visualizer = dynamic(() => import('../components/Visualizer'), {
    ssr: false,
});

function generateShuffledArray(length: number): number[] {
    const values = [0, 1, 2];
    return Array.from({ length }, () => values[Math.floor(Math.random() * values.length)]);
}

export default function Home() {
    const [data, setData] = useState<number[]>([2, 0, 1, 2, 1, 0]);
    const [isEngineReady, setIsEngineReady] = useState(false);
    const [isSorting, setIsSorting] = useState(false);

    const executeWasmSort = useCallback(async () => {
        setIsSorting(true);
        try {
            const wasmModule = await import('dravya-core');
            if (!isEngineReady) {
                await wasmModule.default();
                setIsEngineReady(true);
            }
            const buffer = new Uint8Array(data);
            wasmModule.sort_colors(buffer);
            setData(Array.from(buffer));
        } catch (err) {
            console.error(err);
        } finally {
            setIsSorting(false);
        }
    }, [data, isEngineReady]);

    const handleShuffle = useCallback(() => {
        setData(generateShuffledArray(6));
    }, []);

    return (
        <main style={{
            padding: '2rem',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            maxWidth: '900px',
            margin: '0 auto',
        }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Dravya Engine</h1>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={executeWasmSort}
                    disabled={isSorting}
                    style={{
                        padding: '0.6rem 1.4rem',
                        cursor: isSorting ? 'not-allowed' : 'pointer',
                        backgroundColor: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        opacity: isSorting ? 0.6 : 1,
                    }}
                >
                    {isSorting ? 'Sorting...' : 'Sort Array (WASM)'}
                </button>
                <button
                    onClick={handleShuffle}
                    style={{
                        padding: '0.6rem 1.4rem',
                        cursor: 'pointer',
                        backgroundColor: '#6b7280',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                    }}
                >
                    Shuffle
                </button>
            </div>
            <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
            }}>
                [{data.join(', ')}]
            </div>
            <Visualizer data={data} />
        </main>
    );
}
