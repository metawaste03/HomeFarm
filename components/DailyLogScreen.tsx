

import React, { useState, useMemo, useCallback } from 'react';
import { EggIcon, FeedBagIcon, MortalityIcon, CalendarIcon, CheckCircleIcon, PlusIcon, MinusIcon, StethoscopeIcon, NotepadIcon } from './icons';
import InputCard from './InputCard';
// Fix: Use `import type` for type-only imports to prevent circular dependency issues.
import type { Screen } from '../App';
import type { Farm } from './FarmManagementScreen';
import type { Batch } from './BatchManagementScreen';
import HealthLogModal, { HealthLogData } from './HealthLogModal';

const DEFAULT_CATEGORIES = ['Jumbo', 'Large', 'Medium', 'Pullet'];
const CRATES_TO_EGGS = 30;

// Helper to calculate subtotal for a category
const calculateSubtotal = (crates: number, eggs: number): number => {
    return (crates || 0) * CRATES_TO_EGGS + (eggs || 0);
};

interface DailyLogScreenProps {
    onNavigate: (screen: Screen) => void;
    farm: Farm | null;
    batch: Batch | null;
}

const DailyLogScreen: React.FC<DailyLogScreenProps> = ({ onNavigate, farm, batch }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Egg Production State ('Crate-First' Logic)
    const [eggCategories, setEggCategories] = useState<string[]>(DEFAULT_CATEGORIES);
    const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
    const [eggCounts, setEggCounts] = useState<Record<string, { crates: number; eggs: number }>>({});
    
    // New Category Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Feed Consumption State
    const [feedKg, setFeedKg] = useState(0);
    const [feedBrand, setFeedBrand] = useState('');

    // Mortality State
    const [mortality, setMortality] = useState(0);

    // Notes State
    const [notes, setNotes] = useState('');
    
    // Health Log Modal State
    const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
    
    const [showConfirmation, setShowConfirmation] = useState(false);
    
    const grandTotalEggs = useMemo(() => {
        // FIX: Add type assertion as Object.values can be inferred as `unknown[]`.
        return (Object.values(eggCounts) as { crates: number; eggs: number }[]).reduce((sum, count) => {
            return sum + calculateSubtotal(count.crates, count.eggs);
        }, 0);
    }, [eggCounts]);

    const formatGrandTotal = (totalEggs: number): string => {
        if (isNaN(totalEggs) || totalEggs <= 0) return '';
        const crates = Math.floor(totalEggs / CRATES_TO_EGGS);
        const remaining = totalEggs % CRATES_TO_EGGS;
        return `equals ${crates} Crates + ${remaining} eggs`;
    };

    const handleToggleCategory = (category: string) => {
        setActiveCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
                if (!eggCounts[category]) {
                    setEggCounts(prevCounts => ({...prevCounts, [category]: { crates: 0, eggs: 0 }}));
                }
            }
            return newSet;
        });
    };

    const handleOpenModal = () => {
        setNewCategoryName('');
        setIsModalOpen(true);
    }
    
    const handleSaveNewCategory = () => {
        const trimmedCategory = newCategoryName.trim();
        if (trimmedCategory && !eggCategories.includes(trimmedCategory)) {
            setEggCategories(prev => [...prev, trimmedCategory]);
            setActiveCategories(prev => new Set(prev).add(trimmedCategory));
            if (!eggCounts[trimmedCategory]) {
                setEggCounts(prevCounts => ({...prevCounts, [trimmedCategory]: { crates: 0, eggs: 0 }}));
            }
        } else if (trimmedCategory && eggCategories.includes(trimmedCategory)) {
            setActiveCategories(prev => new Set(prev).add(trimmedCategory));
        }
        setIsModalOpen(false);
    };


    const handleEggCountChange = (category: string, field: 'crates' | 'eggs', value: string) => {
        const num = parseInt(value, 10);
        const count = isNaN(num) || num < 0 ? 0 : num;
        setEggCounts(prev => ({
            ...prev,
            [category]: {
                ...(prev[category] || { crates: 0, eggs: 0 }),
                [field]: count
            }
        }));
    };

    const handleNumericInput = (setter: React.Dispatch<React.SetStateAction<number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const num = parseInt(e.target.value, 10);
        setter(isNaN(num) || num < 0 ? 0 : num);
    };

    const resetForm = useCallback(() => {
        setActiveCategories(new Set());
        setEggCounts({});
        setFeedKg(0);
        setFeedBrand('');
        setMortality(0);
        setNotes('');
    }, []);

    const handleSave = () => {
        const eggData = Object.fromEntries(
            Array.from(activeCategories).map(category => [
                category,
                {
                    ...eggCounts[category],
                    subTotal: calculateSubtotal(eggCounts[category].crates, eggCounts[category].eggs)
                }
            // FIX: Add type assertion because TypeScript incorrectly infers entry[1] as a union type with string.
            ]).filter(entry => (entry[1] as { subTotal: number }).subTotal > 0)
        );

        console.log({
            date,
            farm: farm?.name,
            batch: batch?.name,
            eggCollection: { total: grandTotalEggs, breakdown: eggData },
            feed: { kg: feedKg, brand: feedBrand },
            mortality,
            notes
        });
        
        setShowConfirmation(true);

        setTimeout(() => {
            setShowConfirmation(false);
            resetForm();
            onNavigate('dashboard');
        }, 2000);
    };
    
    const handleSaveHealthLog = (data: HealthLogData) => {
        console.log('Health Log Saved:', data);
        // Here you would typically save this to your backend or state
        alert('Health Note Recorded!');
    };

    return (
        <div className="bg-background min-h-screen">
            <div className="relative">
                <header className="bg-card p-4 shadow-md sticky top-0 z-10 lg:hidden">
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
                        <input 
                            id="date-picker"
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                </header>

                <div className="p-4 space-y-4 pb-32 lg:pb-4 lg:max-w-2xl lg:mx-auto">
                    <div className="hidden lg:block text-center pt-4">
                        <h1 className="text-2xl font-bold text-text-primary">Daily Log: Layer</h1>
                         <div className="relative mt-2 inline-block">
                            <label htmlFor="date-picker-desktop" className="flex items-center justify-center gap-2 text-lg font-semibold text-primary cursor-pointer">
                                <CalendarIcon className="w-6 h-6" />
                                <span>{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </label>
                            <input 
                                id="date-picker-desktop"
                                type="date" 
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>


                    <div className="bg-card rounded-2xl shadow-md p-5 space-y-4">
                        <div className="flex items-center gap-3">
                            <EggIcon className="w-8 h-8 text-accent"/>
                            <h3 className="text-lg font-semibold text-text-primary">Egg Collection</h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {eggCategories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => handleToggleCategory(category)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                                        activeCategories.has(category)
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-muted text-text-primary hover:bg-border'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                            <button 
                                onClick={handleOpenModal}
                                className="w-8 h-8 flex items-center justify-center bg-muted rounded-full text-text-secondary hover:bg-border active:bg-slate-400 transition-colors transform active:scale-90"
                                aria-label="Add new egg category"
                            >
                                <PlusIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        
                        <div className="space-y-4 pt-2">
                             {(Array.from(activeCategories) as string[]).sort((a,b) => eggCategories.indexOf(a) - eggCategories.indexOf(b)).map(category => {
                                const counts = eggCounts[category] || { crates: 0, eggs: 0 };
                                const subTotal = calculateSubtotal(counts.crates, counts.eggs);
                                return (
                                <div key={category} className="p-3 bg-background rounded-xl animate-fade-in">
                                    <h4 className="block text-md font-semibold text-text-secondary mb-2">{category}</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label htmlFor={`egg-crates-${category}`} className="block text-xs font-medium text-text-secondary mb-1">Crates</label>
                                            <input
                                                id={`egg-crates-${category}`}
                                                type="number"
                                                value={counts.crates > 0 ? counts.crates.toString() : ''}
                                                onChange={(e) => handleEggCountChange(category, 'crates', e.target.value)}
                                                placeholder="0"
                                                className="w-full p-2 text-xl font-bold border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-card text-text-primary"
                                                pattern="[0-9]*"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`egg-loose-${category}`} className="block text-xs font-medium text-text-secondary mb-1">Eggs</label>
                                            <input
                                                id={`egg-loose-${category}`}
                                                type="number"
                                                value={counts.eggs > 0 ? counts.eggs.toString() : ''}
                                                onChange={(e) => handleEggCountChange(category, 'eggs', e.target.value)}
                                                placeholder="0"
                                                className="w-full p-2 text-xl font-bold border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-card text-text-primary"
                                                pattern="[0-9]*"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right text-text-secondary mt-2 text-sm h-5 font-medium">
                                        {subTotal > 0 && `Sub-total: ${subTotal.toLocaleString()} eggs`}
                                    </div>
                                </div>
                            );
                            })}
                        </div>

                        {grandTotalEggs > 0 && (
                            <div className="border-t border-border pt-4">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-md font-bold text-text-primary">TOTAL COLLECTED TODAY</span>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-primary">{grandTotalEggs.toLocaleString()} Eggs</p>
                                        <p className="text-text-secondary font-medium">{formatGrandTotal(grandTotalEggs)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                     <div className="bg-card rounded-2xl shadow-md p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <FeedBagIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400"/>
                            <h3 className="text-lg font-semibold text-text-primary">Feed Consumed (kg)</h3>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <button
                                onClick={() => setFeedKg(f => Math.max(0, f - 1))}
                                className="bg-muted rounded-full p-3 text-text-secondary hover:bg-border active:bg-slate-400 transition-colors transform active:scale-90"
                                aria-label="Decrease Feed Consumed"
                            >
                                <MinusIcon className="w-8 h-8" />
                            </button>
                            <div className="flex items-baseline justify-center w-full">
                                <input
                                    type="number"
                                    value={feedKg > 0 ? feedKg.toString() : ''}
                                    onChange={handleNumericInput(setFeedKg)}
                                    placeholder="0"
                                    className="text-6xl font-bold text-center bg-transparent focus:outline-none w-full text-text-primary"
                                    pattern="[0-9]*"
                                />
                                <span className="text-2xl font-semibold text-text-secondary">kg</span>
                            </div>
                            <button
                                onClick={() => setFeedKg(f => f + 1)}
                                className="bg-primary rounded-full p-3 text-white hover:bg-primary-600 active:bg-primary-700 transition-colors transform active:scale-90"
                                aria-label="Increase Feed Consumed"
                            >
                                <PlusIcon className="w-8 h-8" />
                            </button>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border">
                            <label htmlFor="feed-brand" className="block text-sm font-medium text-text-secondary mb-1">Feed Brand / Type</label>
                            <input 
                                id="feed-brand"
                                type="text"
                                value={feedBrand}
                                onChange={(e) => setFeedBrand(e.target.value)}
                                placeholder="e.g., TopFeed Layer Mash"
                                className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-card text-text-primary"
                            />
                        </div>
                    </div>

                    <InputCard
                        icon={<MortalityIcon className="w-8 h-8 text-danger"/>}
                        label="Mortality"
                        value={mortality}
                        onValueChange={setMortality}
                        onIncrement={() => setMortality(c => c + 1)}
                        onDecrement={() => setMortality(c => Math.max(0, c - 1))}
                    >
                        {/* Health Log Trigger within Mortality Card context for Layers */}
                        <div className="mt-4 border-t border-border pt-3">
                             <button 
                                onClick={() => setIsHealthModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 text-danger font-semibold bg-red-50 dark:bg-red-900/20 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                            >
                                <StethoscopeIcon className="w-5 h-5" />
                                Record Health Issue
                            </button>
                        </div>
                    </InputCard>
                    
                    <div className="bg-card rounded-2xl shadow-md p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <NotepadIcon className="w-6 h-6 text-text-secondary" />
                            <h3 className="text-lg font-semibold text-text-primary">Add a Note (Optional)</h3>
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Heat stress caused 2 extra mortalities..."
                            className="w-full h-24 p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-card text-text-primary"
                        />
                    </div>
                </div>

                <div className="fixed bottom-16 left-0 right-0 p-4 bg-card/80 backdrop-blur-sm border-t border-border z-10 lg:static lg:bg-transparent lg:border-0 lg:p-0">
                    <div className="max-w-md mx-auto lg:max-w-2xl">
                        <button
                            onClick={handleSave}
                            disabled={!batch || showConfirmation}
                            className={`w-full text-white font-bold py-4 px-4 rounded-2xl text-lg transition-all duration-300 ease-in-out transform flex items-center justify-center ${
                                showConfirmation 
                                ? 'bg-green-500' 
                                : !batch ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-primary hover:bg-primary-600 active:bg-primary-700 active:scale-95'
                            }`}
                        >
                            {showConfirmation ? (
                                <>
                                    <CheckCircleIcon className="w-6 h-6 mr-2 animate-pulse" />
                                    Saved!
                                </>
                            ) : (
                                'SAVE DAILY LOG'
                            )}
                        </button>
                    </div>
                </div>

                {isModalOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4 animate-fade-in"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <div 
                            className="bg-popover rounded-2xl shadow-lg p-6 w-full max-w-sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-bold mb-4 text-text-primary">Add New Egg Category</h3>
                            <input 
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="e.g., Cracked, Small"
                                className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-card text-text-primary"
                                autoFocus
                            />
                            <div className="flex justify-end gap-3 mt-4">
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-text-primary bg-muted hover:bg-border font-semibold transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveNewCategory}
                                    className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary-600 font-semibold transition"
                                >
                                    Save
                                </button>
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

export default DailyLogScreen;