'use client';

import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';

interface TreeVisualizerProps {
    assetPrices: number[][];
    optionValues: number[][];
    finalPrice: number;
    strikePrice: number;
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
                <meshStandardMaterial color={color} metalness={0.5} roughness={0.25} emissive={color} emissiveIntensity={0.15} />
            </mesh>
            <Html center distanceFactor={15} style={{ pointerEvents: 'none' }}>
                <div style={{
                    color: '#f1f5f9',
                    fontSize: '9px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    transform: 'translateY(-22px)',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                }}>
                    <div>{priceLabel}</div>
                    <div style={{ color: '#94a3b8', fontSize: '8px', fontWeight: 400 }}>{optionLabel}</div>
                </div>
            </Html>
        </group>
    );
}

function TreeEdge({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
    return (
        <Line
            points={[start, end]}
            color="#334155"
            lineWidth={1.2}
            opacity={0.5}
            transparent
        />
    );
}

function LatticeStructure({ assetPrices, optionValues, strikePrice }: {
    assetPrices: number[][];
    optionValues: number[][];
    strikePrice: number;
}) {
    const { nodes, edges } = useMemo(() => {
        const nodeElements: { position: [number, number, number]; color: string; priceLabel: string; optionLabel: string; key: string }[] = [];
        const edgeElements: { start: [number, number, number]; end: [number, number, number]; key: string }[] = [];

        const xSpacing = 2.2;
        const ySpacing = 1.3;
        const totalSteps = assetPrices.length;

        for (let step = 0; step < totalSteps; step++) {
            const levelNodeCount = assetPrices[step].length;
            for (let node = 0; node < levelNodeCount; node++) {
                const xPos = step * xSpacing - (totalSteps - 1) * xSpacing / 2;
                const yPos = (levelNodeCount - 1) / 2 * ySpacing - node * ySpacing;
                const position: [number, number, number] = [xPos, yPos, 0];

                const assetPrice = assetPrices[step][node];
                const optionVal = optionValues[step]?.[node] ?? 0;

                const isInTheMoney = assetPrice > strikePrice;
                const moneyness = Math.abs(assetPrice - strikePrice) / strikePrice;
                const saturation = Math.min(moneyness * 3, 1);

                let nodeColor: string;
                if (isInTheMoney) {
                    const g = Math.round(120 + saturation * 135);
                    const r = Math.round(40 + (1 - saturation) * 60);
                    const b = Math.round(50 + (1 - saturation) * 40);
                    nodeColor = `rgb(${r}, ${g}, ${b})`;
                } else {
                    const r = Math.round(180 + saturation * 75);
                    const g = Math.round(60 + (1 - saturation) * 60);
                    const b = Math.round(50 + (1 - saturation) * 40);
                    nodeColor = `rgb(${r}, ${g}, ${b})`;
                }

                nodeElements.push({
                    position,
                    color: nodeColor,
                    priceLabel: `$${assetPrice.toFixed(1)}`,
                    optionLabel: optionVal > 0 ? `V=${optionVal.toFixed(2)}` : '',
                    key: `node-${step}-${node}`,
                });

                if (step < totalSteps - 1) {
                    const nextLevelCount = assetPrices[step + 1].length;
                    const nextXPos = (step + 1) * xSpacing - (totalSteps - 1) * xSpacing / 2;

                    if (node < nextLevelCount) {
                        const upYPos = (nextLevelCount - 1) / 2 * ySpacing - node * ySpacing;
                        edgeElements.push({ start: position, end: [nextXPos, upYPos, 0], key: `edge-${step}-${node}-up` });
                    }
                    if (node + 1 < nextLevelCount) {
                        const downYPos = (nextLevelCount - 1) / 2 * ySpacing - (node + 1) * ySpacing;
                        edgeElements.push({ start: position, end: [nextXPos, downYPos, 0], key: `edge-${step}-${node}-down` });
                    }
                }
            }
        }

        return { nodes: nodeElements, edges: edgeElements };
    }, [assetPrices, optionValues, strikePrice]);

    return (
        <group>
            {edges.map(({ start, end, key }) => (
                <TreeEdge key={key} start={start} end={end} />
            ))}
            {nodes.map(({ position, color, priceLabel, optionLabel, key }) => (
                <TreeNode key={key} position={position} color={color} priceLabel={priceLabel} optionLabel={optionLabel} />
            ))}
        </group>
    );
}

export default function TreeVisualizer({ assetPrices, optionValues, finalPrice, strikePrice }: TreeVisualizerProps) {
    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.6rem 1rem',
                backgroundColor: '#0f172a',
                borderRadius: '8px 8px 0 0',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
            }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>
                    Option Price: ${finalPrice.toFixed(4)}
                </span>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    <span style={{ color: '#22c55e' }}>●</span> ITM &nbsp;
                    <span style={{ color: '#ef4444' }}>●</span> OTM
                </span>
            </div>
            <div style={{ width: '100%', height: '480px', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                <Canvas camera={{ position: [0, 0, 14], fov: 50 }}>
                    <color attach="background" args={['#020617']} />
                    <ambientLight intensity={0.4} />
                    <pointLight position={[10, 10, 10]} intensity={1.2} />
                    <pointLight position={[-8, -5, -8]} intensity={0.3} color="#10b981" />
                    <pointLight position={[0, 8, 5]} intensity={0.2} color="#3b82f6" />
                    <LatticeStructure assetPrices={assetPrices} optionValues={optionValues} strikePrice={strikePrice} />
                    <OrbitControls enablePan={true} enableDamping={true} dampingFactor={0.08} />
                </Canvas>
            </div>
        </div>
    );
}
