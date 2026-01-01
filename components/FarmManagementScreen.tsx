
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
                <button onClick={() => onNavigate('settings')} className="p-2 -ml-2 text-text-secondary hover:text-primary">
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
            {deletingFarm && <DeleteFarmModal farm={deletingFarm} onConfirm={handleConfirmDelete} onClose={() => setDeletingFarm(null)} />}
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
                    <button onClick={() => setMenuOpen(!isMenuOpen)} className="p-2 text-text-secondary hover:bg-muted rounded-full">
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
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Location (Optional)</label>
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" />
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

interface DeleteFarmModalProps { farm: Farm; onClose: () => void; onConfirm: () => void; }
const DeleteFarmModal: React.FC<DeleteFarmModalProps> = ({ farm, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-popover rounded-2xl shadow-lg p-6 w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
            <div className="mx-auto bg-red-100 dark:bg-red-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <WarningIcon className="w-6 h-6 text-danger" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-text-primary">Delete Farm?</h3>
            <p className="text-text-secondary text-sm mb-6">This will permanently delete '<span className="font-semibold">{farm.name}</span>' and all of its batches. This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
                <button onClick={onClose} className="px-8 py-2 rounded-lg text-text-primary bg-muted hover:bg-border font-semibold">Cancel</button>
                <button onClick={onConfirm} className="px-8 py-2 rounded-lg text-white bg-danger hover:bg-red-600 font-semibold">DELETE</button>
            </div>
        </div>
    </div>
);

export { FarmManagementScreen };
