'use client';

import React from 'react';
import { cn } from "@/lib/utils";

interface VisualizerProps {
    array: number[];
    history?: number[][];
    isAnimating?: boolean;
}

export default function Visualizer({ array, history, isAnimating }: VisualizerProps) {
    const displayArray = array.length > 0 ? array : [40, 70, 45, 90, 65, 30, 85, 50, 20, 95];

    return (
        <div className="w-full h-full flex items-end justify-center px-4 sm:px-8 gap-1 sm:gap-2 overflow-hidden">
            {displayArray.map((value, index) => {
                // Normalize value to percentage if needed, assuming 0-100 range
                const height = `${Math.max(value, 5)}%`;

                return (
                    <div
                        key={`bar-${index}`}
                        className={cn(
                            "flex-1 max-w-[40px] transition-all duration-300 ease-in-out",
                            "bg-primary/70 hover:bg-primary rounded-t-lg shadow-sm font-mono text-[10px] text-white flex items-end justify-center pb-2",
                            isAnimating && "animate-pulse"
                        )}
                        style={{
                            height,
                            transitionDelay: `${index * 20}ms`
                        }}
                    >
                        <span className="hidden md:block opacity-0 hover:opacity-100 transition-opacity">
                            {value}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
