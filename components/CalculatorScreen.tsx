import React, { useState, useMemo } from 'react';
import { CalculatorIcon, LayerIcon, BroilerIcon, FishIcon, ChevronLeftIcon, DownloadIcon } from './icons';
import type { Screen } from '../App';

type CalculatorSector = 'Layer' | 'Broiler' | 'Aquaculture' | null;

interface CalculatorScreenProps {
    onNavigate?: (screen: Screen) => void;
}

const CalculatorScreen: React.FC<CalculatorScreenProps> = ({ onNavigate }) => {
    const [selectedSector, setSelectedSector] = useState<CalculatorSector>(null);

    const handleBack = () => setSelectedSector(null);

    if (!selectedSector) {
        return <SectorSelector onSelectSector={setSelectedSector} onNavigate={onNavigate} />;
    }

    switch (selectedSector) {
        case 'Layer':
            return <LayerCalculator onBack={handleBack} />;
        case 'Broiler':
            return <BroilerCalculator onBack={handleBack} />;
        case 'Aquaculture':
            return <AquacultureCalculator onBack={handleBack} />;
        default:
            return <SectorSelector onSelectSector={setSelectedSector} />;
    }
};

// ============================================
// SECTOR SELECTOR
// ============================================
interface SectorSelectorProps {
    onSelectSector: (sector: CalculatorSector) => void;
    onNavigate?: (screen: Screen) => void;
}

const SectorSelector: React.FC<SectorSelectorProps> = ({ onSelectSector, onNavigate }) => {
    const sectors = [
        {
            id: 'Layer' as CalculatorSector,
            title: 'Layer',
            subtitle: 'Poultry - Eggs',
            description: 'Track daily egg production and calculate your laying operation\'s profitability',
            icon: LayerIcon,
            accentColor: 'from-lime-500/20 to-green-500/20',
            borderColor: 'border-lime-500/30',
        },
        {
            id: 'Broiler' as CalculatorSector,
            title: 'Broiler',
            subtitle: 'Poultry - Meat',
            description: 'Calculate costs and profits for your meat bird production cycles',
            icon: BroilerIcon,
            accentColor: 'from-orange-500/20 to-amber-500/20',
            borderColor: 'border-orange-500/30',
        },
        {
            id: 'Aquaculture' as CalculatorSector,
            title: 'Aquaculture',
            subtitle: 'Fish Farming',
            description: 'Estimate aquaculture profits from fingerling to harvest',
            icon: FishIcon,
            accentColor: 'from-cyan-500/20 to-teal-500/20',
            borderColor: 'border-cyan-500/30',
        },
    ];

    return (
        <div className="bg-background min-h-screen p-4 lg:p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header with Back Button */}
                <div className="flex items-center gap-3 mb-6">
                    {onNavigate && (
                        <button
                            onClick={() => onNavigate('dashboard')}
                            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
                            aria-label="Back to Dashboard"
                        >
                            <ChevronLeftIcon className="w-6 h-6 text-text-secondary" />
                        </button>
                    )}
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl">
                        <CalculatorIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">
                            Profitability Calculator
                        </h1>
                        <p className="text-text-secondary text-sm">
                            Select your business type
                        </p>
                    </div>
                </div>

                {/* Sector Cards */}
                <div className="space-y-4">
                    {sectors.map((sector) => (
                        <button
                            key={sector.id}
                            onClick={() => onSelectSector(sector.id)}
                            className={`w-full p-5 rounded-2xl bg-gradient-to-r ${sector.accentColor} border ${sector.borderColor} 
                                hover:scale-[1.02] transition-all duration-200 text-left group`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-card rounded-xl shadow-sm">
                                    <sector.icon className="w-8 h-8 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-text-primary">
                                        {sector.title}
                                    </h3>
                                    <p className="text-sm text-text-secondary mt-1">
                                        {sector.description}
                                    </p>
                                </div>
                                <ChevronLeftIcon className="w-5 h-5 text-text-secondary rotate-180 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-text-secondary">
                        <span className="text-primary font-medium">HomeFarm</span> — Smart farming decisions, better profits
                    </p>
                </div>
            </div>
        </div>
    );
};

// ============================================
// SHARED CALCULATOR COMPONENTS
// ============================================
interface CalculatorHeaderProps {
    title: string;
    subtitle: string;
    onBack: () => void;
}

const CalculatorHeader: React.FC<CalculatorHeaderProps> = ({ title, subtitle, onBack }) => (
    <div className="flex items-center gap-4 mb-6">
        <button
            onClick={onBack}
            className="p-2 bg-muted hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            aria-label="Go back"
        >
            <ChevronLeftIcon className="w-5 h-5 text-text-primary" />
        </button>
        <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
                <CalculatorIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-text-primary">{title}</h1>
                <p className="text-sm text-text-secondary">{subtitle}</p>
            </div>
        </div>
    </div>
);

interface InputFieldProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    prefix?: string;
    suffix?: string;
    description?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, prefix, suffix, description }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
            {label}
        </label>
        <div className="relative">
            {prefix && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-medium">
                    {prefix}
                </span>
            )}
            <input
                type="number"
                value={value || ''}
                onChange={(e) => onChange(Number(e.target.value) || 0)}
                className={`w-full px-3 py-2.5 bg-muted rounded-xl text-text-primary border border-border 
                    focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all
                    ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-16' : ''}`}
                aria-label={label}
            />
            {suffix && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
                    {suffix}
                </span>
            )}
        </div>
        {description && (
            <p className="text-xs text-text-secondary mt-1">{description}</p>
        )}
    </div>
);

