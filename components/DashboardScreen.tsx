import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDownIcon, LayerIcon, BroilerIcon, FishIcon, PlusIcon, HomeIcon, ChickenIcon, BatchIcon, WalletIcon, TaskIcon, FeedBagIcon } from './icons';
import { AnalyticsIcon } from './CustomIcons';
import type { Screen } from '../App';
import { useFarm, Sector } from '../contexts/FarmContext';
import { useTasks } from '../contexts/TaskContext';
import { useSales } from '../contexts/SalesContext';
import { useAuth } from '../contexts/AuthContext';
import KpiCard from './KpiCard';
import TimeFilter from './TimeFilter';
import { dailyLogsService } from '../services/database';
import type { Tables } from '../types/database';
import ProfitabilityCalculator from './ProfitabilityCalculator';
import TodaysActionCard from './TodaysActionCard';
import CommunityTips from './CommunityTips';
import LogHistory from './LogHistory';

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
    const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
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

    // Calculate Real Data from Logs
    const sectorLogs = useMemo(() => {
        return logs.filter(log => {
            const acts = log.activities as any;
            return acts?.sector === activeSector;
        });
    }, [logs, activeSector]);

    const totalMortality = useMemo(() => {
        return sectorLogs.reduce((sum, log) => {
            const acts = log.activities as any;
            return sum + (acts?.mortality || 0);
        }, 0);
    }, [sectorLogs]);

    const totalEggs = useMemo(() => {
        return sectorLogs.reduce((sum, log) => {
            const acts = log.activities as any;
            return sum + (acts?.eggCollection?.total || 0);
        }, 0);
    }, [sectorLogs]);

    const totalFeed = useMemo(() => {
        return sectorLogs.reduce((sum, log) => {
            const acts = log.activities as any;
            return sum + (acts?.feed?.kg || 0);
        }, 0);
    }, [sectorLogs]);

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

    // Removed: Empty state for new users - users now go directly to Dashboard

    return (
        <div className="bg-background min-h-screen">
            {/* Main Content Area */}
            <div className="lg:flex">
                {/* Left: Main Content */}
                <main className="flex-1 p-4 lg:p-6 lg:pr-3 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
                                Hello, {userName} 👋
                            </h1>
                            <p className="text-text-secondary">Here's your farm's pulse for today.</p>
                        </div>

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
                                className="w-full lg:w-auto min-w-[200px] text-left bg-muted p-3 rounded-xl flex justify-between items-center gap-4 border border-border"
                            >
                                <span className="font-medium text-text-primary truncate">
                                    {selectedScope || `All ${activeSector} Farms`}
                                </span>
                                <ChevronDownIcon className={`w-5 h-5 text-text-secondary transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isSelectorOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-popover shadow-lg rounded-xl z-20 border border-border max-h-60 overflow-y-auto">
                                    {farmOptions.map(opt => (
                                        <React.Fragment key={opt.name}>
                                            <div
                                                onClick={() => handleSelectScope(opt.name)}
                                                className="p-3 hover:bg-muted cursor-pointer font-medium text-text-primary"
                                            >
                                                {opt.name}
                                            </div>
                                            {opt.children.map(child => (
                                                <div
                                                    key={child}
                                                    onClick={() => handleSelectScope(`${opt.name} - ${child}`)}
                                                    className="p-3 pl-8 hover:bg-muted cursor-pointer text-text-secondary"
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
                            trend={totalStock > 0 ? '+0%' : undefined}
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
                                accentColor="purple"
                                staggerIndex={2}
                                className="shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                            />
                        ) : (
                            <KpiCard
                                icon={<FeedBagIcon className="w-5 h-5 text-yellow-500" />}
                                label="Feed Consumed"
                                value={`${totalFeed.toLocaleString()} kg`}
                                accentColor="yellow"
                                staggerIndex={2}
                                className="shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                            />
                        )}
                        <KpiCard
                            icon={<FishIcon className="w-5 h-5 text-orange-500" />}
                            label="Mortality"
                            value={totalMortality.toLocaleString()}
                            accentColor="orange"
                            staggerIndex={3}
                            className="shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                        />
                    </div>

                    {/* Time Filter */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-text-primary">Production Overview</h2>
                        <TimeFilter selected={timeFilter} onChange={setTimeFilter} />
                    </div>

                    {/* Chart Placeholder */}
                    <div className="bg-card rounded-2xl shadow-sm border border-border p-6 h-64 flex items-center justify-center">
                        <div className="text-center text-text-secondary">
                            <p className="font-medium">Production chart will appear here</p>
                            <p className="text-sm mt-1">Start logging daily activities to see trends</p>
                            <button
                                onClick={() => onNavigate('tasks')}
                                className="mt-4 text-primary font-medium hover:underline"
                            >
                                Log today's activity →
                            </button>
                        </div>
                    </div>

                    {/* Profitability Calculator */}
                    <ProfitabilityCalculator sector={activeSector} />

                    {/* Today's Action Card */}
                    <TodaysActionCard onViewAll={() => onNavigate('actions')} />

                    {/* Community Tips */}
                    <CommunityTips sector={activeSector} />

                    {/* Right Panel - Desktop Only */}
                    {/* Log History */}
                    <div className="mt-8">
                        <LogHistory onNavigate={onNavigate} />
                    </div>
                </main>

                {/* Right Panel - Desktop Only (Empty now, removing to allow main content to center/expand effectively) */}
            </div>
        </div>
    );
};

export default DashboardScreen;
