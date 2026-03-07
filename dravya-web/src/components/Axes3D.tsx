'use client';

import React, { useMemo } from 'react';
import { Text, Line } from '@react-three/drei';

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

        const tickColor = '#94a3b8';
        const gridColor = '#334155';
        const labelColor = '#e2e8f0';

        const lerp = (min: number, max: number, t: number) => min + (max - min) * t;

        for (let i = 0; i < 5; i++) {
            const fraction = i / 4.0;
            const xPos = lerp(xMinPos, xMaxPos, fraction);
            const xVal = lerp(xDomain[0], xDomain[1], fraction);

            lines.push(<Line key={`x-grid-xy-${i}`} points={[[xPos, yMinPos, zMinPos], [xPos, yMaxPos, zMinPos]]} color={gridColor} opacity={0.2} transparent />);
            lines.push(<Line key={`x-grid-xz-${i}`} points={[[xPos, yMinPos, zMinPos], [xPos, yMinPos, zMaxPos]]} color={gridColor} opacity={0.2} transparent />);

            ticks.push(
                <Text key={`x-tick-${i}`} position={[xPos, yMinPos - 0.4, zMaxPos + 0.4]} fontSize={0.25} color={tickColor}>
                    {xVal.toFixed(2)}
                </Text>
            );
        }

        for (let i = 0; i < 5; i++) {
            const fraction = i / 4.0;
            const yPos = lerp(yMinPos, yMaxPos, fraction);
            const yVal = lerp(yDomain[0], yDomain[1], fraction);

            lines.push(<Line key={`y-grid-xy-${i}`} points={[[xMinPos, yPos, zMinPos], [xMaxPos, yPos, zMinPos]]} color={gridColor} opacity={0.2} transparent />);
            lines.push(<Line key={`y-grid-yz-${i}`} points={[[xMinPos, yPos, zMinPos], [xMinPos, yPos, zMaxPos]]} color={gridColor} opacity={0.2} transparent />);

            ticks.push(
                <Text key={`y-tick-${i}`} position={[xMinPos - 0.4, yPos, zMaxPos + 0.4]} fontSize={0.25} color={tickColor}>
                    {yVal.toFixed(2)}
                </Text>
            );
        }

        for (let i = 0; i < 5; i++) {
            const fraction = i / 4.0;
            const zPos = lerp(zMinPos, zMaxPos, fraction);
            const zVal = lerp(zDomain[0], zDomain[1], fraction);

            lines.push(<Line key={`z-grid-xz-${i}`} points={[[xMinPos, yMinPos, zPos], [xMaxPos, yMinPos, zPos]]} color={gridColor} opacity={0.2} transparent />);
            lines.push(<Line key={`z-grid-yz-${i}`} points={[[xMinPos, yMinPos, zPos], [xMinPos, yMaxPos, zPos]]} color={gridColor} opacity={0.2} transparent />);

            ticks.push(
                <Text key={`z-tick-${i}`} position={[xMaxPos + 0.4, yMinPos - 0.4, zPos]} fontSize={0.25} color={tickColor}>
                    {zVal.toFixed(2)}
                </Text>
            );
        }

        labels.push(<Text key="x-label" position={[0, yMinPos - 1.0, zMaxPos + 1.0]} fontSize={0.35} color={labelColor}>{xLabel}</Text>);
        labels.push(<Text key="y-label" position={[xMinPos - 1.2, 0, zMaxPos + 1.0]} fontSize={0.35} color={labelColor} rotation={[0, 0, Math.PI / 2]}>{yLabel}</Text>);
        labels.push(<Text key="z-label" position={[xMaxPos + 1.0, yMinPos - 1.0, 0]} fontSize={0.35} color={labelColor}>{zLabel}</Text>);

        return { gridLines: lines, tickNodes: ticks, axesLabels: labels };
    }, [xDomain, yDomain, zDomain, scaleVector, xLabel, yLabel, zLabel]);

    return (
        <group>
            {gridLines}
            {tickNodes}
            {axesLabels}
            {children}
        </group>
    );
}
