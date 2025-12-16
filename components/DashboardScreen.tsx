import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Chart, ChartOptions } from 'chart.js/auto';
import { EggIcon, ChickenIcon, ChevronDownIcon, ScaleIcon, DropletIcon, FishIcon, DownloadIcon, LayerIcon, BroilerIcon, ArrowTrendingUpIcon, LightbulbIcon, BellIcon, InfoIcon } from './icons';
import { MortalityIcon, BirdStockIcon, FeedBagIcon as CustomFeedBagIcon } from './CustomIcons';
// Fix: Use `import type` for type-only imports to prevent circular dependency issues.
import type { Screen, Theme } from '../App';
import type { Farm } from './FarmManagementScreen';
import type { Batch, Sector } from './BatchManagementScreen';
import ExportDataModal from './ExportDataModal';
import ProfitabilityCard from './ProfitabilityCard';

interface DashboardScreenProps {
    onNavigate: (screen: Screen) => void;
    farms: Farm[];
    batches: Batch[];
    selectedScope: string;
    onScopeChange: (scope: string) => void;
    activeSector: Sector;
    onSectorChange: (sector: Sector) => void;
    theme: Theme;
}

// Mock Data for charts, now including all sectors
const MOCK_DATA = {
    "Ibadan Farm - Layer Batch 2": {
        kpis: { eggs: 319, trendEggs: '+2.1%', mortality: 2, trendMortality: '0%', feed: 150, trendFeed: '-5%', stock: 495, trendStock: '0%' },
        productionChart: [300, 310, 305, 315, 320, 318, 322, 310, 300, 325, 330, 315, 312, 319],
        profitability: { expenses: 150000, production: 4800, stockCost: 0 } // production = total eggs
    },
    "Abeokuta Farm - Layer Batch 1": {
        kpis: { eggs: 280, trendEggs: '-1.5%', mortality: 1, trendMortality: '0%', feed: 120, trendFeed: '-2%', stock: 750, trendStock: '0%' },
        productionChart: [270, 275, 280, 278, 282, 285, 279, 281, 283, 277, 288, 290, 284, 280],
        profitability: { expenses: 100000, production: 3500, stockCost: 0 }
    },
    "Ibadan Farm - Broiler Batch 5": {
        kpis: { avgWeight: 1850, trendWeight: '+50g', mortality: 3, trendMortality: '+1', fcr: 1.75, trendFcr: '-0.05', stock: 1497 },
        weightGainChart: [50, 150, 350, 600, 950, 1300, 1850],
        profitability: { expenses: 2500000, stockCost: 500000, mortality: 15 } // Mock cumulative expenses
    },
    "Epe Fish Farm - Tilapia Batch 1": {
        kpis: { avgWeight: 250, trendWeight: '+25g', mortality: 15, trendMortality: '+3', fcr: 1.5, trendFcr: '+0.1', stock: 2485, waterQuality: 'Good', trendWater: 'Stable' },
        weightGainChart: [5, 20, 50, 100, 160, 250],
        profitability: { expenses: 800000, stockCost: 200000, mortality: 50 }
    },
    "Epe Fish Farm - Catfish Batch 3": {
        kpis: { avgWeight: 450, trendWeight: '+40g', mortality: 10, trendMortality: '0', fcr: 1.2, trendFcr: '0', stock: 2990, waterQuality: 'Warning', trendWater: 'Ammonia Up' },
        weightGainChart: [10, 30, 80, 150, 250, 350, 450],
        profitability: { expenses: 1200000, stockCost: 300000, mortality: 60 }
    }
}

type Alert = { type: 'danger' | 'warning' | 'info'; icon: React.FC<any>; text: string; };
const MOCK_ALERTS: Record<Sector, Alert[]> = {
    Layer: [
        { type: 'danger', icon: MortalityIcon, text: 'High mortality reported in Layer Batch 2.' },
        { type: 'warning', icon: BellIcon, text: 'Gumboro vaccine is due in 2 days.' },
        { type: 'info', icon: CustomFeedBagIcon, text: 'Feed stock is running low. Tap to create a purchase order.' },
    ],
    Broiler: [
        { type: 'danger', icon: MortalityIcon, text: 'Unexpected mortality spike (12 birds) in Broiler Batch 5.' },
        { type: 'info', icon: InfoIcon, text: 'Your FCR is improving! Learn more about feed optimization.' },
        { type: 'warning', icon: ScaleIcon, text: 'Weight gain for Week 4 is below target. Consider adjusting feed.' }
    ],
    Fish: [
        { type: 'danger', icon: DropletIcon, text: 'High Ammonia (0.1 ppm) detected in Tilapia Batch 1. Action required.' },
        { type: 'warning', icon: BellIcon, text: 'Next water change is scheduled for tomorrow.' },
    ]
}

