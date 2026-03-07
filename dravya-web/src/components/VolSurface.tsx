'use client';

import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Axes3D from './Axes3D';

interface VolSurfaceProps {
    impliedVolGrid: number[];
    strikeAxis: number[];
    timeAxis: number[];
    gridRows: number;
    gridCols: number;
}

function SurfaceMesh({ impliedVolGrid, strikeAxis, timeAxis, gridRows, gridCols }: VolSurfaceProps) {
    const geometryKey = useMemo(() => impliedVolGrid.reduce((acc, v, i) => acc + v * (i + 1), 0), [impliedVolGrid]);

    const { geometry, colorArray } = useMemo(() => {
        const geom = new THREE.BufferGeometry();
        const vertices: number[] = [];
        const indices: number[] = [];
        const colors: number[] = [];

        const xScale = 8.0 / (gridCols - 1 || 1);
        const zScale = 8.0 / (gridRows - 1 || 1);

        let minIV = Infinity;
        let maxIV = -Infinity;
        for (const iv of impliedVolGrid) {
            if (iv < minIV) minIV = iv;
            if (iv > maxIV) maxIV = iv;
        }
        const ivRange = maxIV - minIV || 1;

        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
                const idx = row * gridCols + col;
                const xPos = col * xScale - 4.0;
                const zPos = row * zScale - 4.0;
                const yPos = ((impliedVolGrid[idx] - minIV) / ivRange) * 4.0 - 2.0;

                vertices.push(xPos, yPos, zPos);

                const normalizedIV = (impliedVolGrid[idx] - minIV) / ivRange;
                const r = normalizedIV;
                const g = 0.2 + (1 - normalizedIV) * 0.3;
                const b = 1.0 - normalizedIV;
                colors.push(r, g, b);
            }
        }

        for (let row = 0; row < gridRows - 1; row++) {
            for (let col = 0; col < gridCols - 1; col++) {
                const topLeft = row * gridCols + col;
                const topRight = topLeft + 1;
                const bottomLeft = (row + 1) * gridCols + col;
                const bottomRight = bottomLeft + 1;

                indices.push(topLeft, bottomLeft, topRight);
                indices.push(topRight, bottomLeft, bottomRight);
            }
        }

        geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geom.setIndex(indices);
        geom.computeVertexNormals();

        return { geometry: geom, colorArray: colors };
    }, [impliedVolGrid, gridRows, gridCols]);

    return (
        <mesh key={geometryKey} geometry={geometry}>
            <meshStandardMaterial vertexColors side={THREE.DoubleSide} metalness={0.3} roughness={0.5} />
        </mesh>
    );
}

function AxisLabels({ strikeAxis, timeAxis }: { strikeAxis: number[]; timeAxis: number[] }) {
    return null;
}

export default function VolSurface({ impliedVolGrid, strikeAxis, timeAxis, gridRows, gridCols }: VolSurfaceProps) {
    const minIV = Math.min(...impliedVolGrid);
    const maxIV = Math.max(...impliedVolGrid);

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
                fontSize: '0.8rem',
            }}>
                <span style={{ color: '#60a5fa', fontWeight: 700 }}>
                    Implied Volatility Surface
                </span>
                <span style={{ color: '#64748b' }}>
                    IV Range: {(minIV * 100).toFixed(1)}% – {(maxIV * 100).toFixed(1)}%
                </span>
            </div>
            <div style={{ width: '100%', height: '500px', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                <Canvas camera={{ position: [6, 5, 8], fov: 50 }}>
                    <color attach="background" args={['#020617']} />
                    <ambientLight intensity={0.4} />
                    <directionalLight position={[5, 10, 5]} intensity={0.8} />
                    <pointLight position={[-5, 3, -5]} intensity={0.3} color="#60a5fa" />
                    <Axes3D
                        xLabel="Strike"
                        yLabel="Implied Volatility (%)"
                        zLabel="Time (Years)"
                        xDomain={[Math.min(...strikeAxis), Math.max(...strikeAxis)]}
                        yDomain={[minIV * 100, maxIV * 100]}
                        zDomain={[Math.min(...timeAxis), Math.max(...timeAxis)]}
                        scaleVector={[8.0, 4.0, 8.0]}
                    >
                        <SurfaceMesh
                            impliedVolGrid={impliedVolGrid}
                            strikeAxis={strikeAxis}
                            timeAxis={timeAxis}
                            gridRows={gridRows}
                            gridCols={gridCols}
                        />
                    </Axes3D>
                    <OrbitControls enablePan={true} enableDamping={true} dampingFactor={0.08} />
                </Canvas>
            </div>
        </div>
    );
}
