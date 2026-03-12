'use client';

import React from 'react';
import { useWasmStream } from '../hooks/useWasmStream';
import { cn } from "@/lib/utils";

export const StreamStatus = () => {
    const { isConnected, stats } = useWasmStream();

    return (
        <div className={cn(
            "flex items-center gap-3 px-3 py-1.5 rounded-full border transition-all duration-300",
            isConnected
                ? "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm shadow-emerald-500/5"
                : "bg-slate-50 border-slate-200 text-slate-500"
        )}>
            <div className="relative flex h-2 w-2">
                {isConnected && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={cn(
                    "relative inline-flex rounded-full h-2 w-2",
                    isConnected ? "bg-emerald-500" : "bg-slate-300"
                )}></span>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                <span>{isConnected ? "Engine Live" : "Engine Standby"}</span>
                {isConnected && (
                    <span className="border-l border-emerald-200 pl-2 font-mono">
                        {stats.latencyMs.toFixed(1)} ms
                    </span>
                )}
            </div>
        </div>
    );
};

export default StreamStatus;
