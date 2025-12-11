
import React, { useState, useCallback, useMemo } from 'react';
import { FeedBagIcon, MortalityIcon, NotepadIcon, CalendarIcon, CheckCircleIcon, PlusIcon, MinusIcon, ScaleIcon, DropletIcon, FishIcon, StethoscopeIcon } from './icons';
import InputCard from './InputCard';
import { Screen } from '../App';
import { Farm } from './FarmManagementScreen';
import { Batch } from './BatchManagementScreen';
import HealthLogModal, { HealthLogData } from './HealthLogModal';

interface FishLogScreenProps {
    onNavigate: (screen: Screen) => void;
    farm: Farm | null;
    batch: Batch | null;
}

type WaterQuality = {
    ph: number;
    temperature: number;
    ammonia: number;
    dissolvedOxygen: number;
};

const OPTIMAL_RANGES = {
    ph: { min: 6.5, max: 8.5 },
    temperature: { min: 26, max: 32 },
    ammonia: { min: 0, max: 0.05 },
    dissolvedOxygen: { min: 5, max: Infinity },
};

const FishLogScreen: React.FC<FishLogScreenProps> = ({ onNavigate, farm, batch }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isWeightModalOpen, setWeightModalOpen] = useState(false);
    const [sampledfish, setSampledFish] = useState<number>(0);
    const [totalWeight, setTotalWeight] = useState<number>(0);
    const [feedKg, setFeedKg] = useState(0);
    const [feedBrand, setFeedBrand] = useState('');
    const [mortality, setMortality] = useState(0);
    const [waterQuality, setWaterQuality] = useState<WaterQuality>({ ph: 0, temperature: 0, ammonia: 0, dissolvedOxygen: 0 });
    const [notes, setNotes] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
    
    const averageWeightInGrams = useMemo(() => {
        if (sampledfish > 0 && totalWeight > 0) {
            return Math.round((totalWeight / sampledfish) * 1000);
        }
        return 0;
    }, [sampledfish, totalWeight]);

    const handleNumericInput = (setter: React.Dispatch<React.SetStateAction<number>>, isFloat: boolean = false) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const parser = isFloat ? parseFloat : parseInt;
        const num = parser(e.target.value);
        setter(isNaN(num) || num < 0 ? 0 : num);
    };
    
    const handleWaterQualityChange = (param: keyof WaterQuality, value: string) => {
        const num = parseFloat(value);
        setWaterQuality(prev => ({ ...prev, [param]: isNaN(num) || num < 0 ? 0 : num }));
    };
    
    const getParamStatusColor = (param: keyof WaterQuality): string => {
        const value = waterQuality[param];
        if (value === 0) return 'text-text-primary';
        const { min, max } = OPTIMAL_RANGES[param];
        if (value >= min && value <= max) return 'text-green-500';
        return 'text-danger';
    };

    const resetForm = useCallback(() => {
        setFeedKg(0);
        setFeedBrand('');
        setMortality(0);
        setWaterQuality({ ph: 0, temperature: 0, ammonia: 0, dissolvedOxygen: 0 });
        setNotes('');
    }, []);

    const handleSaveWeight = () => {
        console.log({ date, farm: farm?.name, batch: batch?.name, weightSample: { sampledfish, totalWeight, averageWeightInGrams } });
        setWeightModalOpen(false);
    };

    const handleSave = () => {
        console.log({ date, farm: farm?.name, batch: batch?.name, feed: { kg: feedKg, brand: feedBrand }, mortality, waterQuality, notes });
        setShowConfirmation(true);
        setTimeout(() => {
            setShowConfirmation(false);
            resetForm();
            onNavigate('dashboard');
        }, 2000);
    };
    
    const handleSaveHealthLog = (data: HealthLogData) => {
        console.log('Health Log Saved:', data);
        alert('Health Note Recorded!');
    };

    const WaterQualityInput: React.FC<{ param: keyof WaterQuality, label: string, unit: string, optimal: string }> = ({ param, label, unit, optimal }) => (
        <div>
            <label className="block text-sm font-medium text-text-secondary">{label}</label>
            <div className="relative">
                <input
                    type="number"
                    step="0.01"
                    value={waterQuality[param] > 0 ? waterQuality[param] : ''}
                    onChange={(e) => handleWaterQualityChange(param, e.target.value)}
                    placeholder="0.0"
                    className={`w-full p-2 pr-12 text-xl font-bold border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-card ${getParamStatusColor(param)}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary font-semibold">{unit}</span>
            </div>
            <p className="text-xs text-text-secondary mt-1">Optimal: {optimal}</p>
        </div>
    );

    return (
        <div className="bg-background min-h-screen">
            <div className="relative">
                <header className="bg-card p-4 shadow-sm sticky top-0 z-10">
                    <div className="flex justify-between items-center">
                        <button onClick={() => onNavigate('dashboard')} className="text-primary font-semibold">&larr; Back</button>
                         <div className="text-center">
                            <h1 className="text-xl font-bold text-text-primary">{farm?.name || "Select a Farm"}</h1>
                            <p className="text-sm text-text-secondary">{batch?.name || "Select a Batch"}</p>
                        </div>
                        <div className="w-20"></div>
                    </div>
                    <div className="relative mt-4">
                        <label htmlFor="date-picker" className="flex items-center justify-center gap-2 text-lg font-semibold text-primary cursor-pointer">
                            <CalendarIcon className="w-6 h-6" />
                            <span>{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </label>
                        <input id="date-picker" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                </header>

                <div className="p-4 space-y-4 pb-32">
                    <div className="bg-card rounded-xl shadow-sm p-4 space-y-4">
                         <div className="flex items-center gap-3">
                            <DropletIcon className="w-8 h-8 text-cyan-500 dark:text-cyan-400"/>
                            <h3 className="text-lg font-semibold text-text-primary">Water Quality Parameters</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <WaterQualityInput param="ph" label="pH Level" unit="" optimal="6.5 - 8.5" />
                            <WaterQualityInput param="temperature" label="Temp (°C)" unit="°C" optimal="26-32" />
                            <WaterQualityInput param="ammonia" label="Ammonia" unit="ppm" optimal="< 0.05" />
                            <WaterQualityInput param="dissolvedOxygen" label="Oxygen" unit="mg/L" optimal="> 5" />
                        </div>
                    </div>
                    
                     <div className="bg-card rounded-xl shadow-sm p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <FeedBagIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400"/>
                            <h3 className="text-lg font-semibold text-text-primary">Feed Consumed (kg)</h3>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <button onClick={() => setFeedKg(f => Math.max(0, f - 0.1))} className="bg-muted rounded-full p-3 text-text-secondary hover:bg-border active:bg-slate-400 transition-colors transform active:scale-90"> <MinusIcon className="w-8 h-8" /> </button>
                            <div className="flex items-baseline justify-center w-full">
                                <input type="number" step="0.1" value={feedKg > 0 ? feedKg.toString() : ''} onChange={handleNumericInput(setFeedKg, true)} placeholder="0.0" className="text-6xl font-bold text-center bg-transparent focus:outline-none w-full text-text-primary" />
                                <span className="text-2xl font-semibold text-text-secondary">kg</span>
                            </div>
                            <button onClick={() => setFeedKg(f => f + 0.1)} className="bg-primary rounded-full p-3 text-white hover:bg-primary-600 active:bg-primary-700 transition-colors transform active:scale-90"> <PlusIcon className="w-8 h-8" /> </button>
                        </div>
                         <div className="mt-4 pt-4 border-t border-border">
                            <label htmlFor="feed-brand" className="block text-sm font-medium text-text-secondary mb-1">Feed Brand / Type</label>
                            <input id="feed-brand" type="text" value={feedBrand} onChange={(e) => setFeedBrand(e.target.value)} placeholder="e.g., Aller Aqua Tilapia" className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-card text-text-primary" />
                        </div>
                    </div>

                    <InputCard icon={<MortalityIcon className="w-8 h-8 text-danger"/>} label="Mortality" value={mortality} onValueChange={setMortality} onIncrement={() => setMortality(c => c + 1)} onDecrement={() => setMortality(c => Math.max(0, c - 1))} />

                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setWeightModalOpen(true)} className="bg-card p-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors">
                            <ScaleIcon className="w-8 h-8 text-blue-500" />
                            <span className="text-sm font-bold text-text-primary text-center">Record Sampling</span>
                        </button>
                        <button onClick={() => setIsHealthModalOpen(true)} className="bg-card p-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors">
                             <StethoscopeIcon className="w-8 h-8 text-danger" />
                             <span className="text-sm font-bold text-text-primary text-center">Record Health</span>
                        </button>
                    </div>
                    
                    <div className="bg-card rounded-xl shadow-sm p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <NotepadIcon className="w-6 h-6 text-text-secondary" />
                            <h3 className="text-lg font-semibold text-text-primary">Add a Note (Optional)</h3>
                        </div>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Water appears cloudy, conducted a partial water change..." className="w-full h-24 p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-card text-text-primary" />
                    </div>
                </div>

                <div className="fixed bottom-16 left-0 right-0 p-4 bg-card/80 backdrop-blur-sm border-t border-border z-10">
                    <div className="max-w-md mx-auto">
                        <button onClick={handleSave} disabled={!batch || showConfirmation} className={`w-full text-white font-bold py-4 px-4 rounded-xl text-lg transition-all duration-300 ease-in-out transform flex items-center justify-center ${ showConfirmation ? 'bg-green-500' : !batch ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-primary hover:bg-primary-600 active:bg-primary-700 active:scale-95' }`}>
                            {showConfirmation ? ( <> <CheckCircleIcon className="w-6 h-6 mr-2 animate-pulse" /> Saved! </> ) : ( 'SAVE DAILY LOG' )}
                        </button>
                    </div>
                </div>

                {isWeightModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4 animate-fade-in" onClick={() => setWeightModalOpen(false)}>
                        <div className="bg-popover rounded-xl shadow-lg p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-lg font-bold mb-2 text-text-primary">Record Weight Sample</h3>
                            <p className="text-sm text-text-secondary mb-4">For an accurate average, weigh a small sample of your fish.</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Number of Fish Sampled</label>
                                    <input type="number" value={sampledfish > 0 ? sampledfish : ''} onChange={handleNumericInput(setSampledFish)} placeholder="e.g., 20" className="w-full p-2 border border-border rounded-lg bg-card text-text-primary" autoFocus />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Total Weight of Sample (kg)</label>
                                    <input type="number" step="0.01" value={totalWeight > 0 ? totalWeight : ''} onChange={handleNumericInput(setTotalWeight, true)} placeholder="e.g., 5.0" className="w-full p-2 border border-border rounded-lg bg-card text-text-primary" />
                                </div>
                                {averageWeightInGrams > 0 && (
                                    <div className="text-center bg-green-100 dark:bg-green-900/50 p-4 rounded-lg">
                                        <p className="text-sm font-semibold text-text-secondary">AVERAGE WEIGHT PER FISH</p>
                                        <p className="text-4xl font-bold text-primary">{averageWeightInGrams.toLocaleString()} g</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setWeightModalOpen(false)} className="px-4 py-2 rounded-lg text-text-primary bg-muted hover:bg-border font-semibold transition">Cancel</button>
                                <button onClick={handleSaveWeight} disabled={averageWeightInGrams <= 0} className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary-600 font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed">SAVE WEIGHT RECORD</button>
                            </div>
                        </div>
                    </div>
                )}
                
                <HealthLogModal 
                    isOpen={isHealthModalOpen}
                    onClose={() => setIsHealthModalOpen(false)}
                    onSave={handleSaveHealthLog}
                    batch={batch}
                />
            </div>
        </div>
    );
};

export default FishLogScreen;