type Insight = { icon: React.FC<any>; text: string; };
const MOCK_INSIGHTS: Record<Sector, Insight[]> = {
    Layer: [
        { icon: ArrowTrendingUpIcon, text: "Egg production has been consistently above average for the past 5 days." },
        { icon: LightbulbIcon, text: "Your current feed conversion rate is trending 5% better than your previous batch." }
    ],
    Broiler: [
        { icon: ArrowTrendingUpIcon, text: "Your current FCR is trending 5% better than your previous batch." },
        { icon: LightbulbIcon, text: "Peak production for this batch is projected to be in Week 8." }
    ],
    Fish: [
        { icon: ArrowTrendingUpIcon, text: "Your SGR (Specific Growth Rate) is 8% higher than industry average for this age." },
        { icon: LightbulbIcon, text: "Water temperature is optimal for Tilapia growth this week." }
    ]
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate, farms, batches, selectedScope, onScopeChange, activeSector, onSectorChange, theme }) => {
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [isExportModalOpen, setExportModalOpen] = useState(false);
    const [isLoadingKpis, setIsLoadingKpis] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showChart, setShowChart] = useState(false);

    const productionChartRef = useRef<HTMLCanvasElement>(null);
    const chartInstances = useRef<{ production?: Chart }>({});

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const sectorBatches = useMemo(() => batches.filter(b => b.sector === activeSector), [batches, activeSector]);

    const selectedBatch = useMemo(() => {
        if (!selectedScope.includes(' - ')) return null;
        const [farmName, batchName] = selectedScope.split(' - ');
        const batch = batches.find(b => b.farm === farmName && b.name === batchName);
        return batch?.sector === activeSector ? batch : null;
    }, [selectedScope, batches, activeSector]);

    useEffect(() => {
        const firstBatchOfSector = sectorBatches[0];
        if (firstBatchOfSector && (selectedBatch?.sector !== activeSector || !selectedBatch)) {
            onScopeChange(`${firstBatchOfSector.farm} - ${firstBatchOfSector.name}`);
        } else if (!firstBatchOfSector) {
            onScopeChange(`All ${activeSector} Farms`);
        }
    }, [activeSector, sectorBatches, onScopeChange, selectedBatch]);

    useEffect(() => {
        setIsLoadingKpis(true);
        const timer = setTimeout(() => setIsLoadingKpis(false), 300);
        return () => clearTimeout(timer);
    }, [activeSector, selectedScope]);

    const farmOptions = useMemo(() => {
        const sectorFarms = [...new Set<string>(sectorBatches.map(b => b.farm))];
        const options = [{ name: `All ${activeSector} Farms`, children: [] }];
        sectorFarms.forEach(farmName => {
            options.push({ name: farmName, children: sectorBatches.filter(b => b.farm === farmName).map(b => b.name) });
        });
        return options;
    }, [sectorBatches, activeSector]);

    const data = selectedBatch ? MOCK_DATA[selectedScope as keyof typeof MOCK_DATA] : null;

    useEffect(() => {
        if (chartInstances.current.production) chartInstances.current.production.destroy();

        if (showChart && productionChartRef.current && selectedBatch && data) {
            const productionCtx = productionChartRef.current.getContext('2d');
            const isDark = document.documentElement.classList.contains('dark');
            const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
            const labelColor = isDark ? '#94a3b8' : '#64748b';

            const baseChartOptions: ChartOptions = {
                scales: {
                    y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: labelColor } },
                    x: { grid: { display: false }, ticks: { color: labelColor } }
                },
                plugins: { legend: { display: false, labels: { color: labelColor } } }
            };

            if (productionCtx) {
                if ((activeSector === 'Broiler' || activeSector === 'Fish') && 'weightGainChart' in data) {
                    chartInstances.current.production = new Chart(productionCtx, {
                        type: 'bar',
                        data: {
                            labels: Array.from({ length: data.weightGainChart.length }, (_, i) => `Wk ${i + 1}`),
                            datasets: [{
                                label: 'Avg Weight (g)',
                                data: data.weightGainChart,
                                backgroundColor: isDark ? 'hsla(100, 70%, 60%, 0.6)' : 'hsla(100, 70%, 40%, 0.6)',
                                borderColor: isDark ? 'hsla(100, 70%, 60%, 1)' : 'hsla(100, 70%, 40%, 1)',
                                borderWidth: 1,
                                borderRadius: 4,
                            }]
                        },
                        options: baseChartOptions
                    });
                } else if (activeSector === 'Layer' && 'productionChart' in data) {
                    const avg = data.productionChart.reduce((a, b) => a + b, 0) / data.productionChart.length;
                    chartInstances.current.production = new Chart(productionCtx, {
                        type: 'line',
                        data: {
                            labels: Array.from({ length: 14 }, (_, i) => `Day ${i + 1}`),
                            datasets: [{
                                label: 'Total Eggs',
                                data: data.productionChart,
                                borderColor: 'var(--accent-green)',
                                tension: 0.4,
                                fill: true,
                                backgroundColor: isDark ? 'hsla(100, 70%, 60%, 0.1)' : 'hsla(100, 70%, 40%, 0.1)'
                            }, {
                                label: 'Average',
                                data: Array(14).fill(avg),
                                borderColor: isDark ? '#fb923c' : '#f97316',
                                borderDash: [5, 5],
                                borderWidth: 2,
                                pointRadius: 0
                            }]
                        },
                        options: {
                            ...baseChartOptions,
                            scales: {
                                ...baseChartOptions.scales,
                                y: {
                                    beginAtZero: false,
                                    grid: { color: gridColor },
                                    ticks: { color: labelColor }
                                }
                            },
                            plugins: {
                                ...baseChartOptions.plugins,
                                legend: {
                                    display: true,
                                    position: 'top',
                                    labels: { color: labelColor }
                                }
                            }
                        }
                    });
                }
            }
        }

        return () => { if (chartInstances.current.production) chartInstances.current.production.destroy(); }
    }, [selectedScope, data, selectedBatch, activeSector, theme, showChart]);

    const handleSelectScope = (scope: string) => {
        onScopeChange(scope);
        setIsSelectorOpen(false);
    }

    const KpiCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; trend: string; valueClass?: string; }> = ({ icon, label, value, trend, valueClass }) => (
        <div className="bg-card p-4 rounded-2xl shadow-md flex flex-col justify-between gap-2">
            <div className="flex items-center gap-2">
                {icon}
                <p className="text-sm text-text-secondary font-bold uppercase">{label}</p>
            </div>
            <p className={`text-4xl font-bold ${valueClass || 'text-text-primary'}`}>{value}</p>
            <div className={`text-sm font-semibold ${trend.startsWith('+') ? 'text-green-500' : (trend.startsWith('-') ? 'text-danger' : 'text-text-secondary')}`}>{trend}</div>
        </div>
    );

    const SectorButton: React.FC<{
        sector: Sector;
        label: string;
        icon: React.FC<{ className?: string }>;
    }> = ({ sector, label, icon: Icon }) => {
        const isActive = activeSector === sector;
        return (
            <button
                onClick={() => onSectorChange(sector)}
                className={`flex flex-col items-center justify-center gap-1 w-full rounded-2xl transition-all duration-300 ${isScrolled ? 'p-2' : 'p-2'} ${isActive ? 'bg-primary/10 text-primary border-2 border-primary' : 'bg-card text-text-secondary hover:bg-muted'
                    }`}
            >
                <Icon className={`transition-all duration-300 ${isScrolled ? 'w-8 h-8' : 'w-12 h-12'}`} />
                <span className={`font-bold transition-all duration-300 ${isScrolled ? 'text-xs' : 'text-sm'}`}>{label}</span>
            </button>
        );
    };

    const KpiSkeleton: React.FC = () => (
        <div className="bg-card p-4 rounded-2xl shadow-md flex flex-col justify-between gap-2 animate-pulse">
            <div className="flex items-center gap-2"><div className="w-8 h-8 bg-muted rounded-full"></div><div className="h-3 w-2/3 bg-muted rounded"></div></div>
            <div className="h-10 w-3/4 bg-muted rounded mt-1"></div><div className="h-4 w-1/2 bg-muted rounded mt-1"></div>
        </div>
    );

    const renderKpis = () => {
        if (!data || !selectedBatch || !data.kpis) {
            return <div className="col-span-2 md:col-span-4 bg-card p-6 rounded-2xl shadow-md text-center text-text-secondary"><p>No performance data available for this selection.</p></div>;
        }
        const kpis = data.kpis as any;
        if (kpis.eggs !== undefined) {
            return <><KpiCard icon={<EggIcon className="w-8 h-8 text-accent" />} label="Eggs Today" value={kpis.eggs} trend={kpis.trendEggs} /><KpiCard icon={<MortalityIcon className="w-8 h-8 text-danger" />} label="Mortality" value={kpis.mortality} trend={kpis.trendMortality} valueClass={kpis.mortality > 5 ? 'text-danger' : 'text-text-primary'} /><KpiCard icon={<CustomFeedBagIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />} label="Feed (Bags)" value={kpis.feed} trend={kpis.trendFeed} valueClass={kpis.feed < 20 ? 'text-amber-500' : 'text-text-primary'} /><KpiCard icon={<BirdStockIcon className="w-8 h-8 text-text-secondary" />} label="Stock" value={kpis.stock.toLocaleString()} trend={kpis.trendStock} /></>;
        } else if (kpis.waterQuality !== undefined) {
            return <><KpiCard icon={<DropletIcon className="w-8 h-8 text-cyan-500" />} label="Water Quality" value={kpis.waterQuality} trend={kpis.trendWater} valueClass={kpis.waterQuality !== 'Good' ? 'text-amber-500' : 'text-text-primary'} /><KpiCard icon={<ScaleIcon className="w-8 h-8 text-blue-500" />} label="Avg. Weight" value={`${kpis.avgWeight}g`} trend={kpis.trendWeight} /><KpiCard icon={<MortalityIcon className="w-8 h-8 text-danger" />} label="Mortality" value={kpis.mortality} trend={kpis.trendMortality} valueClass={kpis.mortality > 20 ? 'text-danger' : 'text-text-primary'} /><KpiCard icon={<FishIcon className="w-8 h-8 text-text-secondary" />} label="Stock" value={kpis.stock.toLocaleString()} trend="-" /></>;
        } else if (kpis.avgWeight !== undefined) {
            return <><KpiCard icon={<ScaleIcon className="w-8 h-8 text-blue-500" />} label="Avg. Weight" value={`${kpis.avgWeight}g`} trend={kpis.trendWeight} /><KpiCard icon={<MortalityIcon className="w-8 h-8 text-danger" />} label="Mortality" value={kpis.mortality} trend={kpis.trendMortality} valueClass={kpis.mortality > 5 ? 'text-danger' : 'text-text-primary'} /><KpiCard icon={<CustomFeedBagIcon className="w-8 h-8 text-yellow-600" />} label="FCR" value={kpis.fcr} trend={kpis.trendFcr} /><KpiCard icon={<BirdStockIcon className="w-8 h-8 text-text-secondary" />} label="Stock" value={kpis.stock.toLocaleString()} trend="-" /></>;
        }
        return <div className="col-span-2 md:col-span-4 bg-card p-6 rounded-2xl shadow-md text-center text-text-secondary"><p>Incompatible or missing KPI data for this sector.</p></div>;
    }

    const AlertListItem: React.FC<{ alert: Alert }> = ({ alert }) => {
        const colors = { danger: 'text-danger', warning: 'text-amber-500', info: 'text-blue-500' };
        return (
            <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                <div className={colors[alert.type]}><alert.icon className="w-5 h-5 mt-0.5 flex-shrink-0" /></div>
                <p className="text-sm text-text-secondary" dangerouslySetInnerHTML={{ __html: alert.text }} />
            </div>
        )
    };

    const InsightListItem: React.FC<{ insight: Insight }> = ({ insight }) => (
        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
            <div className="text-primary"><insight.icon className="w-5 h-5 mt-0.5 flex-shrink-0" /></div>
            <p className="text-sm text-text-secondary">{insight.text}</p>
        </div>
    );

    if (farms.length === 0) {
        return (
            <div className="bg-background min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <div className="max-w-md space-y-6">
                    <div className="bg-primary/10 p-6 rounded-full inline-block mb-2">
                        <span className="text-6xl">🏡</span>
                    </div>
                    <h1 className="text-3xl font-bold text-text-primary">Welcome to HomeFarm!</h1>
                    <p className="text-text-secondary text-lg">
                        Let's get your farm set up. Create your first farm and batch to start tracking your progress.
                    </p>
                    <button
                        onClick={() => onNavigate('farms')}
                        className="bg-primary text-white font-bold py-4 px-8 rounded-xl text-lg hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        + Create Your First Farm
                    </button>
                    <p className="text-sm text-text-secondary pt-4">Need help? Check out our <a href="#" className="text-primary hover:underline">User Guide</a>.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen">
            <header className={`bg-card shadow-md sticky top-0 z-10 transition-all duration-300 ${isScrolled ? 'py-2' : 'pt-6 pb-4'}`}>
                <div className={`px-4 transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100 mb-4'}`}>
                    <h2 className="text-2xl font-bold text-text-primary">Hello, Femi 👋</h2>
                    <p className="text-text-secondary">Here's your farm's pulse for today.</p>
                </div>

                <div className="px-4 space-y-4">
                    <div className="flex justify-between items-center gap-2">
                        <div className="relative flex-grow">
                            <button onClick={() => setIsSelectorOpen(!isSelectorOpen)} className="w-full text-left bg-muted p-3 rounded-full flex justify-between items-center pr-10">
                                <span className="font-bold text-text-primary truncate">{selectedScope}</span>
                                <ChevronDownIcon className={`w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 transition-transform text-text-secondary ${isSelectorOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isSelectorOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-popover shadow-lg rounded-2xl z-20 border border-border max-h-60 overflow-y-auto">
                                    {farmOptions.map(opt => (
                                        <React.Fragment key={opt.name}>
                                            <div onClick={() => handleSelectScope(opt.name)} className="p-3 hover:bg-muted cursor-pointer font-bold">{opt.name}</div>
                                            {opt.children.map(child => (<div key={child} onClick={() => handleSelectScope(`${opt.name} - ${child}`)} className="p-3 pl-8 hover:bg-muted cursor-pointer">- {child}</div>))}
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={() => setExportModalOpen(true)} className="p-2 text-text-secondary hover:text-primary rounded-full flex-shrink-0" aria-label="Export Data">
                            <DownloadIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <SectorButton sector="Layer" label="Layers" icon={LayerIcon} />
                        <SectorButton sector="Broiler" label="Broilers" icon={BroilerIcon} />
                        <SectorButton sector="Fish" label="Fish" icon={FishIcon} />
                    </div>
                </div>
            </header>

            <div className="p-4 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {isLoadingKpis ? <><KpiSkeleton /><KpiSkeleton /><KpiSkeleton /><KpiSkeleton /></> : renderKpis()}
                </div>

                {selectedBatch && data && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ProfitabilityCard
                            batch={selectedBatch}
                            // Use mocked profitability data if available, with fallbacks
                            expenses={(data as any).profitability?.expenses || 0}
                            mortality={(data as any).profitability?.mortality || (data.kpis as any).mortality || 0}
                            production={(data as any).profitability?.production || 0}
                            stockCost={selectedBatch.stockCost || (data as any).profitability?.stockCost || 0}
                        />
                        <div className="bg-card p-6 rounded-2xl shadow-md animate-fade-in flex flex-col">
                            <h3 className="font-bold text-lg mb-2 text-text-primary flex justify-between items-center">
                                <span>{activeSector === 'Layer' ? 'Egg Production' : 'Weight Gain Trend'}</span>
                                <button onClick={() => setShowChart(s => !s)} className="text-sm font-semibold text-primary hover:underline px-2 py-1">
                                    {showChart ? 'Hide Chart' : 'Show Chart'}
                                </button>
                            </h3>
                            <div className="flex-grow flex items-center justify-center min-h-[200px]">
                                {showChart ? (
                                    <canvas ref={productionChartRef}></canvas>
                                ) : (
                                    <div className="text-center text-text-secondary">
                                        <p>Chart hidden. <button onClick={() => setShowChart(true)} className="text-primary hover:underline font-bold">Show Chart</button></p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}


                <div className="bg-card rounded-2xl shadow-md p-4 space-y-3">
                    <h3 className="font-bold text-lg text-text-primary px-1">Alerts & Tips</h3>
                    {MOCK_ALERTS[activeSector].map((alert, index) => <AlertListItem key={index} alert={alert} />)}
                </div>

                <div className="bg-card rounded-2xl shadow-md p-4 space-y-3">
                    <h3 className="font-bold text-lg text-text-primary px-1">Quick Insights</h3>
                    {MOCK_INSIGHTS[activeSector].map((insight, index) => <InsightListItem key={index} insight={insight} />)}
                </div>

            </div>

            {isExportModalOpen && selectedBatch && <ExportDataModal onClose={() => setExportModalOpen(false)} initialBatch={selectedBatch} initialDateRange={"Last 7 Days"} />}
        </div>
    );
};

export default DashboardScreen;