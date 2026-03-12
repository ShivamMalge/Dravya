'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { theme, equidistantColorScale } from '../styles/theme';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, RotateCcw, Activity, Shield, TrendingUp, BarChart3, Binary, LayoutPanelTop, Terminal } from "lucide-react";

const Visualizer = dynamic(() => import('../components/Visualizer'), { ssr: false });
const TreeVisualizer = dynamic(() => import('../components/TreeVisualizer'), { ssr: false });
const RiskDashboard = dynamic(() => import('../components/RiskDashboard'), { ssr: false });
const VolSurface = dynamic(() => import('../components/VolSurface'), { ssr: false });
const FinancialChart = dynamic(() => import('../components/FinancialChart'), { ssr: false });
const AnalyticsChart = dynamic(() => import('../components/AnalyticsChart'), { ssr: false });
const StreamStatus = dynamic(() => import('../components/StreamStatus'), { ssr: false });

import { useWasmStream } from '../hooks/useWasmStream';

type DashboardMode = 'sort' | 'binomial' | 'volsurface' | 'market' | 'diagnostics';

interface VolSurfaceResult {
    implied_vol_grid: number[];
    strike_axis: number[];
    time_axis: number[];
    grid_rows: number;
    grid_cols: number;
}

interface GreeksData {
    delta: number;
    gamma: number;
    theta: number;
}

interface BinomialResult {
    asset_prices: number[][];
    option_values: number[][];
    backward_steps: number[][][];
    final_price: number;
    greeks: GreeksData;
}

