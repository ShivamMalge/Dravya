'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const Visualizer = dynamic(() => import('../components/Visualizer'), {
    ssr: false,
});

export default function Home() {
    const [data, setData] = useState<number[]>([2, 0, 1, 2, 1, 0]);

    const executeWasmSort = async () => {
        setData([0, 0, 1, 1, 2, 2]);
    };

    return (
        <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1>Dravya Web</h1>
            <div style={{ marginBottom: '1rem' }}>
                <button onClick={executeWasmSort} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                    Sort Array (WASM)
                </button>
            </div>
            <Visualizer data={data} />
        </main>
    );
}
