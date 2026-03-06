'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import * as THREE from 'three';

const COLOR_MAP: Record<number, string> = {
    0: '#ef4444',
    1: '#eab308',
    2: '#3b82f6',
};

const ANIMATION_DURATION = 750;

function AnimatedBox({ value, targetX, index }: { value: number; targetX: number; index: number }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);
    const startTime = useRef<number | null>(null);
    const startX = useRef<number>(targetX);
    const startY = useRef<number>(3);
    const currentTargetX = useRef<number>(targetX);

    useEffect(() => {
        if (meshRef.current) {
            startX.current = meshRef.current.position.x;
            startY.current = meshRef.current.position.y;
            currentTargetX.current = targetX;
            startTime.current = performance.now();
        }
    }, [targetX, value]);

    useFrame(() => {
        if (!meshRef.current || startTime.current === null) return;

        const elapsed = performance.now() - startTime.current;
        const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

        const eased = progress < 0.5
            ? Math.pow(2, 20 * progress - 10) / 2
            : (2 - Math.pow(2, -20 * progress + 10)) / 2;

        meshRef.current.position.x = startX.current + (currentTargetX.current - startX.current) * eased;
        meshRef.current.position.y = startY.current + (0 - startY.current) * eased;

        const scale = 1 + Math.sin(progress * Math.PI) * 0.15;
        meshRef.current.scale.set(scale, scale, scale);

        if (progress >= 1) {
            startTime.current = null;
            meshRef.current.position.x = currentTargetX.current;
            meshRef.current.position.y = 0;
            meshRef.current.scale.set(1, 1, 1);
        }
    });

    return (
        <mesh ref={meshRef} position={[targetX, 3, 0]}>
            <boxGeometry args={[0.9, 0.9, 0.9]} />
            <meshStandardMaterial
                ref={materialRef}
                color={COLOR_MAP[value]}
                metalness={0.3}
                roughness={0.4}
            />
        </mesh>
    );
}

function ArrayMeshes({ data }: { data: number[] }) {
    const meshPositionMap = useMemo(() => {
        const offset = (data.length - 1) / 2;
        return data.map((_, i) => (i - offset) * 1.2);
    }, [data]);

    return (
        <group>
            {data.map((val, i) => (
                <AnimatedBox
                    key={`box-${i}`}
                    value={val}
                    targetX={meshPositionMap[i]}
                    index={i}
                />
            ))}
        </group>
    );
}

export default function Visualizer({ data }: { data: number[] }) {
    return (
        <div style={{ width: '100%', height: '450px', borderRadius: '8px', overflow: 'hidden' }}>
            <Canvas camera={{ position: [0, 4, 8], fov: 50 }}>
                <Stats />
                <color attach="background" args={['#1a1a2e']} />
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={1.2} />
                <pointLight position={[-10, -5, -10]} intensity={0.3} color="#3b82f6" />
                <ArrayMeshes data={data} />
                <OrbitControls enablePan={false} />
                <gridHelper args={[20, 20, '#333355', '#222244']} />
            </Canvas>
        </div>
    );
}
