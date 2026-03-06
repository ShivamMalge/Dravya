import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Box, OrbitControls } from '@react-three/drei';
import anime from 'animejs';
import * as THREE from 'three';

const COLOR_MAP: Record<number, string> = {
    0: '#ef4444',
    1: '#eab308',
    2: '#3b82f6',
};

const ArrayMeshes = ({ data }: { data: number[] }) => {
    const groupRef = useRef<THREE.Group>(null);

    useEffect(() => {
        if (groupRef.current) {
            anime({
                targets: groupRef.current.children,
                translateY: [2, 0],
                opacity: [0, 1],
                delay: anime.stagger(100),
                duration: 800,
                easing: 'easeOutElastic(1, .8)',
            });
        }
    }, [data]);

    return (
        <group ref={groupRef}>
            {data.map((val, i) => (
                <Box
                    key={`${i}-${val}`}
                    position={[(i - data.length / 2) * 1.2, 0, 0]}
                    args={[1, 1, 1]}
                >
                    <meshStandardMaterial color={COLOR_MAP[val]} />
                </Box>
            ))}
        </group>
    );
};

export default function Visualizer({ data }: { data: number[] }) {
    return (
        <div style={{ width: '100%', height: '400px' }}>
            <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <ArrayMeshes data={data} />
                <OrbitControls />
            </Canvas>
        </div>
    );
}
