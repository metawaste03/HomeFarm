import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDownIcon, LayerIcon, BroilerIcon, FishIcon, PlusIcon, HomeIcon, ChickenIcon, BatchIcon, WalletIcon, TaskIcon } from './icons';
import type { Screen } from '../App';
import { useFarm, Sector } from '../contexts/FarmContext';
import { useTasks } from '../contexts/TaskContext';
import { useSales } from '../contexts/SalesContext';
import { useAuth } from '../contexts/AuthContext';
import KpiCard from './KpiCard';
import TimeFilter from './TimeFilter';
import ProfitabilityCalculator from './ProfitabilityCalculator';
import SmartAdvisor from './SmartAdvisor';
import ActivityFeed from './ActivityFeed';
import NotificationsPanel from './NotificationsPanel';

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

    // Get user's first name for greeting
    const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Farmer';

    // Reset scope when sector changes
    useEffect(() => {
        onScopeChange(`All ${activeSector} Farms`);
    }, [activeSector]);

    const sectorBatches = useMemo(() => batches.filter(b => b.sector === activeSector), [batches, activeSector]);
    const activeBatches = useMemo(() => sectorBatches.filter(b => b.status === 'Active'), [sectorBatches]);
    const totalStock = useMemo(() => activeBatches.reduce((sum, b) => sum + (b.stockCount || 0), 0), [activeBatches]);
    const pendingTasks = useMemo(() => tasks.filter(t => t.status === 'pending').length, [tasks]);

    // Calculate today's sales
    const todaySales = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return sales
            .filter(s => s.date === today)
            .reduce((sum, s) => sum + s.amount, 0);
    }, [sales]);

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

    // Empty state for new users
    if (farms.length === 0) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center p-6">
                <div className="bg-card rounded-3xl shadow-xl p-10 w-full max-w-md text-center border border-border">
                    <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HomeIcon className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-text-primary mb-3">Welcome to HomeFarm!</h1>
                    <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                        Let's get your operation set up. The first step is to create your first farm.
                    </p>
                    <button
                        onClick={() => onNavigate('farms')}
                        className="w-full bg-primary text-white font-bold py-4 px-6 rounded-2xl text-xl flex items-center justify-center gap-3 hover:bg-primary-600 active:scale-95 transition-all shadow-lg"
                    >
                        <PlusIcon className="w-6 h-6" />
                        + A Farm
                    </button>
                </div>
            </div>
        );
    }

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
                            trend={totalStock > 0 ? '+5%' : undefined}
                            accentColor="blue"
                            staggerIndex={0}
                        />
                        <KpiCard
                            icon={<BatchIcon className="w-5 h-5 text-lime-500" />}
                            label="Active Batches"
                            value={activeBatches.length}
                            accentColor="green"
                            staggerIndex={1}
                        />
                        <KpiCard
                            icon={<WalletIcon className="w-5 h-5 text-purple-500" />}
                            label="Today's Sales"
                            value={`₦${todaySales.toLocaleString()}`}
                            accentColor="purple"
                            staggerIndex={2}
                        />
                        <KpiCard
                            icon={<TaskIcon className="w-5 h-5 text-orange-500" />}
                            label="Pending Tasks"
                            value={pendingTasks}
                            accentColor="orange"
                            staggerIndex={3}
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
                                onClick={() => onNavigate('log')}
                                className="mt-4 text-primary font-medium hover:underline"
                            >
                                Log today's activity →
                            </button>
                        </div>
                    </div>

                    {/* Profitability Calculator */}
                    <ProfitabilityCalculator sector={activeSector} />

                    {/* Smart Advisor */}
                    <SmartAdvisor sector={activeSector} />
                </main>

                {/* Right Panel - Desktop Only */}
                <aside className="hidden lg:block w-80 p-6 pl-3 space-y-6">
                    <NotificationsPanel />
                    <ActivityFeed onNavigate={onNavigate} />
                </aside>
            </div>

            {/* Mobile Activity Section */}
            <div className="lg:hidden p-4 space-y-6">
                <NotificationsPanel />
                <ActivityFeed onNavigate={onNavigate} />
            </div>
        </div>
    );
};

export default DashboardScreen;
