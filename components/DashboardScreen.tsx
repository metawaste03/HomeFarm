
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Chart, ChartOptions } from 'chart.js/auto';
import { EggIcon, ChickenIcon, ChevronDownIcon, ScaleIcon, DropletIcon, FishIcon, DownloadIcon, LayerIcon, BroilerIcon, ArrowTrendingUpIcon, LightbulbIcon, BellIcon, InfoIcon, HomeIcon, PlusIcon } from './icons';
import { MortalityIcon, BirdStockIcon, FeedBagIcon as CustomFeedBagIcon } from './CustomIcons';
import type { Screen, Theme } from '../App';
import ExportDataModal from './ExportDataModal';
import { useFarm, Sector } from '../contexts/FarmContext';

interface DashboardScreenProps {
    onNavigate: (screen: Screen) => void;
    selectedScope: string;
    onScopeChange: (scope: string) => void;
    activeSector: Sector;
    onSectorChange: (sector: Sector) => void;
    theme: Theme;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate, selectedScope, onScopeChange, activeSector, onSectorChange, theme }) => {
    const { farms, batches } = useFarm();
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
        return batches.find(b => b.farm === farmName && b.name === batchName && b.sector === activeSector) || null;
    }, [selectedScope, batches, activeSector]);
    
    useEffect(() => {
        if (farms.length > 0) {
            const firstBatchOfSector = sectorBatches[0];
            if (firstBatchOfSector && (selectedBatch?.sector !== activeSector || !selectedBatch)) {
                onScopeChange(`${firstBatchOfSector.farm} - ${firstBatchOfSector.name}`);
            } else if (!firstBatchOfSector) {
                onScopeChange(`All ${activeSector} Farms`);
            }
        }
    }, [activeSector, sectorBatches, onScopeChange, selectedBatch, farms.length]);

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

    // Financial/production data would normally be in the kpiData from context
    // For now, we return null if no farms exist, else we'd fetch actual data
    const data = null; 
    
    useEffect(() => {
        if (chartInstances.current.production) chartInstances.current.production.destroy();
        // Charts would be initialized here if data existed
        return () => { if (chartInstances.current.production) chartInstances.current.production.destroy(); }
    }, [selectedScope, activeSector, theme, showChart]);
    
    const handleSelectScope = (scope: string) => {
        onScopeChange(scope);
        setIsSelectorOpen(false);
    }
    
    const KpiCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; trend: string; valueClass?: string;}> = ({ icon, label, value, trend, valueClass }) => (
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
                className={`flex flex-col items-center justify-center gap-1 w-full rounded-2xl transition-all duration-300 p-2 ${
                    isActive ? 'bg-primary/10 text-primary border-2 border-primary' : 'bg-card text-text-secondary hover:bg-muted'
                }`}
            >
                <Icon className={`transition-all duration-300 ${isScrolled ? 'w-5 h-5' : 'w-8 h-8'}`} />
                <span className={`font-bold transition-all duration-300 ${isScrolled ? 'text-xs' : 'text-sm'}`}>{label}</span>
            </button>
        );
    };

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
                        Create Your First Farm
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen">
            <header className={`bg-card shadow-md sticky top-0 z-10 transition-all duration-300 ${isScrolled ? 'py-2' : 'pt-6 pb-4'}`}>
                <div className={`px-4 transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100 mb-4'}`}>
                    <h2 className="text-2xl font-bold text-text-primary">Hello, Farmer 👋</h2>
                    <p className="text-text-secondary">Here's your farm's pulse for today.</p>
                </div>

                <div className="px-4 space-y-4">
                    <div className="flex justify-between items-center gap-2">
                        <div className="relative flex-grow">
                            <button onClick={() => setIsSelectorOpen(!isSelectorOpen)} className="w-full text-left bg-muted p-3 rounded-full flex justify-between items-center pr-10">
                                <span className="font-bold text-text-primary truncate">{selectedScope || `All ${activeSector} Farms`}</span>
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
                    {/* Placeholder for real data when connected to context/backend */}
                    <div className="col-span-2 md:col-span-4 bg-card p-10 rounded-2xl shadow-md text-center text-text-secondary">
                        <ArrowTrendingUpIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">No performance data yet for this batch.</p>
                        <button onClick={() => onNavigate('log')} className="mt-4 text-primary font-bold hover:underline">Log today's activity &rarr;</button>
                    </div>
                </div>
                
                <div className="bg-card rounded-2xl shadow-md p-4 space-y-3">
                    <h3 className="font-bold text-lg text-text-primary px-1 text-center">Your proactive farm partner</h3>
                    <p className="text-text-secondary text-sm text-center">Once you log your daily activities, insights and alerts will appear here to help you optimize production.</p>
                </div>
            </div>

            {isExportModalOpen && selectedBatch && <ExportDataModal onClose={() => setExportModalOpen(false)} initialBatch={selectedBatch} initialDateRange={"Last 7 Days"} />}
        </div>
    );
};

export default DashboardScreen;