interface ResultCardProps {
    label: string;
    value: string;
    color?: 'red' | 'green' | 'blue' | 'yellow' | 'primary';
    large?: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ label, value, color = 'primary', large = false }) => {
    const colorClasses = {
        red: 'text-red-500',
        green: 'text-green-500',
        blue: 'text-blue-500',
        yellow: 'text-yellow-500',
        primary: 'text-primary',
    };

    if (large) {
        return (
            <div className="col-span-2 p-4 rounded-xl bg-gradient-to-br from-primary to-lime-600 text-white text-center shadow-lg">
                <p className="text-xs uppercase mb-1 font-medium opacity-90">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        );
    }

    return (
        <div className="bg-card p-3 rounded-xl shadow-sm border border-border text-center">
            <p className="text-xs text-text-secondary uppercase mb-1 font-medium">{label}</p>
            <p className={`text-lg font-bold truncate ${colorClasses[color]}`}>{value}</p>
        </div>
    );
};

const Disclaimer: React.FC = () => (
    <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
        <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
            <strong>Disclaimer:</strong> These projections are estimates based on your inputs. Market prices, disease, weather, and unforeseen factors can affect actual results.
        </p>
    </div>
);

interface ActionButtonsProps {
    onReset: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onReset }) => (
    <div className="flex gap-3 mt-6">
        <button
            onClick={onReset}
            className="flex-1 py-3 px-4 bg-muted hover:bg-slate-200 dark:hover:bg-slate-700 text-text-primary font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
            ↻ Reset
        </button>
        <button
            onClick={() => window.print()}
            className="flex-1 py-3 px-4 bg-primary hover:bg-primary-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
            <DownloadIcon className="w-4 h-4" />
            Export
        </button>
    </div>
);

// ============================================
// LAYER CALCULATOR
// ============================================
interface LayerCalculatorProps {
    onBack: () => void;
}

