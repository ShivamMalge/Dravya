'use client';

import React, { useEffect, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { equidistantColorScale } from '../../styles/theme';
import { crossPaneSyncBus, SyncEvent } from '../../lib/syncBus';

interface VolatilitySmileChartProps {
    strikeAxis: Float64Array;
    volData: Float64Array[]; // Array of IV arrays for different tenors
    tenorLabels: string[];
    syncId?: string;
}

export const VolatilitySmileChart: React.FC<VolatilitySmileChartProps> = ({
    strikeAxis,
    volData,
    tenorLabels,
    syncId = 'smile-chart'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<uPlot | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const series: uPlot.Series[] = [
            {},
            ...tenorLabels.map((label, i) => ({
                label,
                stroke: equidistantColorScale[i % equidistantColorScale.length],
                width: 2,
                points: { show: false }
            }))
        ];

        const opts: uPlot.Options = {
            width: containerRef.current.clientWidth,
            height: 350,
            cursor: {
                sync: {
                    key: 'crosshairs',
                },
                drag: { x: true, y: true }
            },
            scales: {
                x: { time: false },
            },
            series,
            axes: [
                {
                    stroke: "#64748b",
                    grid: { stroke: "#f1f5f9" },
                    font: "10px Inter, sans-serif",
                    label: "Strike"
                },
                {
                    stroke: "#64748b",
                    grid: { stroke: "#f1f5f9" },
                    font: "10px Inter, sans-serif",
                    label: "Implied Volatility"
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
            strikeAxis,
            ...volData
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
                    height: 350
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            unsubscribe();
            uPlotInstance.destroy();
        };
    }, [strikeAxis, volData, tenorLabels, syncId]);

    return (
        <div className="w-full h-full bg-white font-sans">
            <div ref={containerRef} className="uplot-smile-container w-full" />
        </div>
    );
};

export default VolatilitySmileChart;
