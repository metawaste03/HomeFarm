
import React, { useState, useCallback, useMemo } from 'react';
import { FeedBagIcon, MortalityIcon, NotepadIcon, CalendarIcon, CheckCircleIcon, PlusIcon, MinusIcon, ScaleIcon, StethoscopeIcon } from './icons';
import InputCard from './InputCard';
import { dailyLogsService } from '../services/database';
import { useAuth } from '../contexts/AuthContext';
import { useBusiness } from '../contexts/BusinessContext';
import { Screen } from '../App';
import { Farm } from './FarmManagementScreen';
import { Batch } from './BatchManagementScreen';
import HealthLogModal, { HealthLogData } from './HealthLogModal';

interface BroilerLogScreenProps {
    onNavigate: (screen: Screen) => void;
    farm: Farm | null;
    batch: Batch | null;
}

const BroilerLogScreen: React.FC<BroilerLogScreenProps> = ({ onNavigate, farm, batch }) => {
    const { user } = useAuth();
    const { getAvailableFeed, checkAvailability, recordUsage } = useBusiness();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isWeightModalOpen, setWeightModalOpen] = useState(false);
    const [sampledBirds, setSampledBirds] = useState<number>(0);
    const [totalWeight, setTotalWeight] = useState<number>(0);
    const [feedKg, setFeedKg] = useState(0);
    const [selectedFeedId, setSelectedFeedId] = useState<string>('');
    const [feedError, setFeedError] = useState<string | null>(null);
    const availableFeed = getAvailableFeed();
    const [mortality, setMortality] = useState(0);
    const [notes, setNotes] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const averageWeightInGrams = useMemo(() => {
        if (sampledBirds > 0 && totalWeight > 0) {
            return Math.round((totalWeight / sampledBirds) * 1000);
        }
        return 0;
    }, [sampledBirds, totalWeight]);

    const handleNumericInput = (setter: React.Dispatch<React.SetStateAction<number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const num = parseFloat(e.target.value);
        setter(isNaN(num) || num < 0 ? 0 : num);
    };

    // Check feed availability when amount or item changes
    const feedAvailability = useMemo(() => {
        if (!selectedFeedId || feedKg <= 0) return null;
        return checkAvailability(selectedFeedId, feedKg);
    }, [selectedFeedId, feedKg, checkAvailability]);

    const resetForm = useCallback(() => {
        setFeedKg(0);
        setSelectedFeedId('');
        setFeedError(null);
        setMortality(0);
        setNotes('');
    }, []);

    const handleSaveWeight = () => {
        console.log({ date, farm: farm?.name, batch: batch?.name, weightSample: { sampledBirds, totalWeight, averageWeightInGrams } });
        setWeightModalOpen(false);
    };

    const handleSave = async () => {
        if (!user || !farm) {
            alert('Please select a farm before saving.');
            return;
        }

        // Validate feed availability if feed is being logged
        if (feedKg > 0 && selectedFeedId) {
            const availability = checkAvailability(selectedFeedId, feedKg);
            if (!availability.available) {
                setFeedError(`Insufficient stock! Only ${availability.currentQty} ${availableFeed.find(f => f.id === selectedFeedId)?.unit || 'units'} of ${availability.itemName} available.`);
                return;
            }
        }

        setIsSaving(true);
        setFeedError(null);

        const selectedFeed = availableFeed.find(f => f.id === selectedFeedId);
        const activities = {
            sector: 'Broiler',
            feed: { kg: feedKg, brand: selectedFeed?.name || '', itemId: selectedFeedId },
            mortality,
            weightSample: sampledBirds > 0 ? { sampledBirds, totalWeight, averageWeightGrams: averageWeightInGrams } : null,
        };

        try {
            // First, deduct from inventory if feed was logged
            if (feedKg > 0 && selectedFeedId) {
                await recordUsage(selectedFeedId, feedKg, `Daily log (Broiler) - ${date}`);
            }

            await dailyLogsService.create({
                farm_id: String(farm.id),
                batch_id: batch ? String(batch.id) : null,
                log_date: date,
                activities,
                notes: notes || null,
                created_by: user.id,
            });

            setShowConfirmation(true);
            setTimeout(() => {
                setShowConfirmation(false);
                resetForm();
                onNavigate('dashboard');
            }, 2000);
        } catch (error: any) {
            console.error('Error saving log:', error);
            if (error.message?.includes('Insufficient stock')) {
                setFeedError(error.message);
            } else {
                alert('Failed to save log. Please try again.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveHealthLog = (data: HealthLogData) => {
        console.log('Health Log Saved:', data);
        alert('Health Note Recorded!');
    };

    // Track if user has started filling the form
    const hasInteracted = useMemo(() => {
        return feedKg > 0 || mortality > 0 || notes.trim().length > 0 || selectedFeedId !== '' || sampledBirds > 0 || totalWeight > 0;
    }, [feedKg, mortality, notes, selectedFeedId, sampledBirds, totalWeight]);

    return (
        <div className="bg-background min-h-screen">
            <div className="relative">
                {/* Clean Header - Title + Date Badge Only */}
                <header className="bg-card p-4 pt-6 shadow-sm">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold rounded-full uppercase">
                                Broiler
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-text-primary">Daily Log</h1>

                        {/* Date Badge */}
                        <div className="relative mt-3 inline-block">
                            <label
                                htmlFor="date-picker"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm font-medium text-text-primary cursor-pointer hover:bg-border transition-colors"
                            >
                                <CalendarIcon className="w-4 h-4 text-primary" />
                                <span>{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            </label>
                            <input
                                id="date-picker"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                </header>

                <div className="p-4 space-y-4 pb-32 lg:max-w-2xl lg:mx-auto">
                    <div className="bg-card rounded-xl shadow-sm p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <FeedBagIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                            <h3 className="text-lg font-semibold text-text-primary">Feed Consumed (kg)</h3>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <button onClick={() => setFeedKg(f => Math.max(0, f - 1))} className="bg-muted rounded-full p-3 text-text-secondary hover:bg-border active:bg-slate-400 transition-colors transform active:scale-90" aria-label="Decrease Feed Consumed">
                                <MinusIcon className="w-8 h-8" />
                            </button>
                            <div className="flex items-baseline justify-center w-full">
                                <input type="number" value={feedKg > 0 ? feedKg.toString() : ''} onChange={handleNumericInput(setFeedKg)} placeholder="0" className="text-6xl font-bold text-center bg-transparent focus:outline-none w-full text-text-primary" pattern="[0-9]*" />
                                <span className="text-2xl font-semibold text-text-secondary">kg</span>
                            </div>
                            <button onClick={() => setFeedKg(f => f + 1)} className="bg-primary rounded-full p-3 text-white hover:bg-primary-600 active:bg-primary-700 transition-colors transform active:scale-90" aria-label="Increase Feed Consumed">
                                <PlusIcon className="w-8 h-8" />
                            </button>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border">
                            <label htmlFor="feed-select" className="block text-sm font-medium text-text-secondary mb-1">Select Feed from Inventory</label>
                            {availableFeed.length === 0 ? (
                                <p className="text-sm text-text-secondary italic">No feed in inventory. Add feed in the Inventory section first.</p>
                            ) : (
                                <select
                                    id="feed-select"
                                    value={selectedFeedId}
                                    onChange={(e) => {
                                        setSelectedFeedId(e.target.value);
                                        setFeedError(null);
                                    }}
                                    className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-card text-text-primary"
                                >
                                    <option value="">-- Select Feed --</option>
                                    {availableFeed.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} ({item.quantity} {item.unit} available)
                                        </option>
                                    ))}
                                </select>
                            )}
                            {feedAvailability && !feedAvailability.available && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-danger text-sm font-medium">
                                    <span>⚠️</span>
                                    <span>Insufficient stock! Only {feedAvailability.currentQty} available.</span>
                                </div>
                            )}
                            {feedAvailability && feedAvailability.available && selectedFeedId && feedKg > 0 && (
                                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                                    ✓ Stock available ({feedAvailability.currentQty} in inventory)
                                </p>
                            )}
                            {feedError && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-danger text-sm font-medium">
                                    <span>🚫</span>
                                    <span>{feedError}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <InputCard icon={<MortalityIcon className="w-8 h-8 text-danger" />} label="Mortality" value={mortality} onValueChange={setMortality} onIncrement={() => setMortality(c => c + 1)} onDecrement={() => setMortality(c => Math.max(0, c - 1))} incrementColorClass="bg-danger" />

                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setWeightModalOpen(true)} className="bg-card p-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors">
                            <ScaleIcon className="w-8 h-8 text-blue-500" />
                            <span className="text-sm font-bold text-text-primary text-center">Record Weight</span>
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
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Observed birds are healthy..." className="w-full h-24 p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-card text-text-primary" />
                    </div>
                </div>

                {/* Save Button - Only appears after user starts filling */}
                {(hasInteracted || showConfirmation) && (
                    <div className="fixed bottom-16 left-0 right-0 p-4 bg-card/90 backdrop-blur-sm border-t border-border z-10 lg:static lg:bg-transparent lg:border-0 lg:p-0 animate-slide-in-right">
                        <div className="max-w-md mx-auto lg:max-w-2xl space-y-2">
                            <button
                                onClick={handleSave}
                                disabled={showConfirmation}
                                className={`w-full text-white font-bold py-4 px-4 rounded-2xl text-lg transition-all duration-300 ease-in-out transform flex items-center justify-center ${showConfirmation
                                    ? 'bg-green-500'
                                    : 'bg-primary hover:bg-primary-600 active:bg-primary-700 active:scale-95'
                                    }`}
                            >
                                {showConfirmation ? (
                                    <>
                                        <CheckCircleIcon className="w-6 h-6 mr-2 animate-pulse" />
                                        Recorded!
                                    </>
                                ) : (
                                    'SAVE DAILY LOG'
                                )}
                            </button>
                            {showConfirmation && (
                                <p className="text-center text-sm text-lime-600 dark:text-lime-400 font-medium animate-fade-in">
                                    ✨ This improves your yield forecast.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {isWeightModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4 animate-fade-in" onClick={() => setWeightModalOpen(false)}>
                        <div className="bg-popover rounded-xl shadow-lg p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-lg font-bold mb-2 text-text-primary">Record Weight Sample</h3>
                            <p className="text-sm text-text-secondary mb-4">For an accurate average, weigh a small sample of your birds (e.g., 5-10 birds).</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Number of Birds Sampled</label>
                                    <input type="number" value={sampledBirds > 0 ? sampledBirds : ''} onChange={handleNumericInput(setSampledBirds)} placeholder="e.g., 10" className="w-full p-2 border border-border rounded-lg bg-card text-text-primary" autoFocus />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Total Weight of Sampled Birds (kg)</label>
                                    <input type="number" step="0.01" value={totalWeight > 0 ? totalWeight : ''} onChange={handleNumericInput(setTotalWeight)} placeholder="e.g., 18.5" className="w-full p-2 border border-border rounded-lg bg-card text-text-primary" />
                                </div>
                                {averageWeightInGrams > 0 && (
                                    <div className="text-center bg-green-100 dark:bg-green-900/50 p-4 rounded-lg">
                                        <p className="text-sm font-semibold text-text-secondary">AVERAGE WEIGHT PER BIRD</p>
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

export default BroilerLogScreen;
