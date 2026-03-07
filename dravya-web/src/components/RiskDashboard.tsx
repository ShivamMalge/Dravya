'use client';

import React from 'react';

interface GreeksData {
    delta: number;
    gamma: number;
    theta: number;
}

interface RiskDashboardProps {
    greeks: GreeksData;
}

function MetricCard({ label, value, symbol, colorAccent }: {
    label: string;
    value: number;
    symbol: string;
    colorAccent: string;
}) {
    return (
        <div style={{
            padding: '0.6rem 0.75rem',
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            borderLeft: `3px solid ${colorAccent}`,
        }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                {symbol} {label}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                {value.toFixed(4)}
            </div>
        </div>
    );
}

export default function RiskDashboard({ greeks }: RiskDashboardProps) {
    return (
        <div style={{ marginTop: '1rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                Risk Metrics
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <MetricCard label="Delta" value={greeks.delta} symbol="Δ" colorAccent="#3b82f6" />
                <MetricCard label="Gamma" value={greeks.gamma} symbol="Γ" colorAccent="#8b5cf6" />
                <MetricCard label="Theta" value={greeks.theta} symbol="Θ" colorAccent="#f59e0b" />
            </div>
        </div>
    );
}
