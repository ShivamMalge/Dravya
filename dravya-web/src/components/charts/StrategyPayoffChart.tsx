'use client';

import React, { useEffect, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { crossPaneSyncBus, SyncEvent } from '../../lib/syncBus';

interface StrategyPayoffChartProps {
    spotAxis: Float64Array;
    payoffData: Float64Array;
    syncId?: string;
}

export const StrategyPayoffChart: React.FC<StrategyPayoffChartProps> = ({
    spotAxis,
    payoffData,
    syncId = 'payoff-chart'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<uPlot | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const zeroLine = new Float64Array(payoffData.length).fill(0);

        const opts: uPlot.Options = {
            width: containerRef.current.clientWidth,
            height: 350,
            cursor: {
                sync: { key: 'crosshairs' },
                drag: { x: true, y: true }
            },
            scales: {
                x: { time: false },
                y: { range: (u, min, max) => [Math.min(min, -5), Math.max(max, 5)] }
            },
            series: [
                {},
                {
                    label: "Payoff",
                    stroke: "#0f172a",
                    width: 2,
                    points: { show: false }
                },
                {
                    label: "Baseline",
                    stroke: "transparent",
                    width: 0,
                    points: { show: false }
                }
            ],
            bands: [
                {
                    series: [1, 2],
                    fill: (u: uPlot, i: number) => {
                        const payoff = u.data[1][i];
                        if (payoff === null || payoff === undefined) return "transparent";
                        return payoff >= 0 ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)";
                    },
                    // We need a custom path builder to handle dual-color fills in a single band effectively
                    // or just use two series with specific fills.
                    // For payoffProfitZoneFill, we will use a custom path hook.
                }
            ],
            axes: [
                {
                    stroke: "#64748b",
                    grid: { stroke: "#f1f5f9" },
                    label: "Spot Price"
                },
                {
                    stroke: "#64748b",
                    grid: { stroke: "#f1f5f9" },
                    label: "P&L"
                }
            ],
            hooks: {
                draw: [
                    (u) => {
                        const { ctx, bbox } = u;
                        const payoffProfitZoneFill = "rgba(16, 185, 129, 0.15)";
                        const payoffLossZoneFill = "rgba(239, 68, 68, 0.15)";

                        const zeroY = u.valToPos(0, 'y', true);

                        ctx.save();
                        ctx.beginPath();
                        ctx.rect(bbox.left, bbox.top, bbox.width, zeroY - bbox.top);
                        ctx.clip();

                        // Fill Profit Area
                        // @ts-ignore - uPlot internal paths access
                        (u.series[1] as any).paths?.fill?.(u, 1, 0, payoffData.length - 1);
                        ctx.fillStyle = payoffProfitZoneFill;
                        ctx.fill();
                        ctx.restore();

                        ctx.save();
                        ctx.beginPath();
                        ctx.rect(bbox.left, zeroY, bbox.width, (bbox.height + bbox.top) - zeroY);
                        ctx.clip();

                        // Fill Loss Area
                        // @ts-ignore - uPlot internal paths access
                        (u.series[1] as any).paths?.fill?.(u, 1, 0, payoffData.length - 1);
                        ctx.fillStyle = payoffLossZoneFill;
                        ctx.fill();
                        ctx.restore();
                    }
                ],
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
            payoffData,
            zeroLine
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
    }, [spotAxis, payoffData, syncId]);

    return (
        <div className="w-full h-full bg-white font-sans">
            <div ref={containerRef} className="uplot-payoff-container w-full" />
        </div>
    );
};

export default StrategyPayoffChart;
