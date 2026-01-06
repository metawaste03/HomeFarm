
import React, { useState } from 'react';
import { Screen } from '../App';
import { PlusIcon, ChevronLeftIcon, EllipsisIcon, PencilIcon, TrashIcon, WarningIcon } from './icons';
import { Batch } from './BatchManagementScreen';

export type Farm = {
    id: string | number;
    name: string;
    location?: string;
};

interface FarmManagementScreenProps {
    onNavigate: (screen: Screen) => void;
    farms: Farm[];
    batches: Batch[];
    onSaveFarm: (farm: Farm | Omit<Farm, 'id'>) => void;
    onDeleteFarm: (farmId: string | number) => void;
}

const FarmManagementScreen: React.FC<FarmManagementScreenProps> = ({ onNavigate, farms, batches, onSaveFarm, onDeleteFarm }) => {
    const [isFormOpen, setFormOpen] = useState(false);
    const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
    const [deletingFarm, setDeletingFarm] = useState<Farm | null>(null);

    const handleOpenForm = (farm: Farm | null = null) => {
        setEditingFarm(farm);
        setFormOpen(true);
    };

    const handleSaveFarm = (farmData: Omit<Farm, 'id'> | Farm) => {
        onSaveFarm(farmData);
        setFormOpen(false);
        setEditingFarm(null);
    };

    const handleConfirmDelete = () => {
        if (!deletingFarm) return;
        onDeleteFarm(deletingFarm.id);
        setDeletingFarm(null);
    };

    return (
        <div className="bg-background min-h-screen">
            <header className="bg-card p-4 pt-6 shadow-md sticky top-0 z-10 flex items-center">
                <button onClick={() => onNavigate('settings')} className="p-2 -ml-2 text-text-secondary hover:text-primary" aria-label="Go back to settings">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-center flex-grow text-text-primary">My Farms</h1>
                <div className="w-6"></div>
            </header>

            <div className="p-4 space-y-4">
                <button
                    onClick={() => handleOpenForm()}
                    className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl text-lg flex items-center justify-center gap-2 hover:bg-primary-600 active:bg-primary-700 transition-colors"
                >
                    <PlusIcon className="w-6 h-6" />
                    ADD A NEW FARM
                </button>

                <div className="space-y-3">
                    {farms.map(farm => (
                        <FarmCard
                            key={farm.id}
                            farm={farm}
                            batchCount={batches.filter(b => b.farm === farm.name && b.status === 'Active').length}
                            onEdit={() => handleOpenForm(farm)}
                            onDelete={() => setDeletingFarm(farm)}
                        />
                    ))}
                </div>
            </div>

            {isFormOpen && <FarmFormModal farmToEdit={editingFarm} onSave={handleSaveFarm} onClose={() => setFormOpen(false)} />}
            {deletingFarm && <DeleteFarmModal farm={deletingFarm} batches={batches} onConfirm={handleConfirmDelete} onClose={() => setDeletingFarm(null)} />}
        </div>
    );
};

const FarmCard: React.FC<{ farm: Farm, batchCount: number, onEdit: () => void, onDelete: () => void }> = ({ farm, batchCount, onEdit, onDelete }) => {
    const [isMenuOpen, setMenuOpen] = useState(false);

    return (
        <div className="bg-card rounded-2xl shadow-md p-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-lg text-text-primary">{farm.name}</p>
                    {farm.location && <p className="text-sm text-text-secondary mt-1">{farm.location}</p>}
                </div>
                <div className="relative">
                    <button onClick={() => setMenuOpen(!isMenuOpen)} className="p-2 text-text-secondary hover:bg-muted rounded-full" aria-label="Farm options menu">
                        <EllipsisIcon className="w-6 h-6" />
                    </button>
                    {isMenuOpen && (
                        <div
                            className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg z-20 border border-border"
                            onMouseLeave={() => setMenuOpen(false)}
                        >
                            <button className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-muted flex items-center gap-2" onClick={() => { onEdit(); setMenuOpen(false); }}>
                                <PencilIcon className="w-4 h-4" /> Edit Farm Details
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-500/10 flex items-center gap-2" onClick={() => { onDelete(); setMenuOpen(false); }}>
                                <TrashIcon className="w-4 h-4" /> Delete Farm
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-4 border-t border-border pt-3">
                <p className="text-sm text-text-secondary font-medium">{batchCount} active batch{batchCount !== 1 ? 'es' : ''}</p>
            </div>
        </div>
    );
};

interface FarmFormModalProps {
    farmToEdit: Farm | null;
    onSave: (farmData: Omit<Farm, 'id'> | Farm) => void;
    onClose: () => void;
}

const FarmFormModal: React.FC<FarmFormModalProps> = ({ farmToEdit, onSave, onClose }) => {
    const [name, setName] = useState(farmToEdit?.name || '');
    const [location, setLocation] = useState(farmToEdit?.location || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return alert('Farm name is required.');
        const farmData = { name, location };
        const dataToSave = farmToEdit ? { ...farmData, id: farmToEdit.id } : farmData;
        onSave(dataToSave);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-popover rounded-2xl shadow-lg p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4 text-text-primary">{farmToEdit ? 'Edit Farm' : 'Add New Farm'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Farm Name *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter farm name" className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Location (Optional)</label>
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Enter location" className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" />
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-text-primary bg-muted hover:bg-border font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary-600 font-semibold">Save Farm</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface DeleteFarmModalProps {
    farm: Farm;
    batches: Batch[];
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteFarmModal: React.FC<DeleteFarmModalProps> = ({ farm, batches, onClose, onConfirm }) => {
    const [countdown, setCountdown] = React.useState(5);
    const [isDeleting, setIsDeleting] = React.useState(false);

    // Count related data that will be deleted
    const relatedBatches = batches.filter(b => b.farm === farm.name);
    const activeBatchCount = relatedBatches.filter(b => b.status === 'Active').length;
    const totalBatchCount = relatedBatches.length;

    // Countdown timer
    React.useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-start justify-center pt-16 sm:pt-24 p-4" onClick={onClose}>
            <div className="bg-popover rounded-2xl shadow-lg p-4 sm:p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                {/* Warning Icon - smaller on mobile */}
                <div className="mx-auto bg-red-100 dark:bg-red-900/30 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-3">
                    <WarningIcon className="w-6 h-6 sm:w-7 sm:h-7 text-danger" />
                </div>

                {/* Title & Farm Name Combined */}
                <h3 className="text-lg font-bold text-text-primary text-center mb-1">Delete Farm?</h3>
                <p className="text-center mb-3">
                    <span className="font-bold text-danger">"{farm.name}"</span>
                </p>

                {/* Compact Cascading Warning */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
                    <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">⚠️ This will permanently delete:</p>
                    <p className="text-xs text-red-600 dark:text-red-300">
                        Farm settings{totalBatchCount > 0 ? `, ${totalBatchCount} batch${totalBatchCount !== 1 ? 'es' : ''}` : ''}, all logs, sales & tasks
                    </p>
                </div>

                <p className="text-xs text-text-secondary text-center mb-3">
                    This action <span className="font-bold">cannot be undone</span>.
                </p>

                {/* Compact Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl text-text-primary bg-muted hover:bg-border font-semibold transition-colors text-sm"
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={countdown > 0 || isDeleting}
                        className={`flex-1 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-1 text-sm ${countdown > 0
                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-danger hover:bg-red-600 text-white'
                            }`}
                    >
                        {isDeleting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : countdown > 0 ? (
                            <>DELETE ({countdown})</>
                        ) : (
                            'DELETE'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export { FarmManagementScreen };
