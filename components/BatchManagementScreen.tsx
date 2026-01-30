
import React, { useState, useMemo, useEffect } from 'react';
import type { Screen } from '../App';
import { ChevronDownIcon, ChickenIcon, CalendarIcon, FishIcon, EllipsisIcon, PencilIcon, TrashIcon, PlusIcon, StethoscopeIcon, ChevronLeftIcon } from './icons';
import type { Farm } from './FarmManagementScreen';
import BatchHealthSchedule from './BatchHealthSchedule';

export type Sector = 'Layer' | 'Broiler' | 'Fish';
type Role = 'Owner' | 'Manager' | 'Worker';

export type Batch = {
    id: string | number;
    name: string;
    farm: string;
    status: 'Active' | 'Completed';
    stockCount: number;
    age: string;
    sector: Sector;
    scheduleId?: string;
    startDate?: string;
};



interface BatchManagementScreenProps {
    onNavigate: (screen: Screen, params?: Record<string, any>) => void;
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
    farms: Farm[];
    batches: Batch[];
    onSaveBatch: (batch: Batch | Omit<Batch, 'id'>) => void;
    onDeleteBatch: (batchId: string | number) => void;
    activeSector: Sector;
}

const BatchManagementScreen: React.FC<BatchManagementScreenProps> = ({ onNavigate, isModalOpen, setIsModalOpen, farms, batches, onSaveBatch, onDeleteBatch, activeSector }) => {
    const [selectedFarm, setSelectedFarm] = useState("All Farms");
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    const [currentUserRole] = useState<Role>('Owner');

    const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
    const [deletingBatch, setDeletingBatch] = useState<Batch | null>(null);

    const farmOptions = useMemo(() => ["All Farms", ...farms.map(f => f.name)], [farms]);

    const handleSelectFarm = (farm: string) => {
        setSelectedFarm(farm);
        setIsSelectorOpen(false);
    };

    const handleSave = (batchData: Omit<Batch, 'id'>, batchId?: number) => {
        const batchToSave = batchId ? { ...batchData, id: batchId } : batchData;
        onSaveBatch(batchToSave);
        closeForms();
    };

    const handleConfirmDelete = () => {
        if (!deletingBatch) return;
        onDeleteBatch(deletingBatch.id);
        setDeletingBatch(null);
    };

    const closeForms = () => {
        setIsModalOpen(false);
        setEditingBatch(null);
    }

    const filteredBatches = batches.filter(batch => selectedFarm === "All Farms" || batch.farm === selectedFarm);
    const activeBatches = filteredBatches.filter(b => b.status === 'Active');
    const completedBatches = filteredBatches.filter(b => b.status === 'Completed');

    return (
        <div className="bg-background min-h-screen">
            <header className="bg-card p-4 pt-6 shadow-md sticky top-0 z-10">
                <div className="flex items-center">
                    <button onClick={() => onNavigate('settings')} className="p-2 -ml-2 text-text-secondary hover:text-primary rounded-full" aria-label="Go back to settings">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-center flex-grow text-text-primary pr-8">Manage Batches</h1>
                </div>
                <div className="relative mt-2">
                    <button onClick={() => setIsSelectorOpen(!isSelectorOpen)} className="w-full text-left bg-muted p-3 rounded-lg flex justify-between items-center">
                        <span className="font-semibold text-primary">{selectedFarm}</span>
                        <ChevronDownIcon className={`w-5 h-5 transition-transform text-text-secondary ${isSelectorOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isSelectorOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-popover shadow-lg rounded-lg z-20 border border-border">
                            {farmOptions.map(opt => (
                                <div key={opt} onClick={() => handleSelectFarm(opt)} className="p-3 hover:bg-muted cursor-pointer font-semibold text-text-primary">{opt}</div>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            <div className="p-4 space-y-6">
                {/* Explicit Button for Desktop/Fallback - This ensures users always have a way to add a batch */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl text-lg flex items-center justify-center gap-2 hover:bg-primary-600 active:bg-primary-700 transition-colors"
                >
                    <PlusIcon className="w-6 h-6" />
                    START NEW BATCH
                </button>

                <BatchList title="Active Batches" batches={activeBatches} currentUserRole={currentUserRole} onEdit={setEditingBatch} onDelete={setDeletingBatch} />
                <BatchList title="Completed Batches" batches={completedBatches} currentUserRole={currentUserRole} onEdit={setEditingBatch} onDelete={setDeletingBatch} />
            </div>

            {(isModalOpen || editingBatch) && <BatchForm onSave={handleSave} onClose={closeForms} batchToEdit={editingBatch} selectedFarm={selectedFarm} activeSector={activeSector} farms={farms} />}
            {deletingBatch && <DeleteConfirmationModal batch={deletingBatch} onConfirm={handleConfirmDelete} onClose={() => setDeletingBatch(null)} />}
        </div>
    );
};

const BatchList: React.FC<{ title: string; batches: Batch[]; currentUserRole: Role; onEdit: (b: Batch) => void; onDelete: (b: Batch) => void; }> = ({ title, batches, currentUserRole, onEdit, onDelete }) => {
    if (batches.length === 0) {
        return null;
    }
    return (
        <div>
            <h2 className="text-lg font-bold text-text-primary mb-2">{title}</h2>
            <div className="space-y-3">
                {batches.map(batch => (
                    <BatchCard key={batch.id} batch={batch} currentUserRole={currentUserRole} onEdit={onEdit} onDelete={onDelete} />
                ))}
            </div>
        </div>
    );
};

const BatchCard: React.FC<{ batch: Batch; currentUserRole: Role; onEdit: (b: Batch) => void; onDelete: (b: Batch) => void; }> = ({ batch, currentUserRole, onEdit, onDelete }) => {
    const isCompleted = batch.status === 'Completed';
    const [isMenuOpen, setMenuOpen] = useState(false);

    return (
        <div className="bg-card rounded-2xl shadow-md p-4">
            <div className="flex justify-between items-start">
                <div className="flex-grow">
                    <p className="font-bold text-text-primary">{batch.name}</p>
                    <p className="text-sm text-text-secondary">{batch.farm}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full ${isCompleted ? 'bg-muted text-text-secondary' : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'}`}>
                        <span className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-text-secondary' : 'bg-green-500'}`}></span>
                        {batch.status}
                    </div>
                    {currentUserRole === 'Owner' && (
                        <div className="relative">
                            <button onClick={() => setMenuOpen(true)} className="p-1 text-text-secondary hover:bg-muted rounded-full" aria-label="Open menu">
                                <EllipsisIcon className="w-5 h-5" />
                            </button>
                            {isMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)}></div>
                                    <div className="absolute right-0 mt-2 w-40 bg-popover rounded-md shadow-lg z-20 border border-border" onMouseLeave={() => setMenuOpen(false)}>
                                        <button onClick={() => { onEdit(batch); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-muted flex items-center gap-2">
                                            <PencilIcon className="w-4 h-4" /> Edit Batch
                                        </button>
                                        <button onClick={() => { onDelete(batch); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-500/10 flex items-center gap-2">
                                            <TrashIcon className="w-4 h-4" /> Delete Batch
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-4 flex items-center justify-start gap-6 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                    {batch.sector === 'Fish' ? <FishIcon className="w-5 h-5" /> : <ChickenIcon className="w-5 h-5" />}
                    <span>{batch.stockCount.toLocaleString()} {batch.sector === 'Fish' ? 'fish' : 'birds'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    <span>{batch.age} old</span>
                </div>
            </div>
        </div>
    );
};

interface BatchFormProps {
    onSave: (batchData: Omit<Batch, 'id'>, batchId?: string | number) => void;
    onClose: () => void;
    batchToEdit?: Batch | null;
    selectedFarm: string;
    activeSector: Sector;
    farms: { id: string | number; name: string }[];
}

const BatchForm: React.FC<BatchFormProps> = ({ onSave, onClose, batchToEdit, selectedFarm, activeSector, farms }) => {
    const isEditing = !!batchToEdit;
    const [sector, setSector] = useState<Sector>(batchToEdit?.sector || activeSector);
    const [name, setName] = useState(batchToEdit?.name || '');
    // For new batches, auto-select if only one farm exists
    const [farmName, setFarmName] = useState(() => {
        if (batchToEdit?.farm) return batchToEdit.farm;
        if (selectedFarm !== "All Farms") return selectedFarm;
        // Auto-select if only one farm
        if (farms.length === 1) return farms[0].name;
        return '';
    });
    const [startDate, setStartDate] = useState(batchToEdit?.startDate || new Date().toISOString().split('T')[0]);
    const [stockCount, setStockCount] = useState<number>(batchToEdit?.stockCount || 0);
    const [totalCost, setTotalCost] = useState<number>(0);
    const [stockAge, setStockAge] = useState(batchToEdit?.age || '');
    const [notes, setNotes] = useState('');
    const [showHealthSchedule, setShowHealthSchedule] = useState(isEditing);

    useEffect(() => {
        if (!isEditing) {
            setSector(activeSector);
        }
    }, [activeSector, isEditing]);

    const handleNumericChange = (setter: React.Dispatch<React.SetStateAction<number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value === '' ? 0 : parseInt(e.target.value, 10));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!sector) {
            alert("Please select a sector (Layer, Broiler, or Fish).");
            return;
        }
        if (!name.trim()) {
            alert("Please enter a batch name.");
            return;
        }
        if (!isEditing && !farmName) {
            alert("Please select a farm for this batch.");
            return;
        }
        if (stockCount <= 0) {
            alert("Please enter the number of stock.");
            return;
        }
        if (!isEditing && totalCost <= 0) {
            alert("Please enter the total cost of stock.");
            return;
        }

        onSave({
            name: name.trim(),
            farm: batchToEdit?.farm || farmName,
            sector,
            stockCount,
            status: batchToEdit?.status || 'Active',
            age: stockAge || '1 day',
            startDate: startDate || undefined
        }, batchToEdit?.id);
    };

    const SectorTab: React.FC<{ value: Sector; label: string }> = ({ value, label }) => (
        <button
            type="button"
            onClick={() => setSector(value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${sector === value
                ? 'bg-primary text-white shadow-md'
                : 'bg-muted text-text-secondary hover:bg-border'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-start justify-center p-2 pb-20 overflow-y-auto" onClick={onClose}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md flex flex-col mt-2 border border-border max-h-[calc(100vh-5rem)]" onClick={e => e.stopPropagation()}>
                {/* Header with Sector Tabs */}
                <div className="p-3 border-b border-border flex-shrink-0">
                    <div className="flex items-center justify-center gap-2">
                        <SectorTab value="Layer" label="Layers" />
                        <SectorTab value="Broiler" label="Broilers" />
                        <SectorTab value="Fish" label="Fish" />
                    </div>
                </div>

                {/* Scrollable Form Content */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                    <div className="flex-grow overflow-y-auto p-3 space-y-3">
                        {/* Farm Selection (only for new batches with multiple farms) */}
                        {!isEditing && farms.length > 1 && (
                            <div>
                                <label htmlFor="farm-select" className="block text-sm font-medium text-text-secondary mb-1">Farm *</label>
                                <select
                                    id="farm-select"
                                    value={farmName}
                                    onChange={(e) => setFarmName(e.target.value)}
                                    className="w-full p-2 border border-border rounded-lg bg-input text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                    aria-label="Select farm"
                                >
                                    <option value="">Select a farm...</option>
                                    {farms.map(farm => (
                                        <option key={farm.id} value={farm.name}>{farm.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {/* Show farm name as text when only one farm */}
                        {!isEditing && farms.length === 1 && (
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Farm</label>
                                <div className="w-full p-2 border border-border rounded-lg bg-muted text-text-primary">
                                    {farms[0].name}
                                </div>
                            </div>
                        )}

                        {/* Batch Name */}
                        <div>
                            <label htmlFor="batch-name" className="block text-sm font-medium text-text-secondary mb-1">Batch Name *</label>
                            <input
                                id="batch-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={`e.g., Jan 2026 ${sector}s - Pen 1`}
                                className="w-full p-2 border border-border rounded-lg bg-input text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Start Date */}
                        <div>
                            <label htmlFor="start-date" className="block text-sm font-medium text-text-secondary mb-1">
                                {isEditing ? 'Start Date' : 'Date of Arrival'}
                            </label>
                            <input
                                id="start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full p-2 border border-border rounded-lg bg-input text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                                aria-label="Start Date"
                            />
                        </div>

                        {/* Two-column layout for Quantity and Cost */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">
                                    Quantity ({sector === 'Fish' ? 'Fish' : 'Birds'}) *
                                </label>
                                <input
                                    type="number"
                                    value={stockCount > 0 ? stockCount : ''}
                                    onChange={handleNumericChange(setStockCount)}
                                    placeholder="500"
                                    className="w-full p-2 border border-border rounded-lg bg-input text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>
                            {!isEditing && (
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Total Cost (₦) *</label>
                                    <input
                                        type="number"
                                        value={totalCost > 0 ? totalCost : ''}
                                        onChange={handleNumericChange(setTotalCost)}
                                        placeholder="150000"
                                        className="w-full p-2 border border-border rounded-lg bg-input text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        {/* Age */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Age (Weeks)</label>
                            <input
                                type="text"
                                value={stockAge}
                                onChange={(e) => setStockAge(e.target.value)}
                                placeholder={sector === 'Fish' ? 'Fingerlings' : 'Day-Old'}
                                className="w-full p-2 border border-border rounded-lg bg-input text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Summary/Notes */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Summary/Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Vaccination done, feed changed to starter."
                                rows={2}
                                className="w-full p-2 border border-border rounded-lg bg-input text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                            />
                        </div>

                        {/* Health Schedule Display - Only when editing a batch */}
                        {isEditing && batchToEdit && (
                            <div>
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-semibold text-text-secondary">Health Schedule</label>
                                    <label htmlFor="health-schedule-toggle" className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input type="checkbox" id="health-schedule-toggle" className="sr-only" checked={showHealthSchedule} onChange={() => setShowHealthSchedule(!showHealthSchedule)} aria-label="Toggle Health Schedule" />
                                            <div className="block bg-muted w-12 h-7 rounded-full"></div>
                                            <div className={`dot absolute left-1 top-1 w-5 h-5 rounded-full transition-transform ${showHealthSchedule ? 'translate-x-full bg-primary' : 'bg-white dark:bg-slate-400'}`}></div>
                                        </div>
                                    </label>
                                </div>
                                {showHealthSchedule && (
                                    <div className="mt-3 p-4 bg-muted rounded-lg animate-fade-in">
                                        <BatchHealthSchedule
                                            batchId={String(batchToEdit.id)}
                                            batchStartDate={batchToEdit.startDate || null}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Save Button - Always Visible */}
                    <div className="p-3 border-t border-border bg-card flex-shrink-0">
                        <button
                            type="submit"
                            className="w-full text-white font-bold py-3 px-6 rounded-xl bg-primary hover:bg-green-600 active:scale-[0.98] transition-all text-lg shadow-lg"
                        >
                            SAVE BATCH
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface DeleteConfirmationModalProps { batch: Batch; onClose: () => void; onConfirm: () => void; }
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ batch, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-popover rounded-2xl shadow-lg p-6 w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-2 text-text-primary">Are you sure?</h3>
                <p className="text-text-secondary text-sm mb-6">This will permanently delete '<span className="font-semibold">{batch.name}</span>' and all of its associated data. This action cannot be undone.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onClose} className="px-8 py-2 rounded-lg text-text-primary bg-muted hover:bg-border font-semibold">Cancel</button>
                    <button onClick={onConfirm} className="px-8 py-2 rounded-lg text-white bg-danger hover:bg-red-600 font-semibold">DELETE</button>
                </div>
            </div>
        </div>
    );
};

export default BatchManagementScreen;
