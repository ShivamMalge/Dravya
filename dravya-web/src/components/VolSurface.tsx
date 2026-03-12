'use client';

import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface VolSurfaceProps {
    data?: {
        implied_vol_grid: number[];
        strike_axis: number[];
        time_axis: number[];
        grid_rows: number;
        grid_cols: number;
    } | null;
}

function SurfaceMesh({ implied_vol_grid, grid_rows, grid_cols }: any) {
    const { geometry } = useMemo(() => {
        const geom = new THREE.BufferGeometry();
        const vertices: number[] = [];
        const indices: number[] = [];
        const colors: number[] = [];

        const xScale = 8.0 / (grid_cols - 1 || 1);
        const zScale = 8.0 / (grid_rows - 1 || 1);

        const minIV = Math.min(...implied_vol_grid);
        const maxIV = Math.max(...implied_vol_grid);
        const ivRange = maxIV - minIV || 1;

        for (let row = 0; row < grid_rows; row++) {
            for (let col = 0; col < grid_cols; col++) {
                const idx = row * grid_cols + col;
                const x = col * xScale - 4.0;
                const z = row * zScale - 4.0;
                const y = ((implied_vol_grid[idx] - minIV) / ivRange) * 3.0 - 1.5;

                vertices.push(x, y, z);

                const norm = (implied_vol_grid[idx] - minIV) / ivRange;
                const color = new THREE.Color();
                // Professional Heatmap: Cool Blue -> Deep Purple -> Soft Orange
                if (norm < 0.5) {
                    color.lerpColors(new THREE.Color('#3b82f6'), new THREE.Color('#8b5cf6'), norm * 2);
                } else {
                    color.lerpColors(new THREE.Color('#8b5cf6'), new THREE.Color('#f97316'), (norm - 0.5) * 2);
                }
                colors.push(color.r, color.g, color.b);
            }
        }

        for (let row = 0; row < grid_rows - 1; row++) {
            for (let col = 0; col < grid_cols - 1; col++) {
                const tl = row * grid_cols + col;
                const tr = tl + 1;
                const bl = (row + 1) * grid_cols + col;
                const br = bl + 1;
                indices.push(tl, bl, tr, tr, bl, br);
            }
        }

        geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geom.setIndex(indices);
        geom.computeVertexNormals();
        return { geometry: geom };
    }, [implied_vol_grid, grid_rows, grid_cols]);

    return (
        <group>
            <mesh geometry={geometry} castShadow receiveShadow>
                <meshStandardMaterial
                    vertexColors
                    side={THREE.DoubleSide}
                    roughness={0.4}
                    metalness={0.2}
                />
            </mesh>
            <mesh geometry={geometry}>
                <meshBasicMaterial color="#cbd5e1" wireframe transparent opacity={0.1} />
            </mesh>
        </group>
    );
}

export default function VolSurface({ data }: VolSurfaceProps) {
    // Fallback data if null
    const finalData = useMemo(() => {
        if (data) return data;
        const rows = 20;
        const cols = 20;
        return {
            implied_vol_grid: Array.from({ length: rows * cols }, (_, i) => 0.2 + Math.sin(i / 10) * 0.1 + Math.random() * 0.05),
            grid_rows: rows,
            grid_cols: cols
        };
    }, [data]);

    return (
        <div className="w-full h-full relative">
            <Canvas camera={{ position: [8, 6, 8], fov: 45 }} shadows>
                <color attach="background" args={['#ffffff']} />
                <ambientLight intensity={0.9} />
                <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
                <pointLight position={[-10, 5, -10]} intensity={0.5} color="#3b82f6" />
                <SurfaceMesh {...finalData} />
                <OrbitControls enablePan makeDefault />
            </Canvas>

            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-lg p-3 shadow-sm">
                    <div className="text-[10px] font-bold uppercase text-slate-500 mb-2">Volatility Gradient</div>
                    <div className="h-2 w-32 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 rounded-full" />
                    <div className="flex justify-between text-[8px] font-bold text-slate-400 mt-1 uppercase">
                        <span>Low Vol</span>
                        <span>High Vol</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
