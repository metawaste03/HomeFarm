import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDownIcon, LayerIcon, BroilerIcon, FishIcon, ChickenIcon, BatchIcon, FeedBagIcon } from './icons';
import { AnalyticsIcon } from './CustomIcons';
import type { Screen } from '../App';
import { useFarm, Sector } from '../contexts/FarmContext';
import { useTasks } from '../contexts/TaskContext';
import { useSales } from '../contexts/SalesContext';
import { useAuth } from '../contexts/AuthContext';
import KpiCard from './KpiCard';
import { dailyLogsService } from '../services/database';
import type { Tables } from '../types/database';
import TodaysActionCard from './TodaysActionCard';
import FarmAdvisor from './FarmAdvisor';
import NavigationCards from './NavigationCards';

interface DashboardScreenProps {
    onNavigate: (screen: Screen) => void;
    selectedScope: string;
    onScopeChange: (scope: string) => void;
    activeSector: Sector;
    onSectorChange: (sector: Sector) => void;
    theme: string;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({
    onNavigate,
    selectedScope,
    onScopeChange,
    activeSector,
    onSectorChange,
}) => {
    const { farms, batches } = useFarm();
    const { tasks } = useTasks();
    const { sales } = useSales();
    const { user } = useAuth();
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [logs, setLogs] = useState<Tables<'daily_logs'>[]>([]);

    // Get user's first name for greeting
    const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Farmer';

    // Smart scope selection when sector changes
    useEffect(() => {
        const sectorFarmNames = [...new Set<string>(batches.filter(b => b.sector === activeSector).map(b => b.farm))];
        if (sectorFarmNames.length === 1) {
            onScopeChange(sectorFarmNames[0]);
        } else {
            onScopeChange(`All ${activeSector} Farms`);
        }
    }, [activeSector, batches, onScopeChange]);

    // Fetch Daily Logs
    useEffect(() => {
        const fetchLogs = async () => {
            if (farms.length === 0) return;
            let farmId = farms[0]?.id;
            if (selectedScope && !selectedScope.startsWith('All')) {
                const farmName = selectedScope.split(' - ')[0];
                const f = farms.find(f => f.name === farmName);
                if (f) farmId = f.id;
            }

            if (farmId) {
                try {
                    const fetchedLogs = await dailyLogsService.list(String(farmId));
                    setLogs(fetchedLogs);
                } catch (error) {
                    console.error("Error fetching dashboard logs:", error);
                }
            }
        };
        fetchLogs();
    }, [farms, selectedScope]);

    const sectorBatches = useMemo(() => batches.filter(b => b.sector === activeSector), [batches, activeSector]);
    const activeBatches = useMemo(() => sectorBatches.filter(b => b.status === 'Active'), [sectorBatches]);

    // Calculate Real Data from Logs with Period Comparison for Trends
    const { currentPeriodLogs, previousPeriodLogs } = useMemo(() => {
        const now = new Date();
        const periodDays = 7; // Weekly by default
        const currentStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
        const previousStart = new Date(currentStart.getTime() - periodDays * 24 * 60 * 60 * 1000);

        const sectorFilteredLogs = logs.filter(log => {
            const acts = log.activities as any;
            return acts?.sector === activeSector;
        });

        const current = sectorFilteredLogs.filter(log => new Date(log.log_date) >= currentStart);
        const previous = sectorFilteredLogs.filter(log => {
            const logDate = new Date(log.log_date);
            return logDate >= previousStart && logDate < currentStart;
        });

        return { currentPeriodLogs: current, previousPeriodLogs: previous };
    }, [logs, activeSector]);

    // Current period metrics
    const totalMortality = useMemo(() => {
        return currentPeriodLogs.reduce((sum, log) => {
            const acts = log.activities as any;
            return sum + (acts?.mortality || 0);
        }, 0);
    }, [currentPeriodLogs]);

    const totalEggs = useMemo(() => {
        return currentPeriodLogs.reduce((sum, log) => {
            const acts = log.activities as any;
            return sum + (acts?.eggCollection?.total || 0);
        }, 0);
    }, [currentPeriodLogs]);

    const totalFeed = useMemo(() => {
        return currentPeriodLogs.reduce((sum, log) => {
            const acts = log.activities as any;
            return sum + (acts?.feed?.kg || 0);
        }, 0);
    }, [currentPeriodLogs]);

    // Previous period metrics for comparison
    const prevMortality = useMemo(() => {
        return previousPeriodLogs.reduce((sum, log) => {
            const acts = log.activities as any;
            return sum + (acts?.mortality || 0);
        }, 0);
    }, [previousPeriodLogs]);

    const prevEggs = useMemo(() => {
        return previousPeriodLogs.reduce((sum, log) => {
            const acts = log.activities as any;
            return sum + (acts?.eggCollection?.total || 0);
        }, 0);
    }, [previousPeriodLogs]);

    const prevFeed = useMemo(() => {
        return previousPeriodLogs.reduce((sum, log) => {
            const acts = log.activities as any;
            return sum + (acts?.feed?.kg || 0);
        }, 0);
    }, [previousPeriodLogs]);

    // Calculate trend percentage helper
    const calculateTrend = (current: number, previous: number): string | undefined => {
        if (previous === 0 && current === 0) return undefined;
        if (previous === 0) return current > 0 ? '+100%' : undefined;
        const change = ((current - previous) / previous) * 100;
        if (change === 0) return '0%';
        return `${change > 0 ? '+' : ''}${change.toFixed(0)}%`;
    };

    // Generate trend values based on real data
    const eggsTrend = calculateTrend(totalEggs, prevEggs);
    const mortalityTrend = calculateTrend(totalMortality, prevMortality);
    const feedTrend = calculateTrend(totalFeed, prevFeed);

    const totalStock = useMemo(() => activeBatches.reduce((sum, b) => sum + (b.stockCount || 0), 0), [activeBatches]);
    const currentActiveBirds = totalStock - totalMortality;

    const farmOptions = useMemo(() => {
        const sectorFarms = [...new Set<string>(sectorBatches.map(b => b.farm))];
        const options = [{ name: `All ${activeSector} Farms`, children: [] as string[] }];
        sectorFarms.forEach(farmName => {
            options.push({
                name: farmName,
                children: sectorBatches.filter(b => b.farm === farmName).map(b => b.name)
            });
        });
        return options;
    }, [sectorBatches, activeSector]);

    const handleSelectScope = (scope: string) => {
        onScopeChange(scope);
        setIsSelectorOpen(false);
    };

    const SectorButton: React.FC<{
        sector: Sector;
        label: string;
        icon: React.FC<{ className?: string }>;
    }> = ({ sector, label, icon: Icon }) => {
        const isActive = activeSector === sector;
        return (
            <button
                onClick={() => onSectorChange(sector)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-muted text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
            >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
            </button>
        );
    };

    return (
        <div className="bg-background min-h-screen">
            {/* Main Content Area */}
            <div className="lg:flex">
                {/* Main Content */}
                <main className="flex-1 p-4 lg:p-6 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
                                Hello, {userName} 👋
                            </h1>
                            <p className="text-text-secondary">Here's your farm's pulse for today.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onNavigate('analytics')}
                                className="bg-card hover:bg-muted text-primary border border-border px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all"
                            >
                                <AnalyticsIcon className="w-5 h-5" />
                                View Stats
                            </button>

                            {/* Scope Selector */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                                    className="min-w-[180px] text-left bg-muted p-3 rounded-xl flex justify-between items-center gap-4 border border-border"
                                >
                                    <span className="font-medium text-text-primary truncate text-sm">
                                        {selectedScope || `All ${activeSector} Farms`}
                                    </span>
                                    <ChevronDownIcon className={`w-4 h-4 text-text-secondary transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isSelectorOpen && (
                                    <div className="absolute top-full right-0 mt-2 bg-popover shadow-lg rounded-xl z-20 border border-border max-h-60 overflow-y-auto min-w-[200px]">
                                        {farmOptions.map(opt => (
                                            <React.Fragment key={opt.name}>
                                                <div
                                                    onClick={() => handleSelectScope(opt.name)}
                                                    className="p-3 hover:bg-muted cursor-pointer font-medium text-text-primary text-sm"
                                                >
                                                    {opt.name}
                                                </div>
                                                {opt.children.map(child => (
                                                    <div
                                                        key={child}
                                                        onClick={() => handleSelectScope(`${opt.name} - ${child}`)}
                                                        className="p-3 pl-8 hover:bg-muted cursor-pointer text-text-secondary text-sm"
                                                    >
                                                        {child}
                                                    </div>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sector Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <SectorButton sector="Layer" label="Layers" icon={LayerIcon} />
                        <SectorButton sector="Broiler" label="Broilers" icon={BroilerIcon} />
                        <SectorButton sector="Fish" label="Fish" icon={FishIcon} />
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <KpiCard
                            icon={<ChickenIcon className="w-5 h-5 text-blue-500" />}
                            label="Total Stock"
                            value={totalStock.toLocaleString()}
                            accentColor="blue"
                            staggerIndex={0}
                            className="shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                        />
                        <KpiCard
                            icon={<BatchIcon className="w-5 h-5 text-lime-500" />}
                            label={activeSector === 'Fish' ? 'Active Fish' : 'Active Birds'}
                            value={currentActiveBirds.toLocaleString()}
                            accentColor="green"
                            staggerIndex={1}
                            className="shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                        />
                        {activeSector === 'Layer' ? (
                            <KpiCard
                                icon={<LayerIcon className="w-5 h-5 text-purple-500" />}
                                label="Total Output"
                                value={totalEggs.toLocaleString()}
                                trend={eggsTrend}
                                accentColor="purple"
                                staggerIndex={2}
                                className="shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                            />
                        ) : (
                            <KpiCard
                                icon={<FeedBagIcon className="w-5 h-5 text-yellow-500" />}
                                label="Feed Consumed"
                                value={`${totalFeed.toLocaleString()} kg`}
                                trend={feedTrend}
                                accentColor="yellow"
                                staggerIndex={2}
                                className="shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                            />
                        )}
                        <KpiCard
                            icon={<FishIcon className="w-5 h-5 text-orange-500" />}
                            label="Mortality"
                            value={totalMortality.toLocaleString()}
                            trend={mortalityTrend}
                            accentColor="orange"
                            staggerIndex={3}
                            className="shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                        />
                    </div>

                    {/* AI Farm Advisor */}
                    <FarmAdvisor sector={activeSector} />

                    {/* Today's Actions (Condensed) */}
                    <TodaysActionCard onViewAll={() => onNavigate('actions')} />

                    {/* Navigation Cards */}
                    <NavigationCards onNavigate={onNavigate} />
                </main>
            </div>
        </div>
    );
};

export default DashboardScreen;
