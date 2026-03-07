'use client';

import React, { useMemo } from 'react';
import { Html, Line } from '@react-three/drei';

interface Axes3DProps {
    xLabel: string;
    yLabel: string;
    zLabel: string;
    xDomain: [number, number];
    yDomain: [number, number];
    zDomain: [number, number];
    scaleVector: [number, number, number];
    children?: React.ReactNode;
}

export default function Axes3D({
    xLabel,
    yLabel,
    zLabel,
    xDomain,
    yDomain,
    zDomain,
    scaleVector,
    children,
}: Axes3DProps) {
    const { gridLines, tickNodes, axesLabels } = useMemo(() => {
        const lines: React.ReactNode[] = [];
        const ticks: React.ReactNode[] = [];
        const labels: React.ReactNode[] = [];

        const [sx, sy, sz] = scaleVector;

        const xMinPos = -sx / 2;
        const xMaxPos = sx / 2;
        const yMinPos = -sy / 2;
        const yMaxPos = sy / 2;
        const zMinPos = -sz / 2;
        const zMaxPos = sz / 2;

        const tickColor = '#64748b';
        const gridColor = '#334155';
        const labelColor = '#94a3b8';

        const lerp = (min: number, max: number, t: number) => min + (max - min) * t;

        for (let i = 0; i < 5; i++) {
            const fraction = i / 4.0;
            const xPos = lerp(xMinPos, xMaxPos, fraction);
            const xVal = lerp(xDomain[0], xDomain[1], fraction);

            lines.push(<Line key={`x-grid-xy-${i}`} points={[[xPos, yMinPos, zMinPos], [xPos, yMaxPos, zMinPos]]} color={gridColor} opacity={0.15} transparent />);
            lines.push(<Line key={`x-grid-xz-${i}`} points={[[xPos, yMinPos, zMinPos], [xPos, yMinPos, zMaxPos]]} color={gridColor} opacity={0.15} transparent />);

            ticks.push(
                <Html key={`x-tick-${i}`} position={[xPos, yMinPos - 0.5, zMaxPos + 0.5]} center style={{ color: tickColor, fontSize: '10px', fontFamily: 'monospace', userSelect: 'none' }}>
                    {xVal.toFixed(2)}
                </Html>
            );
        }

        for (let i = 0; i < 5; i++) {
            const fraction = i / 4.0;
            const yPos = lerp(yMinPos, yMaxPos, fraction);
            const yVal = lerp(yDomain[0], yDomain[1], fraction);

            lines.push(<Line key={`y-grid-xy-${i}`} points={[[xMinPos, yPos, zMinPos], [xMaxPos, yPos, zMinPos]]} color={gridColor} opacity={0.15} transparent />);
            lines.push(<Line key={`y-grid-yz-${i}`} points={[[xMinPos, yPos, zMinPos], [xMinPos, yPos, zMaxPos]]} color={gridColor} opacity={0.15} transparent />);

            ticks.push(
                <Html key={`y-tick-${i}`} position={[xMinPos - 0.5, yPos, zMaxPos + 0.5]} center style={{ color: tickColor, fontSize: '10px', fontFamily: 'monospace', userSelect: 'none' }}>
                    {yVal.toFixed(2)}
                </Html>
            );
        }

        for (let i = 0; i < 5; i++) {
            const fraction = i / 4.0;
            const zPos = lerp(zMinPos, zMaxPos, fraction);
            const zVal = lerp(zDomain[0], zDomain[1], fraction);

            lines.push(<Line key={`z-grid-xz-${i}`} points={[[xMinPos, yMinPos, zPos], [xMaxPos, yMinPos, zPos]]} color={gridColor} opacity={0.15} transparent />);
            lines.push(<Line key={`z-grid-yz-${i}`} points={[[xMinPos, yMinPos, zPos], [xMinPos, yMaxPos, zPos]]} color={gridColor} opacity={0.15} transparent />);

            ticks.push(
                <Html key={`z-tick-${i}`} position={[xMaxPos + 0.5, yMinPos - 0.5, zPos]} center style={{ color: tickColor, fontSize: '10px', fontFamily: 'monospace', userSelect: 'none' }}>
                    {zVal.toFixed(2)}
                </Html>
            );
        }

        labels.push(<Html key="x-label" position={[0, yMinPos - 1.2, zMaxPos + 1.2]} center style={{ color: labelColor, fontSize: '12px', fontWeight: 600, fontFamily: 'sans-serif', whiteSpace: 'nowrap', userSelect: 'none' }}>{xLabel}</Html>);
        labels.push(<Html key="y-label" position={[xMinPos - 1.5, 0, zMaxPos + 1.2]} center style={{ color: labelColor, fontSize: '12px', fontWeight: 600, fontFamily: 'sans-serif', whiteSpace: 'nowrap', userSelect: 'none' }}>{yLabel}</Html>);
        labels.push(<Html key="z-label" position={[xMaxPos + 1.2, yMinPos - 1.2, 0]} center style={{ color: labelColor, fontSize: '12px', fontWeight: 600, fontFamily: 'sans-serif', whiteSpace: 'nowrap', userSelect: 'none' }}>{zLabel}</Html>);

        return { gridLines: lines, tickNodes: ticks, axesLabels: labels };
    }, [xDomain, yDomain, zDomain, scaleVector, xLabel, yLabel, zLabel]);

    return (
        <group>
            <mesh position={[0, -scaleVector[1] / 2 - 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[scaleVector[0] * 1.5, scaleVector[2] * 1.5]} />
                <meshBasicMaterial color="#020617" opacity={0.6} transparent depthWrite={false} />
            </mesh>
            {gridLines}
            {tickNodes}
            {axesLabels}
            {children}
        </group>
    );
}
