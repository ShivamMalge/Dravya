'use client';

import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats, Line, Text } from '@react-three/drei';

interface TreeVisualizerProps {
    assetPrices: number[][];
    optionValues: number[][];
    finalPrice: number;
}

function TreeNode({ position, color, label }: { position: [number, number, number]; color: string; label: string }) {
    return (
        <group position={position}>
            <mesh>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} />
            </mesh>
            <Text
                position={[0, 0.3, 0]}
                fontSize={0.12}
                color="#e2e8f0"
                anchorX="center"
                anchorY="bottom"
            >
                {label}
            </Text>
        </group>
    );
}

function TreeEdge({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
    return (
        <Line
            points={[start, end]}
            color="#475569"
            lineWidth={1.5}
            opacity={0.6}
            transparent
        />
    );
}

function TreeStructure({ assetPrices, optionValues }: { assetPrices: number[][]; optionValues: number[][] }) {
    const { nodes, edges } = useMemo(() => {
        const nodeElements: { position: [number, number, number]; color: string; label: string; key: string }[] = [];
        const edgeElements: { start: [number, number, number]; end: [number, number, number]; key: string }[] = [];

        const xSpacing = 2.0;
        const ySpacing = 1.2;
        const totalSteps = assetPrices.length;

        for (let step = 0; step < totalSteps; step++) {
            const levelNodes = assetPrices[step].length;
            for (let node = 0; node < levelNodes; node++) {
                const xPos = step * xSpacing - (totalSteps - 1) * xSpacing / 2;
                const yPos = (levelNodes - 1) / 2 * ySpacing - node * ySpacing;
                const position: [number, number, number] = [xPos, yPos, 0];

                const optionVal = optionValues[step]?.[node] ?? 0;
                const maxOption = Math.max(...optionValues.flat(), 1);
                const intensity = Math.min(optionVal / maxOption, 1);
                const r = Math.round(59 + intensity * 196);
                const g = Math.round(130 - intensity * 60);
                const b = Math.round(246 - intensity * 150);
                const nodeColor = `rgb(${r}, ${g}, ${b})`;

                const priceLabel = assetPrices[step][node].toFixed(1);

                nodeElements.push({
                    position,
                    color: nodeColor,
                    label: priceLabel,
                    key: `node-${step}-${node}`,
                });

                if (step < totalSteps - 1) {
                    const nextLevelNodes = assetPrices[step + 1].length;
                    const nextXPos = (step + 1) * xSpacing - (totalSteps - 1) * xSpacing / 2;

                    const upNode = node;
                    const downNode = node + 1;

                    if (upNode < nextLevelNodes) {
                        const upYPos = (nextLevelNodes - 1) / 2 * ySpacing - upNode * ySpacing;
                        edgeElements.push({
                            start: position,
                            end: [nextXPos, upYPos, 0],
                            key: `edge-${step}-${node}-up`,
                        });
                    }

                    if (downNode < nextLevelNodes) {
                        const downYPos = (nextLevelNodes - 1) / 2 * ySpacing - downNode * ySpacing;
                        edgeElements.push({
                            start: position,
                            end: [nextXPos, downYPos, 0],
                            key: `edge-${step}-${node}-down`,
                        });
                    }
                }
            }
        }

        return { nodes: nodeElements, edges: edgeElements };
    }, [assetPrices, optionValues]);

    return (
        <group>
            {edges.map(({ start, end, key }) => (
                <TreeEdge key={key} start={start} end={end} />
            ))}
            {nodes.map(({ position, color, label, key }) => (
                <TreeNode key={key} position={position} color={color} label={label} />
            ))}
        </group>
    );
}

export default function TreeVisualizer({ assetPrices, optionValues, finalPrice }: TreeVisualizerProps) {
    return (
        <div>
            <div style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#1e293b',
                color: '#10b981',
                borderRadius: '6px 6px 0 0',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                fontWeight: 600,
            }}>
                Option Price: ${finalPrice.toFixed(4)}
            </div>
            <div style={{ width: '100%', height: '450px', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
                    <Stats />
                    <color attach="background" args={['#0f172a']} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1.0} />
                    <pointLight position={[-10, -5, -10]} intensity={0.3} color="#10b981" />
                    <TreeStructure assetPrices={assetPrices} optionValues={optionValues} />
                    <OrbitControls enablePan={true} />
                </Canvas>
            </div>
        </div>
    );
}
