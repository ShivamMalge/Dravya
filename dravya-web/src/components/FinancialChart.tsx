import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, ColorType, CandlestickSeries, HistogramSeries } from 'lightweight-charts';

interface FinancialChartProps {
    data?: {
        price: number;
        volume: number;
        timestamp: bigint;
    }[];
}

export const FinancialChart: React.FC<FinancialChartProps> = ({ data = [] }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#ffffff' },
                textColor: '#64748b',
                fontFamily: 'Inter, sans-serif',
            },
            grid: {
                vertLines: { color: '#f1f5f9' },
                horzLines: { color: '#f1f5f9' },
            },
            crosshair: {
                mode: 0,
            },
            width: chartContainerRef.current.clientWidth,
            height: 350,
        });

        const ohlcSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#10b981',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444',
        });

        const volumeSeries = chart.addSeries(HistogramSeries, {
            color: '#3b82f6',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '', // overlay
        });

        volumeSeries.priceScale().applyOptions({
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });

        chartRef.current = chart;
        candleSeriesRef.current = ohlcSeries;
        volumeSeriesRef.current = volumeSeries;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    useEffect(() => {
        if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

        // Fallback data if none provided
        const displayData = data.length > 0 ? data : Array.from({ length: 100 }, (_, i) => ({
            price: 150 + Math.sin(i / 10) * 10 + Math.random() * 2,
            volume: 1000 + Math.random() * 500,
            timestamp: BigInt(Date.now() - (100 - i) * 60000)
        }));

        const bars: CandlestickData[] = [];
        const volumes: any[] = [];
        const groupSize = 2;

        for (let i = 0; i < displayData.length; i += groupSize) {
            const chunk = displayData.slice(i, i + groupSize);
            const prices = chunk.map(t => t.price);
            const time = (Number(chunk[0].timestamp) / 1000) as any;

            bars.push({
                time,
                open: prices[0],
                high: Math.max(...prices),
                low: Math.min(...prices),
                close: prices[prices.length - 1],
            });

            volumes.push({
                time,
                value: chunk.reduce((acc, t) => acc + t.volume, 0),
                color: prices[prices.length - 1] >= prices[0] ? '#10b98140' : '#ef444440',
            });
        }

        candleSeriesRef.current.setData(bars);
        volumeSeriesRef.current.setData(volumes);
    }, [data]);

    return (
        <div className="w-full h-full">
            <div ref={chartContainerRef} className="w-full h-full" />
        </div>
    );
};

export default FinancialChart;
