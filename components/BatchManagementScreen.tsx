
import React, { useState, useMemo, useEffect } from 'react';
import type { Screen } from '../App';
import { ChevronDownIcon, ChickenIcon, CalendarIcon, FishIcon, EllipsisIcon, PencilIcon, TrashIcon, PlusIcon, StethoscopeIcon, ChevronLeftIcon } from './icons';
import type { Farm } from './FarmManagementScreen';

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
};

export type HealthScheduleTemplate = {
    id: string;
    name: string;
    sector: Sector;
    description: string;
};

const MOCK_SCHEDULES: HealthScheduleTemplate[] = [
    { id: 'sched_1', name: 'Standard Broiler Cycle (6 Weeks)', sector: 'Broiler', description: 'Includes Gumboro, Lasota, and Coccidiosis treatments.' },
    { id: 'sched_2', name: 'Extended Broiler Cycle (8 Weeks)', sector: 'Broiler', description: 'For heavier birds, includes additional boosters.' },
    { id: 'sched_3', name: 'Layer Pullet Rearing', sector: 'Layer', description: 'Comprehensive vaccination from Day 1 to Point of Lay.' },
    { id: 'sched_4', name: 'Layer Production Phase', sector: 'Layer', description: 'Monthly boosters and deworming schedule.' },
    { id: 'sched_5', name: 'Tilapia Growth Plan', sector: 'Fish', description: 'Water treatment and probiotic schedule.' },
    { id: 'sched_6', name: 'Catfish Intensive Care', sector: 'Fish', description: 'Antibiotic prophylaxis and water quality management.' },
];

interface BatchManagementScreenProps {
    onNavigate: (screen: Screen) => void;
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

            {(isModalOpen || editingBatch) && <BatchForm onSave={handleSave} onClose={closeForms} batchToEdit={editingBatch} selectedFarm={selectedFarm} activeSector={activeSector} />}
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
                            <button onClick={() => setMenuOpen(true)} className="p-1 text-text-secondary hover:bg-muted rounded-full">
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
            {batch.scheduleId && (
                <div className="mt-3 text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
                    <StethoscopeIcon className="w-3 h-3" />
                    <span>Health Schedule Active</span>
                </div>
            )}
        </div>
    );
};

interface BatchFormProps {
    onSave: (batchData: Omit<Batch, 'id'>, batchId?: string | number) => void;
    onClose: () => void;
    batchToEdit?: Batch | null;
    selectedFarm: string;
    activeSector: Sector;
}

