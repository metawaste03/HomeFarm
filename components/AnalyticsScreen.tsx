import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Chart, ChartOptions } from 'chart.js/auto';
import { Screen, Theme } from '../App';
import { Farm } from './FarmManagementScreen';
import { Batch, Sector } from './BatchManagementScreen';
import { ChevronDownIcon, NairaIcon, ArrowTrendingUpIcon, FeedBagIcon, WarningIcon, DownloadIcon, StethoscopeIcon, PillIcon, FilterIcon, ChevronLeftIcon } from './icons';
import ExportDataModal from './ExportDataModal';
import AnalyticsProgressTracker from './AnalyticsProgressTracker';
import { useSales } from '../contexts/SalesContext';
import { useBusiness } from '../contexts/BusinessContext';
import { dailyLogsService } from '../services/database';
import type { Tables } from '../types/database';

interface AnalyticsScreenProps {
    onNavigate: (screen: Screen) => void;
    farms: Farm[];
    batches: Batch[];
    activeSector: Sector;
    onSectorChange: (sector: Sector) => void;
    theme: Theme;
}

const MOCK_ANALYTICS_DATA = {
    'Layer': {
        financials: { revenue: 1250000, expenses: 800000 },
        incomeVsExpense: { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'], income: [250000, 300000, 320000, 380000], expenses: [210000, 190000, 200000, 200000] },
        expenseBreakdown: { labels: ['Feed', 'Stock', 'Utilities', 'Labor'], data: [65, 20, 10, 5] },
        kpi1: { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'], data: [88, 90, 92, 91.5], title: 'Hen-Day Production %' },
        kpi2: { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'], data: [0.5, 0.6, 0.55, 0.7], title: 'Mortality Rate (%)' },
        insights: [
            { icon: 'NairaIcon', title: 'Biggest Cost', text: 'Feed was your primary expense for this batch, accounting for 65% of your total costs.' },
            { icon: 'ArrowTrendingUpIcon', title: 'Peak Production', text: 'The batch reached peak production (92%) during Week 3.' },
            { icon: 'FeedBagIcon', title: 'Feed Efficiency', text: 'Feed intake remained stable against production, indicating good conversion.' },
            { icon: 'WarningIcon', title: 'Key Health Event', text: 'A slight increase in mortality was noted in Week 4, correlating with a minor dip in production.' }
        ]
    },
    'Broiler': {
        financials: { revenue: 1800000, expenses: 1450000 },
        incomeVsExpense: { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'], income: [0, 0, 400000, 1400000], expenses: [300000, 350000, 400000, 400000] },
        expenseBreakdown: { labels: ['Feed', 'Stock', 'Medication', 'Utilities'], data: [60, 25, 8, 7] },
        kpi1: { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'], data: [1.2, 1.4, 1.6, 1.75], title: 'FCR Trend' },
        kpi2: { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'], data: [50, 80, 110, 150], title: 'Average Daily Gain (g)' },
        insights: [
            { icon: 'NairaIcon', title: 'Biggest Cost', text: 'Feed was your primary expense for this batch, accounting for 60% of your total costs.' },
            { icon: 'ArrowTrendingUpIcon', title: 'Break-Even Point', text: 'This batch became profitable during Week 4 of its lifecycle.' },
            { icon: 'FeedBagIcon', title: 'Feed Performance', text: 'Your final Feed Conversion Ratio (FCR) was 1.75. This is better than your previous batch\'s FCR of 1.92.' },
            { icon: 'WarningIcon', title: 'Key Health Event', text: 'The highest mortality was recorded in Week 2, likely due to heat stress noted in the logs.' }
        ]
    },
    'Fish': {
        financials: { revenue: 950000, expenses: 600000 },
        incomeVsExpense: { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'], income: [100000, 150000, 250000, 450000], expenses: [150000, 150000, 150000, 150000] },
        expenseBreakdown: { labels: ['Feed', 'Stock', 'Power', 'Water'], data: [55, 30, 10, 5] },
        kpi1: { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'], data: [1.5, 1.8, 2.1, 2.0], title: 'Specific Growth Rate (SGR)' },
        kpi2: { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'], data: [0.02, 0.03, 0.02, 0.05], title: 'Ammonia (ppm)' },
        insights: [
            { icon: 'NairaIcon', title: 'Biggest Cost', text: 'Feed was your primary expense for this batch, accounting for 55% of your total costs.' },
            { icon: 'ArrowTrendingUpIcon', title: 'Break-Even Point', text: 'This batch became profitable during Week 3.' },
            { icon: 'FeedBagIcon', title: 'Feed Performance', text: 'The best Specific Growth Rate (SGR) of 2.1 was achieved in Week 3.' },
            { icon: 'WarningIcon', title: 'Water Quality Alert', text: 'An ammonia spike was recorded in Week 4, which correlated with a slight dip in growth rate.' }
        ]
    }
};

const MOCK_HEALTH_LOGS = [
    {
        id: 1,
        date: '2025-11-18',
        time: '08:30',
        symptoms: ['Lethargy', 'Reduced Appetite'],
        medication: 'Multivitamin Boost',
        dosage: '20g per 100L water',
        photo: null,
        notes: 'Birds seem tired. Administered vitamins to boost immunity during weather change.'
    },
    {
        id: 2,
        date: '2025-11-15',
        time: '14:00',
        symptoms: ['Coughing'],
        medication: 'Tylosin',
        dosage: '1g per 2L',
        photo: 'https://placehold.co/300x200/red/white?text=Sick+Bird', // Placeholder
        notes: 'Observed 3 birds coughing in Pen A. Isolated immediately.'
    }
];

const iconMap: { [key: string]: React.FC<any> } = {
    NairaIcon,
    ArrowTrendingUpIcon,
    FeedBagIcon,
    WarningIcon,
};


const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ onNavigate, farms, batches, activeSector, onSectorChange, theme }) => {
    const { sales } = useSales();
    const { inventoryItems } = useBusiness();
    const [dateRange, setDateRange] = useState('Last 30 Days');
    const [logs, setLogs] = useState<Tables<'daily_logs'>[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string | number | null>(null);
    const [viewMode, setViewMode] = useState<'summary' | 'charts' | 'health'>('summary');
    const [isExportModalOpen, setExportModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [showProgressTracker, setShowProgressTracker] = useState(true);

    // Calculate real data milestones
    const milestones = useMemo(() => {
        const batchCount = batches.filter(b => b.sector === activeSector).length;
        const salesCount = sales.filter(s => s.sector === activeSector).length;
        // For now, we'll estimate daily logs from available data
        const dailyLogCount = Math.min(batches.length * 2, 7); // Estimate

        // Count real expenses (purchases)
        const expenseCount = inventoryItems.reduce((count, item) =>
            count + item.transactions.filter(t => t.type === 'purchase').length, 0);

        return {
            batches: batchCount,
            dailyLogs: dailyLogCount,
            expenses: expenseCount,
            sales: salesCount
        };
    }, [batches, sales, activeSector, inventoryItems]);

    // Calculate Real Financials
    const realFinancials = useMemo(() => {
        const revenue = sales
            .filter(s => s.sector === activeSector)
            .reduce((sum, s) => sum + s.amount, 0);

        // Calculate total expenses from inventory purchases (Global for now as items aren't sector-specific)
        const expenses = inventoryItems.reduce((total, item) => {
            const itemExpenses = item.transactions
                .filter(t => t.type === 'purchase')
                .reduce((sum, t) => sum + (t.cost || 0), 0);
            return total + itemExpenses;
        }, 0);

        return { revenue, expenses };
    }, [sales, inventoryItems, activeSector]);

    // Check if all milestones are complete
    const hasEnoughData = milestones.batches >= 1 &&
        milestones.dailyLogs >= 7 &&
        milestones.expenses >= 2 &&
        milestones.sales >= 1;

    const chartRefs = {
        incomeExpense: useRef<HTMLCanvasElement>(null),
        expenseBreakdown: useRef<HTMLCanvasElement>(null),
        kpi1: useRef<HTMLCanvasElement>(null),
        kpi2: useRef<HTMLCanvasElement>(null),
    };
    const chartInstances = useRef<{ [key: string]: Chart }>({});

    const sectorBatches = useMemo(() => batches.filter(b => b.sector === activeSector), [batches, activeSector]);

    const selectedBatch = useMemo(() => {
        if (!selectedBatchId) return null;
        return batches.find(b => b.id === selectedBatchId) || null;
    }, [selectedBatchId, batches]);

    // Filter logs by active sector (since we are fetching all logs if selectedBatchId is null)
    const sectorLogs = useMemo(() => {
        return logs.filter(log => {
            const acts = log.activities as any;
            return acts?.sector === activeSector;
        });
    }, [logs, activeSector]);

    const realChartData = useMemo(() => {
        const mock = MOCK_ANALYTICS_DATA[activeSector];

        // 1. Expense Breakdown
        const expensesByCategory: Record<string, number> = {};
        inventoryItems.forEach(item => {
            const itemCost = item.transactions
                .filter(t => t.type === 'purchase')
                .reduce((sum, t) => sum + (t.cost || 0), 0);
            if (itemCost > 0) {
                expensesByCategory[item.category] = (expensesByCategory[item.category] || 0) + itemCost;
            }
        });
        const expLabels = Object.keys(expensesByCategory);
        const expData = Object.values(expensesByCategory);

        // 2. Log Data (KPIs)
        const sortedLogs = [...sectorLogs].reverse(); // Ascending date
        const kpiLabels = sortedLogs.map(l => new Date(l.log_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));

        const productionData = sortedLogs.map(l => {
            const acts = l.activities as any;
            return acts?.eggCollection?.total || 0;
        });

        const mortalityData = sortedLogs.map(l => {
            const acts = l.activities as any;
            return acts?.mortality || 0;
        });

        return {
            ...mock,
            expenseBreakdown: {
                labels: expLabels.length > 0 ? expLabels : mock.expenseBreakdown.labels,
                data: expData.length > 0 ? expData : mock.expenseBreakdown.data
            },
            kpi1: {
                ...mock.kpi1,
                title: 'Production (Eggs)',
                labels: kpiLabels.length > 0 ? kpiLabels : mock.kpi1.labels,
                data: kpiLabels.length > 0 ? productionData : mock.kpi1.data
            },
            kpi2: {
                ...mock.kpi2,
                title: 'Mortality',
                labels: kpiLabels.length > 0 ? kpiLabels : mock.kpi2.labels,
                data: kpiLabels.length > 0 ? mortalityData : mock.kpi2.data
            }
        };
    }, [activeSector, logs, inventoryItems]);

    const data = realChartData;

    useEffect(() => {
        if (viewMode !== 'charts') return;

        (Object.values(chartInstances.current) as Chart[]).forEach(chart => chart.destroy());
        chartInstances.current = {};

        if (!data || !selectedBatchId) return;

        const isDark = document.documentElement.classList.contains('dark');
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const labelColor = isDark ? '#94a3b8' : '#64748b';

        const baseChartOptions: ChartOptions = {
            scales: { y: { grid: { color: gridColor }, ticks: { color: labelColor } }, x: { grid: { color: gridColor }, ticks: { color: labelColor } } },
            plugins: { legend: { labels: { color: labelColor } } }
        };

        const doughnutChartOptions: ChartOptions = { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: labelColor } } } }

        const lineChartOptions: ChartOptions = { plugins: { legend: { display: false } }, scales: { y: { grid: { color: gridColor }, ticks: { color: labelColor } }, x: { grid: { color: gridColor }, ticks: { color: labelColor } } } }

        if (chartRefs.incomeExpense.current) {
            const ctx = chartRefs.incomeExpense.current.getContext('2d');
            if (ctx) {
                chartInstances.current.incomeExpense = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.incomeVsExpense.labels,
                        datasets: [
                            { label: 'Income', data: data.incomeVsExpense.income, backgroundColor: isDark ? '#4ade80' : '#22c55e' },
                            { label: 'Expenses', data: data.incomeVsExpense.expenses, backgroundColor: isDark ? '#f87171' : '#ef4444' }
                        ]
                    },
                    options: {
                        ...baseChartOptions,
                        scales: {
                            ...baseChartOptions.scales,
                            y: {
                                beginAtZero: true,
                                grid: { color: gridColor },
                                ticks: { color: labelColor }
                            }
                        },
                        plugins: {
                            ...baseChartOptions.plugins,
                            legend: {
                                position: 'top',
                                labels: { color: labelColor }
                            }
                        }
                    }
                });
            }
        }

        if (chartRefs.expenseBreakdown.current) {
            const ctx = chartRefs.expenseBreakdown.current.getContext('2d');
            if (ctx) {
                const doughnutColors = isDark
                    ? ['#22c55e', '#fb923c', '#60a5fa', '#94a3b8']
                    : ['#16a34a', '#f97316', '#3b82f6', '#6b7280'];
                chartInstances.current.expenseBreakdown = new Chart(ctx, {
                    type: 'doughnut',
                    data: { labels: data.expenseBreakdown.labels, datasets: [{ data: data.expenseBreakdown.data, backgroundColor: doughnutColors, borderWidth: 0 }] },
                    options: doughnutChartOptions
                });
            }
        }

        if (chartRefs.kpi1.current) {
            const ctx = chartRefs.kpi1.current.getContext('2d');
            if (ctx) {
                chartInstances.current.kpi1 = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: data.kpi1.labels,
                        datasets: [{
                            label: data.kpi1.title, data: data.kpi1.data,
                            borderColor: isDark ? '#4ade80' : '#15803d',
                            tension: 0.1, fill: true, backgroundColor: isDark ? 'rgba(74, 222, 128, 0.1)' : 'rgba(22, 163, 74, 0.1)'
                        }]
                    },
                    options: lineChartOptions
                });
            }
        }

        if (chartRefs.kpi2.current) {
            const ctx = chartRefs.kpi2.current.getContext('2d');
            if (ctx) {
                chartInstances.current.kpi2 = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: data.kpi2.labels,
                        datasets: [{ label: data.kpi2.title, data: data.kpi2.data, borderColor: isDark ? '#fb923c' : '#f97316', tension: 0.1 }]
                    },
                    options: lineChartOptions
                });
            }
        }

        return () => {
            (Object.values(chartInstances.current) as Chart[]).forEach(chart => chart.destroy());
        };

    }, [activeSector, selectedBatchId, dateRange, data, viewMode, theme]);

    const SectorTab: React.FC<{ sector: Sector, label: string }> = ({ sector, label }) => (
        <button
            onClick={() => onSectorChange(sector)}
            className={`px-4 py-2 text-sm font-bold rounded-full transition-colors duration-200 w-full ${activeSector === sector ? 'bg-primary text-white shadow' : 'bg-muted text-text-secondary hover:bg-border'
                }`}
        >
            {label}
        </button>
    );

    const FinancialCard: React.FC<{ label: string; value: number; isProfit?: boolean; }> = ({ label, value, isProfit }) => {
        const valueColor = isProfit ? (value >= 0 ? 'text-green-500' : 'text-danger') : 'text-text-primary';
        return (
            <div className="flex flex-col text-center bg-card p-3 rounded-lg justify-center">
                <p className="text-xs text-text-secondary font-bold uppercase">{label}</p>
                <p className={`text-xl md:text-2xl font-bold ${valueColor} break-words`}>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(value)}</p>
            </div>
        )
    };

    const ChartCard: React.FC<{ title: string; subTitle?: string; children: React.ReactNode }> = ({ title, subTitle, children }) => (
        <div className="bg-card p-4 rounded-xl shadow-sm">
            <h3 className="font-bold text-lg text-text-primary">{title}</h3>
            {subTitle && <p className="text-sm text-text-secondary mb-2">{subTitle}</p>}
            {children}
        </div>
    );

    const InsightCard: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
        <div className="bg-card p-4 rounded-xl shadow-sm flex items-start gap-4">
            <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/50 text-primary p-3 rounded-full">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-text-primary">{title}</h4>
                <p className="text-sm text-text-secondary mt-1">{text}</p>
            </div>
        </div>
    );

    const ViewToggle: React.FC<{}> = () => (
        <div className="flex justify-center p-1 bg-muted rounded-full">
            <button
                onClick={() => setViewMode('summary')}
                className={`flex-1 px-2 py-2 text-xs md:text-sm font-bold rounded-full transition-colors ${viewMode === 'summary' ? 'bg-card text-primary shadow' : 'text-text-secondary'}`}
            >
                Summary
            </button>
            <button
                onClick={() => setViewMode('charts')}
                className={`flex-1 px-2 py-2 text-xs md:text-sm font-bold rounded-full transition-colors ${viewMode === 'charts' ? 'bg-card text-primary shadow' : 'text-text-secondary'}`}
            >
                Charts
            </button>
            <button
                onClick={() => setViewMode('health')}
                className={`flex-1 px-2 py-2 text-xs md:text-sm font-bold rounded-full transition-colors ${viewMode === 'health' ? 'bg-card text-primary shadow' : 'text-text-secondary'}`}
            >
                Health
            </button>
        </div>
    );

    // Show progress tracker if not enough data
    if (!hasEnoughData && showProgressTracker) {
        return (
            <AnalyticsProgressTracker
                batches={milestones.batches}
                dailyLogs={milestones.dailyLogs}
                expenses={milestones.expenses}
                sales={milestones.sales}
                onAllComplete={() => setShowProgressTracker(false)}
            />
        );
    }

    return (
        <div className="bg-background min-h-screen">
            <header className="bg-card p-4 pt-6 shadow-sm sticky top-0 z-10 space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <button onClick={() => onNavigate('dashboard')} aria-label="Go back" className="p-2 -ml-2 text-text-secondary hover:text-primary rounded-full">
                            <ChevronLeftIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-text-primary">Detailed Analytics</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsFilterModalOpen(true)} className="p-2 text-text-secondary hover:text-primary rounded-full flex items-center gap-1 font-semibold text-sm bg-muted">
                            <FilterIcon className="w-5 h-5" />
                            Filters
                        </button>
                        <button onClick={() => setExportModalOpen(true)} className="p-2 text-text-secondary hover:text-primary rounded-full" aria-label="Export Data">
                            <DownloadIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="bg-muted p-1 rounded-full flex gap-1">
                    <SectorTab sector="Layer" label="Layers" />
                    <SectorTab sector="Broiler" label="Broilers" />
                    <SectorTab sector="Fish" label="Fish" />
                </div>
            </header>

            <div className="p-4 space-y-4">
                {selectedBatchId && data ? (
                    <>
                        <div className="grid grid-cols-3 gap-2">
                            <FinancialCard label="Total Revenue" value={realFinancials.revenue} />
                            <FinancialCard label="Total Expenses" value={realFinancials.expenses} />
                            <FinancialCard label="Net Profit" value={realFinancials.revenue - realFinancials.expenses} isProfit />
                        </div>

                        <ViewToggle />

                        {viewMode === 'summary' && (
                            <div className="space-y-3 animate-fade-in pt-2">
                                {data.insights.map((insight, index) => {
                                    const IconComponent = iconMap[insight.icon];
                                    return IconComponent ? (
                                        <InsightCard
                                            key={index}
                                            icon={<IconComponent className="w-6 h-6" />}
                                            title={insight.title}
                                            text={insight.text}
                                        />
                                    ) : null;
                                })}
                            </div>
                        )}

                        {viewMode === 'charts' && (
                            <div className="space-y-4 animate-fade-in pt-2">
                                <ChartCard title="Income vs. Expenses" subTitle="When did my investment start paying off?">
                                    <canvas ref={chartRefs.incomeExpense}></canvas>
                                </ChartCard>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <ChartCard title="Expense Breakdown" subTitle="What did I spend my money on?">
                                        <canvas ref={chartRefs.expenseBreakdown}></canvas>
                                    </ChartCard>

                                    <div className="space-y-4">
                                        <ChartCard title={data.kpi1.title}>
                                            <canvas ref={chartRefs.kpi1}></canvas>
                                        </ChartCard>
                                        <ChartCard title={data.kpi2.title}>
                                            <canvas ref={chartRefs.kpi2}></canvas>
                                        </ChartCard>
                                    </div>
                                </div>
                            </div>
                        )}

                        {viewMode === 'health' && (
                            <div className="space-y-4 animate-fade-in pt-2">
                                <h3 className="text-lg font-bold text-text-primary px-1">Health & Treatment History</h3>
                                {MOCK_HEALTH_LOGS.map(log => (
                                    <div key={log.id} className="bg-card rounded-xl shadow-sm overflow-hidden border-l-4 border-danger">
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-bold text-text-primary">{new Date(log.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                                    <p className="text-xs text-text-secondary">{log.time}</p>
                                                </div>
                                                {log.photo && (
                                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                                                        <img src={log.photo} alt="Evidence" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {log.symptoms.map(sym => (
                                                    <span key={sym} className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-danger dark:bg-red-900/30">
                                                        {sym}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="bg-muted/50 p-3 rounded-lg mb-3">
                                                <div className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-1">
                                                    <PillIcon className="w-4 h-4 text-primary" />
                                                    {log.medication}
                                                </div>
                                                <p className="text-xs text-text-secondary ml-6">{log.dosage}</p>
                                            </div>

                                            {log.notes && (
                                                <p className="text-sm text-text-secondary italic">"{log.notes}"</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-text-secondary">Select a batch to view its analytics.</p>
                    </div>
                )}
            </div>

            {isExportModalOpen && selectedBatch && (
                <ExportDataModal
                    onClose={() => setExportModalOpen(false)}
                    initialBatch={selectedBatch}
                    initialDateRange={dateRange}
                />
            )}
            {isFilterModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsFilterModalOpen(false)}>
                    <div
                        className="absolute top-0 right-0 bottom-0 bg-card w-full max-w-sm p-6 shadow-lg animate-slide-in-right"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold text-text-primary mb-6">Filters</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-text-secondary mb-1">Select Batch</label>
                                <div className="relative">
                                    <select
                                        aria-label="Select Batch"
                                        value={selectedBatchId || ''}
                                        onChange={(e) => setSelectedBatchId(e.target.value)}
                                        className="w-full text-left bg-muted p-3 rounded-lg font-semibold text-primary appearance-none"
                                    >
                                        {sectorBatches.length > 0 ? sectorBatches.map(batch => (
                                            <option key={batch.id} value={batch.id}>{batch.name}</option>
                                        )) : <option disabled>No batches in this sector</option>}
                                    </select>
                                    <ChevronDownIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-text-secondary mb-1">Select Date Range</label>
                                <div className="relative">
                                    <select
                                        aria-label="Select Date Range"
                                        value={dateRange}
                                        onChange={(e) => setDateRange(e.target.value)}
                                        className="w-full text-left bg-muted p-3 rounded-lg font-semibold text-primary appearance-none"
                                    >
                                        <option>Last 30 Days</option>
                                        <option>This Week</option>
                                        <option>This Month</option>
                                        <option>Entire Batch</option>
                                    </select>
                                    <ChevronDownIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-8">
                            <button onClick={() => setIsFilterModalOpen(false)} className="w-full bg-primary text-white font-bold py-3 rounded-lg">
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsScreen;