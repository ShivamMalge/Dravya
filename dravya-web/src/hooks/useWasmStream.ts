import { useEffect, useState, useRef } from 'react';

export interface TickData {
    price: number;
    volume: number;
    timestamp: bigint;
}

export interface WasmStreamResult {
    data: TickData[];
    stats: { pointsPerSecond: number; latencyMs: number };
    isConnected: boolean;
}

export function useWasmStream(
    wasmInstance?: any,
    ringBuffer?: any,
    capacity: number = 100,
    intervalMs: number = 100
): WasmStreamResult {
    const [data, setData] = useState<TickData[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [stats, setStats] = useState({ pointsPerSecond: 0, latencyMs: 0 });
    const lastReadIndex = useRef<number>(0);

    useEffect(() => {
        // Initial check for wasmInstance and ringBuffer
        if (!wasmInstance || !ringBuffer) return;

        const timer = setInterval(() => {
            if (wasmInstance && ringBuffer) {
                // Try to acquire lock
                if (!ringBuffer.acquire_visualizer_lock()) {
                    return;
                }

                try {
                    setIsConnected(true);
                    const latestPtr = ringBuffer.read_latest_ptr();
                    const memory = wasmInstance.memory?.buffer || (wasmInstance as any).WASM_MEMORY?.buffer;

                    if (!memory) {
                        ringBuffer.release_visualizer_lock();
                        return;
                    }

                    // TickData size is 24 bytes (f64, f64, u64)
                    const tickCount = capacity;
                    const view = new DataView(memory, latestPtr, tickCount * 24);

                    const ticks: TickData[] = [];
                    for (let i = 0; i < tickCount; i++) {
                        const offset = i * 24;
                        const price = view.getFloat64(offset, true);
                        const volume = view.getFloat64(offset + 8, true);
                        const timestamp = view.getBigUint64(offset + 16, true);

                        if (price !== 0) {
                            ticks.push({ price, volume, timestamp });
                        }
                    }

                    setData(ticks);
                    setStats({ pointsPerSecond: ticks.length * (1000 / intervalMs), latencyMs: 0 });
                } finally {
                    ringBuffer.release_visualizer_lock();
                }
            }
        }, intervalMs);

        return () => clearInterval(timer);
    }, [wasmInstance, ringBuffer, capacity, intervalMs]);

    return { data, stats, isConnected };
}
