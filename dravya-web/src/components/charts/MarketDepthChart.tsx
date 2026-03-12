'use client';

import React, { useEffect, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { crossPaneSyncBus, SyncEvent } from '../../lib/syncBus';

interface MarketDepthChartProps {
    priceAxis: Float64Array;
    bidVolume: Float64Array;
    askVolume: Float64Array;
    syncId?: string;
}

export const MarketDepthChart: React.FC<MarketDepthChartProps> = ({
    priceAxis,
    bidVolume,
    askVolume,
    syncId = 'market-depth-chart'
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
            scales: { x: { time: false } },
            series: [
                {},
                {
                    label: "Bids",
                    stroke: "#10b981",
                    width: 2,
                    fill: "rgba(16, 185, 129, 0.15)",
                    paths: uPlot.paths.stepped!({ align: 1 }),
                    points: { show: false }
                },
                {
                    label: "Asks",
                    stroke: "#ef4444",
                    width: 2,
                    fill: "rgba(239, 68, 68, 0.15)",
                    paths: uPlot.paths.stepped!({ align: -1 }),
                    points: { show: false }
                }
            ],
            axes: [
                {
                    stroke: "#64748b",
                    grid: { stroke: "#f1f5f9" },
                    label: "Price"
                },
                {
                    stroke: "#64748b",
                    grid: { stroke: "#f1f5f9" },
                    label: "Cumulative Volume"
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
            bidVolume,
            askVolume
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
    }, [priceAxis, bidVolume, askVolume, syncId]);

    return (
        <div className="w-full h-full bg-white font-sans">
            <div ref={containerRef} className="uplot-market-depth-container w-full" />
        </div>
    );
};

export default MarketDepthChart;
