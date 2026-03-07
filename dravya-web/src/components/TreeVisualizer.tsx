'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, QuadraticBezierLine, Html } from '@react-three/drei';
import * as THREE from 'three';
import Axes3D from './Axes3D';

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
    const groupRef = useRef<THREE.Group>(null);
    const randOffset = useMemo(() => Math.random() * Math.PI * 2, []);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + randOffset) * 0.05;
        }
    });

    return (
        <group ref={groupRef} position={position}>
            <mesh>
                <sphereGeometry args={[0.22, 32, 32]} />
                <meshPhysicalMaterial
                    color={color}
                    transmission={0.4}
                    thickness={0.5}
                    roughness={0.1}
                    metalness={0.8}
                    clearcoat={1.0}
                    emissive={color}
                    emissiveIntensity={0.4}
                />
            </mesh>
            <Html center distanceFactor={12} style={{ pointerEvents: 'none', zIndex: 10 }}>
                <div style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.45)',
                    backdropFilter: 'blur(6px)',
                    border: `1px solid ${color}`,
                    borderRadius: '6px',
                    padding: '4px 8px',
                    color: '#f8fafc',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    transform: 'translateY(-30px)',
                    boxShadow: `0 4px 12px ${color}40`,
                    userSelect: 'none'
                }}>
                    <div>{priceLabel}</div>
                    {optionLabel && <div style={{ color: '#cbd5e1', fontSize: '9px', fontWeight: 500, marginTop: '2px' }}>{optionLabel}</div>}
                </div>
            </Html>
        </group>
    );
}

function TreeEdge({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
    const midPoint: [number, number, number] = [
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2 + 0.5,
        (start[2] + end[2]) / 2
    ];

    return (
        <QuadraticBezierLine
            start={start}
            end={end}
            mid={midPoint}
            color="#475569"
            lineWidth={1.5}
            opacity={0.3}
            transparent
            dashed={false}
        />
    );
}

function LatticeStructure({ assetPrices, optionValues, strikePrice }: {
    assetPrices: number[][];
    optionValues: number[][];
    strikePrice: number;
}) {
    const { nodes, edges, bounds } = useMemo(() => {
        const nodeElements: { position: [number, number, number]; color: string; priceLabel: string; optionLabel: string; key: string }[] = [];
        const edgeElements: { start: [number, number, number]; end: [number, number, number]; key: string }[] = [];

        let minAsset = Infinity;
        let maxAsset = -Infinity;
        let maxOption = -Infinity;

        for (const level of assetPrices) {
            for (const val of level) {
                if (val < minAsset) minAsset = val;
                if (val > maxAsset) maxAsset = val;
            }
        }
        for (const level of optionValues) {
            for (const val of level) {
                if (val > maxOption) maxOption = val;
            }
        }
        const minOption = 0;
        const optionRange = maxOption - minOption || 1;

        const xSpacing = 2.2;
        const ySpacing = 1.3;
        const totalSteps = assetPrices.length;

        for (let step = 0; step < totalSteps; step++) {
            const levelNodeCount = assetPrices[step].length;
            for (let node = 0; node < levelNodeCount; node++) {
                const xPos = step * xSpacing - (totalSteps - 1) * xSpacing / 2;
                const yPos = (levelNodeCount - 1) / 2 * ySpacing - node * ySpacing;
                const assetPrice = assetPrices[step][node];
                const optionVal = optionValues[step]?.[node] ?? 0;

                const zSpacing = 6.0;
                const zPos = ((optionVal - minOption) / optionRange) * zSpacing - zSpacing / 2;
                const position: [number, number, number] = [xPos, yPos, zPos];

                const isInTheMoney = assetPrice > strikePrice;
                const moneyness = Math.abs(assetPrice - strikePrice) / strikePrice;
                const saturation = Math.min(moneyness * 3, 1);

                let nodeColor: string;
                if (isInTheMoney) {
                    const g = Math.round(150 + saturation * 105);
                    const r = Math.round(30 + (1 - saturation) * 50);
                    const b = Math.round(200 + saturation * 55);
                    nodeColor = `rgb(${r}, ${g}, ${b})`;
                } else {
                    const r = Math.round(200 + saturation * 55);
                    const g = Math.round(40 + (1 - saturation) * 60);
                    const b = Math.round(80 + (1 - saturation) * 40);
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
                        const nextUpOption = optionValues[step + 1]?.[node] ?? 0;
                        const upZPos = ((nextUpOption - minOption) / optionRange) * zSpacing - zSpacing / 2;
                        edgeElements.push({ start: position, end: [nextXPos, upYPos, upZPos], key: `edge-${step}-${node}-up` });
                    }
                    if (node + 1 < nextLevelCount) {
                        const downYPos = (nextLevelCount - 1) / 2 * ySpacing - (node + 1) * ySpacing;
                        const nextDownOption = optionValues[step + 1]?.[node + 1] ?? 0;
                        const downZPos = ((nextDownOption - minOption) / optionRange) * zSpacing - zSpacing / 2;
                        edgeElements.push({ start: position, end: [nextXPos, downYPos, downZPos], key: `edge-${step}-${node}-down` });
                    }
                }
            }
        }

        const xLength = (totalSteps - 1) * xSpacing || 1;
        const yLength = (totalSteps - 1) * ySpacing || 1;
        const zLength = 6.0;

        return {
            nodes: nodeElements,
            edges: edgeElements,
            bounds: { minAsset, maxAsset, minOption, maxOption, xLength, yLength, zLength, totalSteps }
        };
    }, [assetPrices, optionValues, strikePrice]);

    return (
        <group>
            <Axes3D
                xLabel="Time Steps"
                yLabel="Asset Price"
                zLabel="Option Value"
                xDomain={[0, bounds.totalSteps - 1]}
                yDomain={[bounds.minAsset, bounds.maxAsset]}
                zDomain={[bounds.minOption, bounds.maxOption]}
                scaleVector={[bounds.xLength, bounds.yLength, bounds.zLength]}
            >
                {edges.map(({ start, end, key }) => (
                    <TreeEdge key={key} start={start} end={end} />
                ))}
                {nodes.map(({ position, color, priceLabel, optionLabel, key }) => (
                    <TreeNode key={key} position={position} color={color} priceLabel={priceLabel} optionLabel={optionLabel} />
                ))}
            </Axes3D>
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
                <Canvas camera={{ position: [20, 10, 20], fov: 50 }} shadows>
                    <color attach="background" args={['#020617']} />
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
                    <pointLight position={[-8, -5, -8]} intensity={0.8} color="#10b981" />
                    <pointLight position={[0, 8, 5]} intensity={0.5} color="#3b82f6" />
                    <LatticeStructure assetPrices={assetPrices} optionValues={optionValues} strikePrice={strikePrice} />
                    <OrbitControls enablePan={true} enableDamping={true} dampingFactor={0.08} />
                </Canvas>
            </div>
        </div>
    );
}
