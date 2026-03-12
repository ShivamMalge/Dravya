'use client';

import React, { useEffect, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { equidistantColorScale } from '../../styles/theme';
import { crossPaneSyncBus, SyncEvent } from '../../lib/syncBus';

interface GreekSurfaceSliceChartProps {
    spotAxis: Float64Array;
    greekData: Float64Array[]; // Array of Delta, Gamma, Theta arrays
    greekLabels: string[];
    syncId?: string;
}

export const GreekSurfaceSliceChart: React.FC<GreekSurfaceSliceChartProps> = ({
    spotAxis,
    greekData,
    greekLabels,
    syncId = 'greek-slice-chart'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<uPlot | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const series: uPlot.Series[] = [
            {},
            ...greekLabels.map((label, i) => ({
                label,
                stroke: equidistantColorScale[(i + 2) % equidistantColorScale.length],
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
                    label: "Spot Price"
                },
                {
                    stroke: "#64748b",
                    grid: { stroke: "#f1f5f9" },
                    font: "10px Inter, sans-serif",
                    label: "Greek Value"
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
            spotAxis,
            ...greekData
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
    }, [spotAxis, greekData, greekLabels, syncId]);

    return (
        <div className="w-full h-full bg-white font-sans">
            <div ref={containerRef} className="uplot-greek-slice-container w-full" />
        </div>
    );
};

export default GreekSurfaceSliceChart;