export default function Dashboard() {
    const [mode, setMode] = useState<DashboardMode>('sort');
    const [array, setArray] = useState<number[]>([]);
    const [history, setHistory] = useState<number[][]>([]);
    const [animating, setAnimating] = useState(false);
    const [wasmHeap, setWasmHeap] = useState(1024 * 1024 * 48);

    // Financial Params
    const [spot, setSpot] = useState(100);
    const [strike, setStrike] = useState(100);
    const [time, setTime] = useState(1.0);
    const [rate, setRate] = useState(0.05);
    const [vol, setVol] = useState(0.2);
    const [steps, setSteps] = useState(10);

    const [binomialResult, setBinomialResult] = useState<BinomialResult | null>(null);
    const [volSurface, setVolSurface] = useState<VolSurfaceResult | null>(null);

    const { stats, isConnected } = useWasmStream();

    useEffect(() => {
        handleShuffle();
    }, []);

    const handleShuffle = () => {
        const newArr = Array.from({ length: 24 }, () => Math.floor(Math.random() * 100));
        setArray(newArr);
        setHistory([]);
    };

    const handleSort = () => {
        setAnimating(true);
        // In a real scenario, this would trigger the WASM sort
        setTimeout(() => setAnimating(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 selection:bg-blue-100">
            {/* Header / Stack (Fixed KPI Bar) */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
                <div className="container flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                            <Activity className="h-5 w-5" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">DRAVYA</h1>
                    </div>

                    <div className="hidden md:flex items-center gap-12">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Engine State</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                <span className="text-sm font-semibold">{isConnected ? 'CONNECTED' : 'STANDBY'}</span>
                            </div>
                        </div>
                        <div className="flex flex-col border-l pl-12">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">WASM Memory</span>
                            <span className="text-sm font-mono font-bold">{(wasmHeap / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <StreamStatus />
                    </div>
                </div>
            </header>

            <main className="container py-8 px-4 sm:px-8 max-w-7xl mx-auto">
                <Tabs value={mode} onValueChange={(v) => setMode(v as DashboardMode)} className="space-y-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <TabsList className="bg-white border p-1 shadow-sm rounded-xl">
                            <TabsTrigger value="sort" className="rounded-lg px-4 py-2 data-[state=active]:bg-slate-100 data-[state=active]:text-primary flex gap-2">
                                <LayoutPanelTop className="h-4 w-4" />
                                <span className="font-medium">Sorting</span>
                            </TabsTrigger>
                            <TabsTrigger value="binomial" className="rounded-lg px-4 py-2 data-[state=active]:bg-slate-100 data-[state=active]:text-primary flex gap-2">
                                <Binary className="h-4 w-4" />
                                <span className="font-medium">Binomial</span>
                            </TabsTrigger>
                            <TabsTrigger value="volsurface" className="rounded-lg px-4 py-2 data-[state=active]:bg-slate-100 data-[state=active]:text-primary flex gap-2">
                                <TrendingUp className="h-4 w-4" />
                                <span className="font-medium">Surface</span>
                            </TabsTrigger>
                            <TabsTrigger value="market" className="rounded-lg px-4 py-2 data-[state=active]:bg-slate-100 data-[state=active]:text-primary flex gap-2">
                                <BarChart3 className="h-4 w-4" />
                                <span className="font-medium">Market</span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex gap-3">
                            {mode === 'sort' && (
                                <>
                                    <Button variant="outline" size="sm" onClick={handleShuffle} disabled={animating} className="h-10 px-4 bg-white border-slate-200 hover:bg-slate-50">
                                        <RotateCcw className="mr-2 h-4 w-4 text-slate-500" />
                                        Shuffle
                                    </Button>
                                    <Button size="sm" onClick={handleSort} disabled={animating} className="h-10 px-6 shadow-md shadow-blue-500/10 transition-all hover:translate-y-[-1px] active:translate-y-[0px]">
                                        <Play className="mr-2 h-4 w-4 fill-current" />
                                        Launch WASM
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <TabsContent value="sort" className="mt-0 outline-none">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="overflow-hidden border-slate-200/60 shadow-xl shadow-slate-200/50 bg-white min-h-[500px] flex flex-col">
                                    <CardHeader className="bg-slate-50/50 border-b py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                            <CardTitle className="text-base font-bold">Visualization Window</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 p-0 relative bg-white flex items-end justify-center pb-8 min-h-[400px]">
                                        <Visualizer array={array} history={history} isAnimating={animating} />
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card className="border-slate-200/60 shadow-lg shadow-slate-200/40 bg-white">
                                    <CardHeader>
                                        <CardTitle className="text-base font-bold flex items-center gap-2">
                                            <Terminal className="h-4 w-4 text-slate-500" />
                                            Engine Analytics
                                        </CardTitle>
                                        <CardDescription>Performance complexity benchmarks</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                                                <span className="text-sm font-medium text-slate-500">Primitive</span>
                                                <span className="text-xs font-bold font-mono px-2 py-1 bg-blue-50 text-blue-600 rounded">f64_AVX2</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                                                <span className="text-sm font-medium text-slate-500">Complexity</span>
                                                <span className="text-xs font-bold font-mono px-2 py-1 bg-emerald-50 text-emerald-600 rounded">O(N) Linear</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2.5">
                                                <span className="text-sm font-medium text-slate-500">Throughput</span>
                                                <span className="text-xs font-bold font-mono">{stats.pointsPerSecond.toLocaleString()} ops/s</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200/60 shadow-lg shadow-slate-200/40 bg-white border-l-4 border-l-blue-500">
                                    <CardHeader>
                                        <CardTitle className="text-base font-bold">Stack-n-Flow Context</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-slate-600 leading-relaxed font-medium">
                                        This engine implements the Dutch National Flag algorithm directly in Rust memory.
                                        The visualization reflects the atomic swap operations performed on the f64 heap.
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="binomial" className="mt-0 outline-none">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-1 border-slate-200/60 shadow-lg shadow-slate-200/40 bg-white h-fit">
                                <CardHeader className="bg-slate-50/50 border-b">
                                    <CardTitle className="text-base font-bold">Model Configuration</CardTitle>
                                    <CardDescription>Set recursive pricing parameters</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Spot Price (USD)</label>
                                        <Input type="number" value={spot} onChange={e => setSpot(+e.target.value)} className="h-11 font-mono text-sm font-bold border-slate-200" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Strike Target</label>
                                        <Input type="number" value={strike} onChange={e => setStrike(+e.target.value)} className="h-11 font-mono text-sm font-bold border-slate-200" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Expiry (Yrs)</label>
                                            <Input type="number" value={time} step="0.1" onChange={e => setTime(+e.target.value)} className="h-11 font-mono text-sm font-bold border-slate-200" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Lattice Steps</label>
                                            <Input type="number" value={steps} onChange={e => setSteps(+e.target.value)} className="h-11 font-mono text-sm font-bold border-slate-200" />
                                        </div>
                                    </div>
                                    <Button className="w-full h-11 shadow-sm mt-4">Generate Lattice</Button>
                                </CardContent>
                            </Card>

                            <div className="lg:col-span-2 space-y-6">
                                <Card className="h-full border-slate-200/60 shadow-xl shadow-slate-200/50 bg-white min-h-[500px]">
                                    <CardHeader className="bg-slate-50/50 border-b py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                            <CardTitle className="text-base font-bold">Recursive Binomial Lattice</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 p-0 relative min-h-[450px]">
                                        <TreeVisualizer treeData={binomialResult} />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="volsurface" className="mt-0 outline-none">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            <Card className="lg:col-span-3 border-slate-200/60 shadow-xl shadow-slate-200/50 bg-white min-h-[600px]">
                                <CardHeader className="bg-slate-50/50 border-b py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                                        <CardTitle className="text-base font-bold">Implied Volatility Surface</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 h-[600px]">
                                    <VolSurface data={volSurface} />
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                <RiskDashboard greeks={{ delta: 0.52, gamma: 0.04, theta: -12.4 }} />
                                <Card className="border-slate-200/60 shadow-lg shadow-slate-200/40 bg-white">
                                    <CardHeader>
                                        <CardTitle className="text-sm font-bold">Export Options</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button variant="outline" className="w-full text-xs font-bold border-slate-200">CSV DATASET</Button>
                                        <Button variant="outline" className="w-full text-xs font-bold border-slate-200">JSON SCHEMA</Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="market" className="mt-0 outline-none">
                        <Card className="border-slate-200/60 shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b py-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                                    <CardTitle className="text-base font-bold">Financial Stream Analytics</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">OHLC Terminal</h3>
                                            <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded font-bold uppercase">TradingView v5</span>
                                        </div>
                                        <div className="h-[400px] border border-slate-100 rounded-xl overflow-hidden shadow-inner bg-slate-50/30">
                                            <FinancialChart />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Analytic Tenors</h3>
                                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold uppercase">uPlot Core</span>
                                        </div>
                                        <div className="h-[400px] border border-slate-100 rounded-xl overflow-hidden shadow-inner bg-slate-50/30">
                                            <AnalyticsChart />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
