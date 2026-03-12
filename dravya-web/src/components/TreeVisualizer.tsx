'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, QuadraticBezierLine, Html } from '@react-three/drei';
import * as THREE from 'three';

interface TreeVisualizerProps {
    treeData: {
        asset_prices: number[][];
        option_values: number[][];
        final_price: number;
        greeks: any;
    } | null;
}

function TreeNode({ position, color, priceLabel, optionLabel }: {
    position: [number, number, number];
    color: string;
    priceLabel: string;
    optionLabel: string;
}) {
    return (
        <group position={position}>
            <mesh>
                <sphereGeometry args={[0.18, 24, 24]} />
                <meshStandardMaterial
                    color={color}
                    transparent
                    opacity={0.8}
                    roughness={0.2}
                    metalness={0.1}
                />
            </mesh>
            <Html center distanceFactor={10} style={{ pointerEvents: 'none' }}>
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded px-2 py-1 shadow-sm flex flex-col items-center gap-0.5 whitespace-nowrap -translate-y-8 select-none">
                    <span className="text-[10px] font-bold text-slate-800 font-mono">{priceLabel}</span>
                    {optionLabel && <span className="text-[8px] font-semibold text-slate-500 font-mono">{optionLabel}</span>}
                </div>
            </Html>
        </group>
    );
}

function TreeEdge({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
    const midPoint: [number, number, number] = [
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2 + 0.3,
        (start[2] + end[2]) / 2
    ];

    return (
        <QuadraticBezierLine
            start={start}
            end={end}
            mid={midPoint}
            color="#94a3b8"
            lineWidth={1}
            opacity={0.2}
            transparent
        />
    );
}

function LatticeStructure({ data }: { data: any }) {
    const { nodes, edges } = useMemo(() => {
        if (!data) return { nodes: [], edges: [] };

        const nodeElements: any[] = [];
        const edgeElements: any[] = [];
        const { asset_prices, option_values } = data;

        const xSpacing = 2.5;
        const ySpacing = 1.2;
        const steps = asset_prices.length;

        for (let step = 0; step < steps; step++) {
            const levelCount = asset_prices[step].length;
            for (let node = 0; node < levelCount; node++) {
                const x = step * xSpacing - (steps - 1) * xSpacing / 2;
                const y = (levelCount - 1) / 2 * ySpacing - node * ySpacing;
                const price = asset_prices[step][node];
                const opt = option_values[step]?.[node] ?? 0;

                const pos: [number, number, number] = [x, y, 0];
                const color = price > data.strike_price ? '#3b82f6' : '#94a3b8';

                nodeElements.push({
                    pos,
                    color,
                    price: `$${price.toFixed(1)}`,
                    opt: opt > 0 ? `V=${opt.toFixed(2)}` : '',
                    key: `node-${step}-${node}`
                });

                if (step < steps - 1) {
                    const nextX = (step + 1) * xSpacing - (steps - 1) * xSpacing / 2;
                    const nextUpY = (asset_prices[step + 1].length - 1) / 2 * ySpacing - node * ySpacing;
                    const nextDnY = (asset_prices[step + 1].length - 1) / 2 * ySpacing - (node + 1) * ySpacing;

                    edgeElements.push({ start: pos, end: [nextX, nextUpY, 0], key: `edge-${step}-${node}-up` });
                    edgeElements.push({ start: pos, end: [nextX, nextDnY, 0], key: `edge-${step}-${node}-dn` });
                }
            }
        }

        return { nodes: nodeElements, edges: edgeElements };
    }, [data]);

    return (
        <group>
            {edges.map(e => <TreeEdge key={e.key} start={e.start} end={e.end} />)}
            {nodes.map(n => <TreeNode key={n.key} position={n.pos} color={n.color} priceLabel={n.price} optionLabel={n.opt} />)}
        </group>
    );
}

export default function TreeVisualizer({ treeData }: TreeVisualizerProps) {
    if (!treeData) {
        return (
            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50/50">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-sm font-medium">No active lattice execution</span>
                    <span className="text-xs">Adjust parameters and click Generate</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative">
            <Canvas camera={{ position: [0, 0, 15], fov: 40 }}>
                <color attach="background" args={['#ffffff']} />
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <LatticeStructure data={treeData} />
                <OrbitControls enablePan={true} makeDefault />
            </Canvas>

            <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm border rounded-lg p-3 shadow-sm border-slate-200">
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>In The Money</span>
                    </div>
                    <div className="flex items-center gap-1.5 border-l pl-4">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <span>Out of Money</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
