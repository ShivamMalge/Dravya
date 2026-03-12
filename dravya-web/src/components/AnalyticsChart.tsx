import React, { useEffect, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { equidistantColorScale } from '../styles/theme';

interface AnalyticsChartProps {
    data?: {
        price: number;
        volume: number;
        timestamp: bigint;
    }[];
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data = [] }) => {
    const chartRef = useRef<uPlot | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const opts: uPlot.Options = {
            width: containerRef.current.clientWidth,
            height: 350,
            cursor: {
                show: true,
                drag: { x: true, y: true }
            },
            scales: {
                x: { time: false },
            },
            series: [
                {},
                {
                    label: "Execution Engine",
                    stroke: equidistantColorScale[1], // Blue
                    width: 2,
                    points: { show: false }
                },
                {
                    label: "Memory Delta",
                    stroke: equidistantColorScale[0], // Orange
                    width: 2,
                    points: { show: false }
                }
            ],
            axes: [
                {
                    stroke: "#64748b",
                    grid: { stroke: "#f1f5f9" },
                    font: "10px Inter, sans-serif"
                },
                {
                    stroke: "#64748b",
                    grid: { stroke: "#f1f5f9" },
                    font: "10px Inter, sans-serif"
                }
            ],
        };

        const uPlotAnalyticsCanvas = new uPlot(opts, [[], [], []], containerRef.current);
        chartRef.current = uPlotAnalyticsCanvas;

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
            uPlotAnalyticsCanvas.destroy();
        };
    }, []);

    useEffect(() => {
        if (!chartRef.current) return;

        // Fallback or real data
        const displayData = data.length > 0 ? data : Array.from({ length: 50 }, (_, i) => ({
            price: 100 + Math.sin(i / 5) * 20 + Math.random() * 5,
            volume: 50 + Math.cos(i / 8) * 30 + Math.random() * 10,
            timestamp: BigInt(i)
        }));

        const x_vals = displayData.map((_, i) => i);
        const y1 = displayData.map(t => t.price);
        const y2 = displayData.map(t => t.volume);

        chartRef.current.setData([x_vals, y1, y2]);
    }, [data]);

    return (
        <div className="w-full h-full bg-white flex items-center justify-center">
            <div ref={containerRef} className="w-full" />
        </div>
    );
};

export default AnalyticsChart;
