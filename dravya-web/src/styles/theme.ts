export const equidistantColorScale = [
    '#f97316', // Orange
    '#0ea5e9', // Blue
    '#8b5cf6', // Violet
    '#d946ef', // Fuchsia
    '#10b981', // Emerald
    '#eab308', // Yellow
];

export const theme = {
    palette: {
        background: '#ffffff',
        surface: '#f8fafc',
        primary: '#0f172a',
        secondary: '#64748b',
        accent: '#2563eb',
        error: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
    },
    typography: {
        fontFamily: '"Inter", "system-ui", "-apple-system", sans-serif',
        fontSizeRoot: '16px',
        fontSizeKpi: '1.25rem',
        fontWeightNormal: 400,
        fontWeightBold: 600,
    },
    transitions: {
        smooth: 'all 0.5s ease-in-out', // Matching user's duration
    }
};

export const kpiStackContainer = {
    position: 'sticky' as const,
    top: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid #e2e8f0',
    padding: '0.75rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
};
