'use client';

import React, { useEffect, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { equidistantColorScale } from '../../styles/theme';
import { crossPaneSyncBus, SyncEvent } from '../../lib/syncBus';

interface MonteCarloFanChartProps {
    timeAxis: Float64Array;
    paths: Float64Array[]; // 1,000+ paths
    confidenceBands: {
        upper1s: Float64Array;
        lower1s: Float64Array;
        upper2s: Float64Array;
        lower2s: Float64Array;
        upper3s: Float64Array;
        lower3s: Float64Array;
    };
    syncId?: string;
}

export const MonteCarloFanChart: React.FC<MonteCarloFanChartProps> = ({
    timeAxis,
    paths,
    confidenceBands,
    syncId = 'mc-fan-chart'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<uPlot | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const series: uPlot.Series[] = [
            {},
            // Confidence Bands (3s, 2s, 1s)
            { label: "3σ Up", stroke: "transparent", width: 0, points: { show: false } },
            { label: "3σ Dn", stroke: "transparent", width: 0, points: { show: false } },
            { label: "2σ Up", stroke: "transparent", width: 0, points: { show: false } },
            { label: "2σ Dn", stroke: "transparent", width: 0, points: { show: false } },
            { label: "1σ Up", stroke: "transparent", width: 0, points: { show: false } },
            { label: "1σ Dn", stroke: "transparent", width: 0, points: { show: false } },
            // Sample Paths (only first 10 for performance)
            ...paths.slice(0, 20).map((_, i) => ({
                label: `Path ${i}`,
                stroke: "rgba(100, 116, 139, 0.15)",
                width: 1,
                points: { show: false }
            }))
        ];

        const monteCarloConfidenceBand = (u: uPlot, i: number) => {
            if (i === 1) return "rgba(100, 116, 139, 0.05)"; // 3s
            if (i === 3) return "rgba(100, 116, 139, 0.1)";  // 2s
            if (i === 5) return "rgba(100, 116, 139, 0.2)";  // 1s
            return "transparent";
        };

        const opts: uPlot.Options = {
            width: containerRef.current.clientWidth,
            height: 400,
            cursor: {
                sync: { key: 'crosshairs' },
                drag: { x: true, y: true }
            },
            scales: { x: { time: false } },
            series,
            bands: [
                { series: [1, 2], fill: "rgba(100, 116, 139, 0.05)" },
                { series: [3, 4], fill: "rgba(100, 116, 139, 0.1)" },
                { series: [5, 6], fill: "rgba(100, 116, 139, 0.2)" }
            ],
            axes: [
                {
                    stroke: "#64748b",
                    grid: { stroke: "#f1f5f9" },
                    label: "Time (Steps)"
                },
                {
                    stroke: "#64748b",
                    grid: { stroke: "#f1f5f9" },
                    label: "Asset Price"
                }
            ],
            hooks: {
                setCursor: [
                    (u) => {
                        if (u.cursor.left && u.cursor.left >= 0) {
                            crossPaneSyncBus.publish({
                                x: u.posToVal(u.cursor.left, 'x'),
                                sourceId: syncId
                            });
                        }
                    }
                ]
            }
        };

        const data = [
            timeAxis,
            confidenceBands.upper3s,
            confidenceBands.lower3s,
            confidenceBands.upper2s,
            confidenceBands.lower2s,
            confidenceBands.upper1s,
            confidenceBands.lower1s,
            ...paths.slice(0, 20)
        ];

        const uPlotInstance = new uPlot(opts, data as any, containerRef.current);
        chartRef.current = uPlotInstance;

        const unsubscribe = crossPaneSyncBus.subscribe((event: SyncEvent) => {
            if (event.sourceId !== syncId && event.x !== undefined) {
                const left = chartRef.current?.valToPos(event.x, 'x');
                if (left !== undefined && chartRef.current) {
                    chartRef.current.setCursor({ left, top: -10 });
                }
            }
        });

        const handleResize = () => {
            if (containerRef.current && chartRef.current) {
                chartRef.current.setSize({
                    width: containerRef.current.clientWidth,
                    height: 400
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            unsubscribe();
            uPlotInstance.destroy();
        };
    }, [timeAxis, paths, confidenceBands, syncId]);

    return (
        <div className="w-full h-full bg-white font-sans">
            <div ref={containerRef} className="uplot-mc-fan-container w-full" />
        </div>
    );
};

export default MonteCarloFanChart;
