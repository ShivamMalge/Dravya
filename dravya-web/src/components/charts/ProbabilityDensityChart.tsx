'use client';

import React, { useEffect, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { equidistantColorScale } from '../../styles/theme';
import { crossPaneSyncBus, SyncEvent } from '../../lib/syncBus';

interface ProbabilityDensityChartProps {
    priceAxis: Float64Array;
    pdfData: Float64Array;
    cdfData: Float64Array;
    syncId?: string;
}

export const ProbabilityDensityChart: React.FC<ProbabilityDensityChartProps> = ({
    priceAxis,
    pdfData,
    cdfData,
    syncId = 'prob-density-chart'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<uPlot | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const opts: uPlot.Options = {
            width: containerRef.current.clientWidth,
            height: 350,
            cursor: {
                sync: { key: 'crosshairs' },
                drag: { x: true, y: true }
            },
            scales: {
                x: { time: false },
                y: { range: (u: uPlot, min: number, max: number) => [0, Math.max(max, 0.1)] as [number, number] },
                y2: { range: [0, 1.1] }
            },
            series: [
                {},
                {
                    label: "PDF",
                    stroke: equidistantColorScale[1],
                    width: 2,
                    fill: "rgba(14, 165, 233, 0.1)",
                    points: { show: false }
                },
                {
                    label: "CDF",
                    stroke: equidistantColorScale[2],
                    width: 2,
                    scale: "y2",
                    points: { show: false }
                }
            ],
            axes: [
                {
                    stroke: "#64748b",
                    grid: { stroke: "#f1f5f9" },
                    label: "Asset Price"
                },
                {
                    stroke: "#64748b",
                    grid: { stroke: "#f1f5f9" },
                    label: "Density"
                },
                {
                    side: 3,
                    scale: "y2",
                    stroke: "#64748b",
                    grid: { show: false },
                    label: "Cumulative"
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
            priceAxis,
            pdfData,
            cdfData
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
    }, [priceAxis, pdfData, cdfData, syncId]);

    return (
        <div className="w-full h-full bg-white font-sans">
            <div ref={containerRef} className="uplot-prob-density-container w-full" />
        </div>
    );
};

export default ProbabilityDensityChart;
