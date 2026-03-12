import React, { useState } from 'react';
import { useFarm, Sector } from '../contexts/FarmContext';
import { ChickenIcon, FishIcon } from './icons';

interface OnboardingWizardProps {
    onComplete: () => void;
    onSkip: () => void;
}

const SECTOR_OPTIONS: { value: Sector; label: string; icon: React.FC<{ className?: string }>; color: string }[] = [
    { value: 'Layer', label: 'Layer (Eggs)', icon: ChickenIcon, color: 'bg-amber-500' },
    { value: 'Broiler', label: 'Broiler (Meat)', icon: ChickenIcon, color: 'bg-red-500' },
    { value: 'Fish', label: 'Aquaculture', icon: FishIcon, color: 'bg-blue-500' },
];

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onSkip }) => {
    // Step state: 1 = Create Farm, 2 = Create Batch, 3 = Celebration
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const { addFarm, addBatch, farms, refreshData } = useFarm();

    // --- Step 1: Farm ---
    const [farmName, setFarmName] = useState('');
    const [farmLocation, setFarmLocation] = useState('');
    const [farmError, setFarmError] = useState('');
    const [farmLoading, setFarmLoading] = useState(false);

    // --- Step 2: Batch ---
    const [batchName, setBatchName] = useState('');
    const [sector, setSector] = useState<Sector>('Layer');
    const [stockCount, setStockCount] = useState<number>(0);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [batchError, setBatchError] = useState('');
    const [batchLoading, setBatchLoading] = useState(false);

    const handleCreateFarm = async (e: React.FormEvent) => {
        e.preventDefault();
        setFarmError('');

        const trimmedName = farmName.trim();
        if (!trimmedName) {
            setFarmError('Please enter your farm name.');
            return;
        }

        setFarmLoading(true);
        try {
            await addFarm({ name: trimmedName, location: farmLocation.trim() || undefined });
            await refreshData();
            setStep(2);
        } catch (err: any) {
            console.error('Onboarding: Failed to create farm', err);
            setFarmError(err?.message || 'Failed to create farm. Please try again.');
        } finally {
            setFarmLoading(false);
        }
    };

    const handleCreateBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        setBatchError('');

        const trimmedName = batchName.trim();
        if (!trimmedName) {
            setBatchError('Please enter a batch name.');
            return;
        }
        if (stockCount <= 0) {
            setBatchError('Please enter the number of stock.');
            return;
        }

        const targetFarm = farms[0];
        if (!targetFarm) {
            setBatchError('Something went wrong. Please reload the app.');
            return;
        }

        setBatchLoading(true);
        try {
            await addBatch({
                name: trimmedName,
                farm: targetFarm.name,
                farmId: String(targetFarm.id),
                sector,
                stockCount,
                status: 'Active',
                age: '1 day',
                startDate: startDate || undefined,
            });
            await refreshData();
            setStep(3); // Show celebration
        } catch (err: any) {
            console.error('Onboarding: Failed to create batch', err);
            setBatchError(err?.message || 'Failed to create batch. Please try again.');
        } finally {
            setBatchLoading(false);
        }
    };

    const handleFinishCelebration = () => {
        onComplete();
    };

    return (
        <div className="fixed inset-0 bg-background z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-md mx-auto">
                {/* Skip Button */}
                {step < 3 && (
                    <button
                        onClick={onSkip}
                        className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors p-2"
                        aria-label="Skip onboarding"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {/* Progress indicator */}
                {step < 3 && (
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className={`h-2 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary w-16' : 'bg-muted w-12'}`} />
                        <div className={`h-2 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary w-16' : 'bg-muted w-12'}`} />
                    </div>
                )}

                {/* Card */}
                <div className="bg-card rounded-2xl shadow-xl border border-border p-6 animate-fade-in">
                    {step === 1 ? (
                        <>
                            {/* Step 1: Create Farm */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                                    <span className="text-3xl">🏡</span>
                                </div>
                                <h1 className="text-2xl font-bold text-text-primary mb-2">Welcome to HomeFarm!</h1>
                                <p className="text-text-secondary text-sm">Let's get your farm set up. This only takes a minute.</p>
                            </div>

                            <form onSubmit={handleCreateFarm} className="space-y-4">
                                <div>
                                    <label htmlFor="farm-name" className="block text-sm font-semibold text-text-primary mb-1.5">
                                        Farm Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="farm-name"
                                        type="text"
                                        value={farmName}
                                        onChange={(e) => setFarmName(e.target.value)}
                                        placeholder="e.g. Sunshine Poultry Farm"
                                        className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                                        autoFocus
                                        disabled={farmLoading}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="farm-location" className="block text-sm font-semibold text-text-primary mb-1.5">
                                        Location <span className="text-text-secondary text-xs">(optional)</span>
                                    </label>
                                    <input
                                        id="farm-location"
                                        type="text"
                                        value={farmLocation}
                                        onChange={(e) => setFarmLocation(e.target.value)}
                                        placeholder="e.g. Lagos, Nigeria"
                                        className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                                        disabled={farmLoading}
                                    />
                                </div>

                                {farmError && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                        <p className="text-red-500 text-sm font-medium">{farmError}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={farmLoading}
                                    className="w-full bg-primary text-white font-bold py-3.5 rounded-xl text-lg hover:bg-primary-600 active:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {farmLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create My Farm →'
                                    )}
                                </button>
                            </form>
                        </>
                    ) : step === 2 ? (
                        <>
                            {/* Step 2: Create Batch */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                                    <span className="text-3xl">🐔</span>
                                </div>
                                <h1 className="text-2xl font-bold text-text-primary mb-2">Start Your First Batch</h1>
                                <p className="text-text-secondary text-sm">
                                    A batch is a group of birds or fish you're currently raising on <strong className="text-text-primary">{farms[0]?.name || 'your farm'}</strong>.
                                </p>
                            </div>

                            <form onSubmit={handleCreateBatch} className="space-y-4">
                                {/* Sector selector */}
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-2">
                                        What are you farming? <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {SECTOR_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setSector(opt.value)}
                                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${sector === opt.value
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'border-border bg-muted text-text-secondary hover:border-primary/30'
                                                    }`}
                                            >
                                                <opt.icon className="w-6 h-6" />
                                                <span className="text-xs font-semibold">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="batch-name" className="block text-sm font-semibold text-text-primary mb-1.5">
                                        Batch Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="batch-name"
                                        type="text"
                                        value={batchName}
                                        onChange={(e) => setBatchName(e.target.value)}
                                        placeholder="e.g. Batch 1 - Feb 2026"
                                        className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                                        autoFocus
                                        disabled={batchLoading}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="stock-count" className="block text-sm font-semibold text-text-primary mb-1.5">
                                        Number of Stock <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="stock-count"
                                        type="number"
                                        value={stockCount || ''}
                                        onChange={(e) => setStockCount(parseInt(e.target.value) || 0)}
                                        placeholder="e.g. 500"
                                        min="1"
                                        className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                                        disabled={batchLoading}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="start-date" className="block text-sm font-semibold text-text-primary mb-1.5">
                                        Start Date
                                    </label>
                                    <input
                                        id="start-date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                                        disabled={batchLoading}
                                    />
                                </div>

                                {batchError && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                        <p className="text-red-500 text-sm font-medium">{batchError}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={batchLoading}
                                    className="w-full bg-primary text-white font-bold py-3.5 rounded-xl text-lg hover:bg-primary-600 active:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {batchLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Start Farming! 🚀'
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            {/* Step 3: Celebration */}
                            <div className="text-center mb-6">
                                {/* Celebration Animation */}
                                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4">
                                    <div className="absolute inset-0 animate-ping bg-primary/20 rounded-full"></div>
                                    <div className="absolute inset-2 animate-pulse bg-primary/30 rounded-full"></div>
                                    <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white">
                                        <span className="text-3xl">🎉</span>
                                    </div>
                                </div>

                                {/* Confetti-like decorative elements */}
                                <div className="flex justify-center gap-2 mb-4">
                                    <span className="text-2xl animate-bounce" style={{ animationDelay: '0ms' }}>✨</span>
                                    <span className="text-2xl animate-bounce" style={{ animationDelay: '100ms' }}>🎊</span>
                                    <span className="text-2xl animate-bounce" style={{ animationDelay: '200ms' }}>✨</span>
                                </div>

                                <h1 className="text-2xl font-bold text-text-primary mb-2">Congratulations!</h1>
                                <p className="text-text-secondary text-sm mb-4">
                                    You've taken the first step to knowing what's happening at your facilities.
                                </p>
                                <p className="text-text-secondary text-sm">
                                    Now you can start tracking daily activities, monitoring progress, and making data-driven decisions for <strong className="text-text-primary">{farms[0]?.name}</strong>.
                                </p>
                            </div>

                            <button
                                onClick={handleFinishCelebration}
                                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl text-lg hover:bg-primary-600 active:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                            >
                                Let's Get Started! →
                            </button>
                        </>
                    )}
                </div>

                {/* Subtle footer */}
                {step < 3 && (
                    <p className="text-center text-text-secondary/50 text-xs mt-6">
                        Step {step} of 2
                    </p>
                )}
            </div>
        </div>
    );
};

export default OnboardingWizard;
