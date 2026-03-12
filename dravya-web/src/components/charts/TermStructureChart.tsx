'use client';

import React, { useEffect, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { equidistantColorScale } from '../../styles/theme';
import { crossPaneSyncBus, SyncEvent } from '../../lib/syncBus';

interface TermStructureChartProps {
    timeAxis: Float64Array;
    atmVolData: Float64Array;
    syncId?: string;
}

export const TermStructureChart: React.FC<TermStructureChartProps> = ({
    timeAxis,
    atmVolData,
    syncId = 'term-structure-chart'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<uPlot | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

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
            series: [
                {},
                {
                    label: "ATM Implied Vol",
                    stroke: equidistantColorScale[1],
                    width: 2,
                    points: { show: false }
                }
            ],
            axes: [
                {
                    stroke: "#64748b",
                    grid: { stroke: "#f1f5f9" },
                    font: "10px Inter, sans-serif",
                    label: "Time to Expiration (Yrs)"
                },
                {
                    stroke: "#64748b",
                    grid: { stroke: "#f1f5f9" },
                    font: "10px Inter, sans-serif",
                    label: "ATM Volatility"
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
            atmVolData
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
    }, [timeAxis, atmVolData, syncId]);

    return (
        <div className="w-full h-full bg-white font-sans">
            <div ref={containerRef} className="uplot-term-structure-container w-full" />
        </div>
    );
};

export default TermStructureChart;