const BatchForm: React.FC<BatchFormProps> = ({ onSave, onClose, batchToEdit, selectedFarm, activeSector }) => {
    const isEditing = !!batchToEdit;
    const [sector, setSector] = useState<Sector | null>(batchToEdit?.sector || activeSector);
    const [name, setName] = useState(batchToEdit?.name || '');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [stockCount, setStockCount] = useState<number>(batchToEdit?.stockCount || 0);
    const [stockCost, setStockCost] = useState<number>(0);
    const [stockAge, setStockAge] = useState(batchToEdit?.age || '');
    const [addFeed, setAddFeed] = useState(false);
    const [feedBrand, setFeedBrand] = useState('');
    const [feedQuantity, setFeedQuantity] = useState<number>(0);
    const [scheduleId, setScheduleId] = useState<string>(batchToEdit?.scheduleId || '');

    // Collapsible section states - keep form shorter
    const [showDetails, setShowDetails] = useState(true);
    const [showCostAge, setShowCostAge] = useState(false);

    useEffect(() => {
        if (!isEditing) {
            setSector(activeSector);
            // Reset schedule when switching context if not editing
            setScheduleId('');
        }
    }, [activeSector, isEditing]);

    // Reset schedule selection if sector changes manually in form
    useEffect(() => {
        if (!isEditing) {
            setScheduleId('');
        }
    }, [sector]);

    const handleNumericChange = (setter: React.Dispatch<React.SetStateAction<number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value === '' ? 0 : parseInt(e.target.value, 10));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!sector || !name || stockCount <= 0) { alert("Please fill in all required fields: Sector, Name, and Number of Stock."); return; }
        if (!isEditing && stockCost <= 0) { alert("Please fill in the Total Cost of Stock."); return; }
        onSave({
            name,
            farm: batchToEdit?.farm || selectedFarm,
            sector,
            stockCount,
            status: batchToEdit?.status || 'Active',
            age: stockAge || batchToEdit?.age || '1 day',
            scheduleId: scheduleId || undefined
        }, batchToEdit?.id);
    };

    const availableSchedules = MOCK_SCHEDULES.filter(s => s.sector === sector);

    const SectorCard: React.FC<{ value: Sector; label: string }> = ({ value, label }) => (
        <button type="button" onClick={() => setSector(value)} className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl w-full transition-all ${sector === value ? 'border-primary bg-green-50 dark:bg-green-900/20 shadow-md' : 'border-border bg-card hover:border-gray-400 dark:hover:border-gray-500'}`}>
            <span className={`font-bold text-lg ${sector === value ? 'text-primary' : 'text-text-primary'}`}>{label}</span>
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-start sm:items-center justify-center p-4 sm:p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-popover rounded-2xl shadow-lg w-full sm:max-w-md max-h-[85vh] flex flex-col mt-4 sm:mt-0" onClick={e => e.stopPropagation()}>
                {/* Fixed Header */}
                <div className="p-4 border-b border-border flex-shrink-0">
                    <h3 className="text-xl font-bold text-center text-text-primary">{isEditing ? 'Edit Batch' : 'Start a New Batch'}</h3>
                </div>

                {/* Scrollable Form Content */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                    <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4">
                        {/* Sector selection - no header, just the cards */}
                        <div className="grid grid-cols-3 gap-3">
                            <SectorCard value="Layer" label="Layer" />
                            <SectorCard value="Broiler" label="Broiler" />
                            <SectorCard value="Fish" label="Fish" />
                        </div>

                        {/* Section 2: Batch Details - Toggle switch style */}
                        <div>
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-semibold text-text-secondary">Batch Details *</label>
                                <label htmlFor="details-toggle" className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input type="checkbox" id="details-toggle" className="sr-only" checked={showDetails} onChange={() => setShowDetails(!showDetails)} />
                                        <div className="block bg-muted w-12 h-7 rounded-full"></div>
                                        <div className={`dot absolute left-1 top-1 w-5 h-5 rounded-full transition-transform ${showDetails ? 'translate-x-full bg-primary' : 'bg-white dark:bg-slate-400'}`}></div>
                                    </div>
                                </label>
                            </div>
                            {showDetails && (
                                <div className="mt-3 space-y-3 p-3 bg-muted rounded-lg animate-fade-in">
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={`Batch Name (e.g., ${sector} Batch)`} className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" required />
                                    {!isEditing && (
                                        <div>
                                            <label htmlFor="start-date" className="text-xs text-text-secondary">Date of Arrival</label>
                                            <input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" />
                                        </div>
                                    )}
                                    <input type="number" value={stockCount > 0 ? stockCount : ''} onChange={handleNumericChange(setStockCount)} placeholder={`Number of ${sector === 'Fish' ? 'Fish' : 'Birds'} *`} className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" required />
                                </div>
                            )}
                        </div>

                        {/* Section 3: Cost & Age - Toggle switch style (only for new batches) */}
                        {!isEditing && (
                            <div>
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-semibold text-text-secondary">Stock Cost & Age *</label>
                                    <label htmlFor="cost-toggle" className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input type="checkbox" id="cost-toggle" className="sr-only" checked={showCostAge} onChange={() => setShowCostAge(!showCostAge)} />
                                            <div className="block bg-muted w-12 h-7 rounded-full"></div>
                                            <div className={`dot absolute left-1 top-1 w-5 h-5 rounded-full transition-transform ${showCostAge ? 'translate-x-full bg-primary' : 'bg-white dark:bg-slate-400'}`}></div>
                                        </div>
                                    </label>
                                </div>
                                {showCostAge && (
                                    <div className="mt-3 space-y-3 p-3 bg-muted rounded-lg animate-fade-in">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">₦</span>
                                            <input type="number" value={stockCost > 0 ? stockCost : ''} onChange={handleNumericChange(setStockCost)} placeholder="Total Cost of Stock *" className="w-full p-3 pl-8 border border-border rounded-lg bg-card text-text-primary" required />
                                        </div>
                                        <input type="text" value={stockAge} onChange={(e) => setStockAge(e.target.value)} placeholder={`Age (e.g., ${sector === 'Fish' ? 'Fingerlings' : 'Day-Old'})`} className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" />
                                    </div>
                                )}
                            </div>
                        )}
                        {!isEditing && (
                            <div>
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-semibold text-text-secondary">4. Add Starting Feed Inventory? (Optional)</label>
                                    <label htmlFor="feed-toggle" className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input type="checkbox" id="feed-toggle" className="sr-only" checked={addFeed} onChange={() => setAddFeed(!addFeed)} />
                                            <div className="block bg-muted w-12 h-7 rounded-full"></div>
                                            <div className={`dot absolute left-1 top-1 bg-white dark:bg-slate-400 w-5 h-5 rounded-full transition-transform ${addFeed ? 'translate-x-full bg-primary' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>
                                {addFeed && (
                                    <div className="mt-3 space-y-3 p-3 bg-muted rounded-lg animate-fade-in">
                                        <input type="text" value={feedBrand} onChange={(e) => setFeedBrand(e.target.value)} placeholder="Feed Brand / Type" className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" />
                                        <input type="number" value={feedQuantity > 0 ? feedQuantity : ''} onChange={handleNumericChange(setFeedQuantity)} placeholder="Quantity on Hand (Bags/kg)" className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" />
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-text-secondary mb-2">5. Health Schedule (Optional)</label>
                            <div className="relative">
                                <select
                                    value={scheduleId}
                                    onChange={(e) => setScheduleId(e.target.value)}
                                    className="w-full p-3 border border-border rounded-lg bg-card text-text-primary appearance-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                                >
                                    <option value="">No Schedule (None)</option>
                                    {availableSchedules.map(schedule => (
                                        <option key={schedule.id} value={schedule.id}>{schedule.name}</option>
                                    ))}
                                </select>
                                <ChevronDownIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary" />
                            </div>
                            {scheduleId && (
                                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-text-secondary animate-fade-in">
                                    <span className="font-bold text-primary block mb-1">Schedule Details:</span>
                                    {availableSchedules.find(s => s.id === scheduleId)?.description}
                                </div>
                            )}
                        </div>
                    </div>
                </form>

                {/* Sticky Footer - Always Visible */}
                <div className="p-4 border-t border-border bg-popover sticky bottom-0 z-10 flex gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl text-text-primary bg-danger hover:bg-red-600 font-bold">Cancel</button>
                    <button onClick={handleSubmit} className="flex-grow text-white font-bold py-3 px-4 rounded-xl bg-primary hover:bg-primary-600 active:scale-95 transition-all">Submit</button>
                </div>
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