const LayerCalculator: React.FC<LayerCalculatorProps> = ({ onBack }) => {
    const [marketPricePerBird, setMarketPricePerBird] = useState(5000);
    const [totalBirds, setTotalBirds] = useState(500);
    const [feedCostPerBag, setFeedCostPerBag] = useState(15000);
    const [dailyFeedBags, setDailyFeedBags] = useState(2.5);
    const [pricePerCrate, setPricePerCrate] = useState(3500);
    const [miscCosts, setMiscCosts] = useState(5000);
    const [dailyCrates, setDailyCrates] = useState(14);
    const [profitIncreaseTarget, setProfitIncreaseTarget] = useState(20);
    const [showProjection, setShowProjection] = useState(false);

    const calculations = useMemo(() => {
        const totalDailyFeedCost = dailyFeedBags * feedCostPerBag;
        const dailyRevenueFromEggs = dailyCrates * pricePerCrate;
        const dailyOperationalCost = totalDailyFeedCost + miscCosts;
        const dailyProfitLoss = dailyRevenueFromEggs - dailyOperationalCost;
        const layingCapacity = totalBirds > 0 ? ((dailyCrates * 30) / totalBirds) * 100 : 0;
        const projectedProfit = dailyProfitLoss * (1 + profitIncreaseTarget / 100);

        return {
            totalDailyFeedCost,
            dailyRevenueFromEggs,
            dailyOperationalCost,
            dailyProfitLoss,
            layingCapacity: Math.min(layingCapacity, 100),
            projectedProfit,
        };
    }, [marketPricePerBird, totalBirds, feedCostPerBag, dailyFeedBags, pricePerCrate, miscCosts, dailyCrates, profitIncreaseTarget]);

    const formatCurrency = (value: number) =>
        `₦${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

    const handleReset = () => {
        setMarketPricePerBird(5000);
        setTotalBirds(500);
        setFeedCostPerBag(15000);
        setDailyFeedBags(2.5);
        setPricePerCrate(3500);
        setMiscCosts(5000);
        setDailyCrates(14);
        setProfitIncreaseTarget(20);
        setShowProjection(false);
    };

    return (
        <div className="bg-background min-h-screen p-4 lg:p-6">
            <div className="max-w-2xl mx-auto">
                <CalculatorHeader
                    title="Layer Profitability Calculator"
                    subtitle="Estimate your egg farm profits"
                    onBack={onBack}
                />

                {/* Input Fields */}
                <div className="bg-card rounded-2xl border border-border p-5 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Market Price per Bird (₦)" value={marketPricePerBird} onChange={setMarketPricePerBird} prefix="₦" />
                        <InputField label="Total Number of Birds" value={totalBirds} onChange={setTotalBirds} />
                        <InputField label="Cost of One Bag of Feed (₦)" value={feedCostPerBag} onChange={setFeedCostPerBag} prefix="₦" />
                        <InputField label="Daily Feed Consumption (Bags)" value={dailyFeedBags} onChange={setDailyFeedBags} suffix="bags" />
                        <InputField label="Price per Crate of Eggs (₦)" value={pricePerCrate} onChange={setPricePerCrate} prefix="₦" />
                        <InputField label="Miscellaneous Costs (₦)" value={miscCosts} onChange={setMiscCosts} prefix="₦" description="Medication, labor, electricity, water" />
                        <InputField label="Estimated Daily Crates Collected" value={dailyCrates} onChange={setDailyCrates} suffix="crates" />
                    </div>
                </div>

                {/* Results */}
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-inner">
                    <h3 className="text-sm font-bold text-text-primary mb-4 uppercase">Daily Profitability Analysis</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <ResultCard label="Total Daily Feed Cost" value={formatCurrency(calculations.totalDailyFeedCost)} color="red" />
                        <ResultCard label="Daily Revenue from Eggs" value={formatCurrency(calculations.dailyRevenueFromEggs)} color="green" />
                        <ResultCard label="Daily Operational Cost" value={formatCurrency(calculations.dailyOperationalCost)} color="yellow" />
                        <div className="bg-card p-3 rounded-xl shadow-sm border border-border text-center">
                            <p className="text-xs text-text-secondary uppercase mb-1 font-medium">Laying Capacity</p>
                            <p className="text-lg font-bold text-primary">{calculations.layingCapacity.toFixed(0)}%</p>
                        </div>
                        <div className={`col-span-2 p-4 rounded-xl text-center shadow-lg ${calculations.dailyProfitLoss >= 0
                            ? 'bg-gradient-to-br from-primary to-lime-600 text-white'
                            : 'bg-gradient-to-br from-red-500 to-rose-600 text-white'
                            }`}>
                            <p className="text-xs uppercase mb-1 font-medium opacity-90">Daily Profit/Loss</p>
                            <p className="text-2xl font-bold">{formatCurrency(calculations.dailyProfitLoss)}</p>
                            {calculations.dailyProfitLoss >= 0 && <span className="text-sm">🎉 Healthy Margin</span>}
                        </div>
                    </div>

                    {/* Profit Improvement Toggle */}
                    <div className="mt-6 p-4 bg-card rounded-xl border border-border">
                        <div className="flex items-center justify-between mb-3">
                            <label htmlFor="profit-toggle" className="text-sm font-medium text-text-primary">
                                I want to achieve a {profitIncreaseTarget}% increase in profit
                            </label>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                    id="profit-toggle"
                                    type="checkbox"
                                    checked={showProjection}
                                    onChange={(e) => setShowProjection(e.target.checked)}
                                    className="sr-only peer"
                                    title="Toggle profit projection"
                                    aria-label="Toggle profit projection"
                                />
                                <div
                                    className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors cursor-pointer"
                                    onClick={() => setShowProjection(!showProjection)}
                                >
                                    <div className={`dot absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform ${showProjection ? 'translate-x-5' : ''}`}></div>
                                </div>
                            </div>
                        </div>
                        {showProjection && (
                            <>
                                <label htmlFor="profit-slider" className="sr-only">Profit increase target percentage</label>
                                <input
                                    id="profit-slider"
                                    type="range"
                                    min="5"
                                    max="100"
                                    value={profitIncreaseTarget}
                                    onChange={(e) => setProfitIncreaseTarget(Number(e.target.value))}
                                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                    title={`Target: ${profitIncreaseTarget}%`}
                                    aria-label="Profit increase target percentage"
                                />
                                <div className="flex justify-between text-xs text-text-secondary mt-1">
                                    <span>5%</span>
                                    <span>Target: {profitIncreaseTarget}%</span>
                                    <span>100%</span>
                                </div>
                                <div className="mt-4 p-3 bg-primary/10 rounded-xl text-center">
                                    <p className="text-xs text-text-secondary uppercase mb-1">Projected Daily Profit</p>
                                    <p className="text-xl font-bold text-primary">{formatCurrency(calculations.projectedProfit)}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <ActionButtons onReset={handleReset} />
                <Disclaimer />
            </div>
        </div>
    );
};

// ============================================
// BROILER CALCULATOR
// ============================================
interface BroilerCalculatorProps {
    onBack: () => void;
}

const BroilerCalculator: React.FC<BroilerCalculatorProps> = ({ onBack }) => {
    const [marketPricePerBird, setMarketPricePerBird] = useState(6500);
    const [costPerChick, setCostPerChick] = useState(800);
    const [numberOfBirds, setNumberOfBirds] = useState(500);
    const [feedCostPerBag, setFeedCostPerBag] = useState(18000);
    const [totalFeedBags, setTotalFeedBags] = useState(75);
    const [miscCosts, setMiscCosts] = useState(50000);
    const [ageOfBirds, setAgeOfBirds] = useState(8);

    const calculations = useMemo(() => {
        const totalBirdAcquisitionCost = costPerChick * numberOfBirds;
        const totalFeedCost = totalFeedBags * feedCostPerBag;
        const totalOperationalCost = totalBirdAcquisitionCost + totalFeedCost + miscCosts;
        const potentialTotalRevenue = marketPricePerBird * numberOfBirds;
        const estimatedProfitLoss = potentialTotalRevenue - totalOperationalCost;

        return {
            totalBirdAcquisitionCost,
            totalFeedCost,
            totalOperationalCost,
            potentialTotalRevenue,
            estimatedProfitLoss,
        };
    }, [marketPricePerBird, costPerChick, numberOfBirds, feedCostPerBag, totalFeedBags, miscCosts, ageOfBirds]);

    const formatCurrency = (value: number) =>
        `₦${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

    const handleReset = () => {
        setMarketPricePerBird(6500);
        setCostPerChick(800);
        setNumberOfBirds(500);
        setFeedCostPerBag(18000);
        setTotalFeedBags(75);
        setMiscCosts(50000);
        setAgeOfBirds(8);
    };

    return (
        <div className="bg-background min-h-screen p-4 lg:p-6">
            <div className="max-w-2xl mx-auto">
                <CalculatorHeader
                    title="Broiler Profitability Calculator"
                    subtitle="Estimate your meat bird profits"
                    onBack={onBack}
                />

                {/* Input Fields */}
                <div className="bg-card rounded-2xl border border-border p-5 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Market Price per Broiler Bird (₦)" value={marketPricePerBird} onChange={setMarketPricePerBird} prefix="₦" />
                        <InputField label="Cost of One Day-Old Chick (₦)" value={costPerChick} onChange={setCostPerChick} prefix="₦" />
                        <InputField label="Number of Birds to Acquire" value={numberOfBirds} onChange={setNumberOfBirds} />
                        <InputField label="Cost of One Bag of Feed (₦)" value={feedCostPerBag} onChange={setFeedCostPerBag} prefix="₦" />
                        <InputField label="Total Bags of Feed Consumed" value={totalFeedBags} onChange={setTotalFeedBags} suffix="bags" />
                        <InputField label="Miscellaneous Costs (₦)" value={miscCosts} onChange={setMiscCosts} prefix="₦" description="Medication, litter, electricity, labor" />
                        <InputField label="Age of Birds (Weeks)" value={ageOfBirds} onChange={setAgeOfBirds} suffix="weeks" />
                    </div>
                </div>

                {/* Results */}
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-inner">
                    <h3 className="text-sm font-bold text-text-primary mb-4 uppercase">Cycle Profitability Analysis</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <ResultCard label="Bird Acquisition Cost" value={formatCurrency(calculations.totalBirdAcquisitionCost)} color="yellow" />
                        <ResultCard label="Total Feed Cost" value={formatCurrency(calculations.totalFeedCost)} color="red" />
                        <ResultCard label="Total Operational Cost" value={formatCurrency(calculations.totalOperationalCost)} color="red" />
                        <ResultCard label="Potential Revenue" value={formatCurrency(calculations.potentialTotalRevenue)} color="blue" />
                        <div className={`col-span-2 p-4 rounded-xl text-center shadow-lg ${calculations.estimatedProfitLoss >= 0
                            ? 'bg-gradient-to-br from-primary to-lime-600 text-white'
                            : 'bg-gradient-to-br from-red-500 to-rose-600 text-white'
                            }`}>
                            <p className="text-xs uppercase mb-1 font-medium opacity-90">Estimated Total Profit/Loss</p>
                            <p className="text-2xl font-bold">{formatCurrency(calculations.estimatedProfitLoss)}</p>
                            {calculations.estimatedProfitLoss >= 0 && <span className="text-sm">🎉 Per Cycle</span>}
                        </div>
                    </div>
                </div>

                <ActionButtons onReset={handleReset} />
                <Disclaimer />
            </div>
        </div>
    );
};

// ============================================
// AQUACULTURE CALCULATOR
// ============================================
interface AquacultureCalculatorProps {
    onBack: () => void;
}

const AquacultureCalculator: React.FC<AquacultureCalculatorProps> = ({ onBack }) => {
    const [marketPricePerKg, setMarketPricePerKg] = useState(2500);
    const [costPerFingerling, setCostPerFingerling] = useState(150);
    const [numberOfFish, setNumberOfFish] = useState(1000);
    const [feedCostPerBag, setFeedCostPerBag] = useState(25000);
    const [totalFeedBags, setTotalFeedBags] = useState(40);
    const [miscCosts, setMiscCosts] = useState(80000);
    const [avgHarvestWeight, setAvgHarvestWeight] = useState(1.5);

    const calculations = useMemo(() => {
        const totalFishAcquisitionCost = costPerFingerling * numberOfFish;
        const totalFeedCost = totalFeedBags * feedCostPerBag;
        const totalOperationalCost = totalFishAcquisitionCost + totalFeedCost + miscCosts;
        const estimatedHarvestWeight = numberOfFish * avgHarvestWeight;
        const potentialTotalRevenue = estimatedHarvestWeight * marketPricePerKg;
        const estimatedProfitLoss = potentialTotalRevenue - totalOperationalCost;

        return {
            totalFishAcquisitionCost,
            totalFeedCost,
            totalOperationalCost,
            estimatedHarvestWeight,
            potentialTotalRevenue,
            estimatedProfitLoss,
        };
    }, [marketPricePerKg, costPerFingerling, numberOfFish, feedCostPerBag, totalFeedBags, miscCosts, avgHarvestWeight]);

    const formatCurrency = (value: number) =>
        `₦${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

    const handleReset = () => {
        setMarketPricePerKg(2500);
        setCostPerFingerling(150);
        setNumberOfFish(1000);
        setFeedCostPerBag(25000);
        setTotalFeedBags(40);
        setMiscCosts(80000);
        setAvgHarvestWeight(1.5);
    };

    return (
        <div className="bg-background min-h-screen p-4 lg:p-6">
            <div className="max-w-2xl mx-auto">
                <CalculatorHeader
                    title="Aquaculture Profitability Calculator"
                    subtitle="Estimate your fish farming profits"
                    onBack={onBack}
                />

                {/* Input Fields */}
                <div className="bg-card rounded-2xl border border-border p-5 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Market Price per KG of Fish (₦)" value={marketPricePerKg} onChange={setMarketPricePerKg} prefix="₦" />
                        <InputField label="Cost per Fingerling/Juvenile (₦)" value={costPerFingerling} onChange={setCostPerFingerling} prefix="₦" />
                        <InputField label="Number of Fish to Acquire" value={numberOfFish} onChange={setNumberOfFish} />
                        <InputField label="Cost of One Bag of Fish Feed (₦)" value={feedCostPerBag} onChange={setFeedCostPerBag} prefix="₦" />
                        <InputField label="Total Bags of Feed Consumed" value={totalFeedBags} onChange={setTotalFeedBags} suffix="bags" />
                        <InputField label="Miscellaneous Costs (₦)" value={miscCosts} onChange={setMiscCosts} prefix="₦" description="Pond maintenance, water treatment, labor" />
                        <InputField label="Avg Size at Harvest (KG)" value={avgHarvestWeight} onChange={setAvgHarvestWeight} suffix="kg" />
                    </div>
                </div>

                {/* Results */}
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-inner">
                    <h3 className="text-sm font-bold text-text-primary mb-4 uppercase">Harvest Profitability Analysis</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <ResultCard label="Fish Acquisition Cost" value={formatCurrency(calculations.totalFishAcquisitionCost)} color="yellow" />
                        <ResultCard label="Total Feed Cost" value={formatCurrency(calculations.totalFeedCost)} color="red" />
                        <ResultCard label="Total Operational Cost" value={formatCurrency(calculations.totalOperationalCost)} color="red" />
                        <div className="bg-card p-3 rounded-xl shadow-sm border border-border text-center">
                            <p className="text-xs text-text-secondary uppercase mb-1 font-medium">Est. Harvest Weight</p>
                            <p className="text-lg font-bold text-cyan-500">{calculations.estimatedHarvestWeight.toLocaleString()} KG</p>
                        </div>
                        <ResultCard label="Potential Revenue" value={formatCurrency(calculations.potentialTotalRevenue)} color="blue" />
                        <div className={`p-3 rounded-xl text-center shadow-lg ${calculations.estimatedProfitLoss >= 0
                            ? 'bg-gradient-to-br from-primary to-lime-600 text-white'
                            : 'bg-gradient-to-br from-red-500 to-rose-600 text-white'
                            }`}>
                            <p className="text-xs uppercase mb-1 font-medium opacity-90">Profit/Loss</p>
                            <p className="text-lg font-bold">{formatCurrency(calculations.estimatedProfitLoss)}</p>
                        </div>
                    </div>
                </div>

                <ActionButtons onReset={handleReset} />
                <Disclaimer />
            </div>
        </div>
    );
};

export default CalculatorScreen;
