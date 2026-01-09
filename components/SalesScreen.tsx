
import React, { useState, useMemo } from 'react';
import type { Screen } from '../App';
import { PencilIcon, TrashIcon, SalesIcon, PlusIcon, ChevronLeftIcon } from './icons';
import type { Sector } from './BatchManagementScreen';
import { useSales, Sale } from '../contexts/SalesContext';

interface SalesScreenProps {
    onNavigate: (screen: Screen) => void;
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
    activeSector: Sector;
}

const SalesScreen: React.FC<SalesScreenProps> = ({ onNavigate, isModalOpen, setIsModalOpen, activeSector }) => {
    const { sales, addSale, updateSale, deleteSale } = useSales();
    const [editingSale, setEditingSale] = useState<Sale | null>(null);

    const filteredSales = useMemo(() => {
        return sales.filter(s => s.sector === activeSector);
    }, [sales, activeSector]);

    const handleOpenModal = (sale: Sale | null = null) => {
        setEditingSale(sale);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingSale(null);
        setIsModalOpen(false);
    };

    const handleSaveSale = (saleData: Omit<Sale, 'id'>) => {
        if (editingSale) {
            updateSale({ ...saleData, id: editingSale.id });
        } else {
            addSale(saleData);
        }
        handleCloseModal();
    };

    const { totalRevenue, totalItemsSold } = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentSales = filteredSales.filter(sale => new Date(sale.date + 'T00:00:00') >= thirtyDaysAgo);
        const revenue = recentSales.reduce((sum, sale) => sum + sale.amount, 0);
        const items = recentSales.reduce((sum, sale) => sum + sale.quantity, 0);
        return { totalRevenue: revenue, totalItemsSold: items };
    }, [filteredSales]);

    if (sales.length === 0) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center p-6 relative">
                <button onClick={() => onNavigate('business')} className="absolute top-6 left-4 p-2 text-text-secondary hover:text-primary rounded-full z-10" aria-label="Go back">
                    <ChevronLeftIcon className="w-8 h-8" />
                </button>
                <div className="bg-card rounded-3xl shadow-xl p-10 w-full max-w-md text-center border border-border">
                    <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <SalesIcon className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-text-primary mb-3">Track Every Sale, Know Your Revenue.</h1>
                    <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                        Log your sales of eggs, birds, fish, and more to see your income grow in real-time.
                    </p>
                    <button
                        onClick={() => handleOpenModal()}
                        className="w-full bg-primary text-white font-bold py-4 px-6 rounded-2xl text-xl flex items-center justify-center gap-3 hover:bg-primary-600 active:scale-95 transition-all shadow-lg"
                    >
                        <PlusIcon className="w-6 h-6" />
                        Record Sale
                    </button>
                    {isModalOpen && (
                        <AddSaleForm
                            sale={editingSale}
                            onSave={handleSaveSale}
                            onClose={handleCloseModal}
                            activeSector={activeSector}
                        />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen">
            <header className="bg-card p-4 pt-6 shadow-md sticky top-0 z-10">
                <div className="flex items-center">
                    <button onClick={() => onNavigate('business')} className="p-2 -ml-2 text-text-secondary hover:text-primary rounded-full" aria-label="Go back to business hub">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-center flex-grow text-text-primary pr-8 leading-tight">Income & Sales ({activeSector})</h1>
                </div>
                <p className="text-center text-sm text-text-secondary mt-1">
                    Showing all sales data for your {activeSector} operations.
                </p>
            </header>

            <div className="p-4 space-y-4">
                <div className="bg-card p-4 rounded-2xl shadow-md grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <p className="text-xs text-text-secondary font-bold">REVENUE (30D)</p>
                        <p className="text-2xl font-bold text-primary">
                            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(totalRevenue)}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-text-secondary font-bold">ITEMS SOLD (30D)</p>
                        <p className="text-2xl font-bold text-primary">{totalItemsSold.toLocaleString()}</p>
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="text-lg font-bold text-text-primary">Recent Transactions</h3>
                        <button
                            onClick={() => handleOpenModal()}
                            className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
                        >
                            <PlusIcon className="w-4 h-4" /> Add New
                        </button>
                    </div>
                    {filteredSales.length === 0 ? (
                        <div className="text-center py-10 text-text-secondary bg-card rounded-2xl border border-dashed border-border">
                            <p>No transactions recorded for this sector.</p>
                        </div>
                    ) : (
                        filteredSales.map(sale => (
                            <div key={sale.id} className="bg-card rounded-2xl shadow-md p-4 flex justify-between items-start">
                                <div className="flex-grow">
                                    <p className="text-sm text-text-secondary">{new Date(sale.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    <p className="font-bold text-text-primary mt-1">{sale.quantity.toLocaleString()} {sale.unit} of {sale.item}</p>
                                    {sale.notes && <p className="text-xs text-text-secondary italic mt-1">"{sale.notes}"</p>}
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                        + {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(sale.amount)}
                                    </p>
                                    <div className="flex gap-4 justify-end mt-2">
                                        <button onClick={() => handleOpenModal(sale)} aria-label={`Edit sale of ${sale.item}`}>
                                            <PencilIcon className="w-5 h-5 text-text-secondary hover:text-primary transition-colors" />
                                        </button>
                                        <button onClick={() => deleteSale(sale.id)} aria-label={`Delete sale of ${sale.item}`}>
                                            <TrashIcon className="w-5 h-5 text-text-secondary hover:text-danger transition-colors" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {isModalOpen && <AddSaleForm sale={editingSale} onSave={handleSaveSale} onClose={handleCloseModal} activeSector={activeSector} />}
        </div>
    );
};

interface AddSaleFormProps {
    sale: Sale | null;
    onSave: (sale: Omit<Sale, 'id'>) => void;
    onClose: () => void;
    activeSector: Sector;
}

const AddSaleForm: React.FC<AddSaleFormProps> = ({ sale, onSave, onClose, activeSector }) => {
    const getDefaultUnit = () => {
        switch (activeSector) {
            case 'Layer': return 'Crates';
            case 'Broiler': return 'Birds';
            case 'Fish': return 'kg';
            default: return '';
        }
    };

    const getPlaceholder = () => {
        switch (activeSector) {
            case 'Layer': return 'e.g., Large Eggs';
            case 'Broiler': return 'e.g., Live Birds';
            case 'Fish': return 'e.g., Live Tilapia';
            default: return 'e.g., Item Name';
        }
    };

    const [formData, setFormData] = useState<Omit<Sale, 'id'>>({
        date: sale?.date || new Date().toISOString().split('T')[0],
        item: sale?.item || '',
        quantity: sale?.quantity || 0,
        unit: sale?.unit || getDefaultUnit(),
        amount: sale?.amount || 0,
        sector: sale?.sector || activeSector,
        notes: sale?.notes || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumericField = ['quantity', 'amount'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumericField ? (value === '' ? 0 : parseFloat(value)) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-start sm:items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-popover rounded-2xl shadow-lg w-full max-w-sm flex flex-col max-h-[85vh] mt-10 sm:mt-0 animate-fade-in" onClick={e => e.stopPropagation()}>
                {/* Fixed Header */}
                <div className="p-6 pb-2 flex-shrink-0">
                    <h3 className="text-lg font-bold text-text-primary">{sale ? 'Edit Sale' : 'Record a New Sale'}</h3>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                    {/* Scrollable Content Area */}
                    <div className="flex-grow overflow-y-auto p-6 pt-2 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Date of Sale</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Item Sold</label>
                            <input type="text" name="item" value={formData.item} onChange={handleChange} placeholder={getPlaceholder()} className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Quantity</label>
                                <input type="number" name="quantity" value={formData.quantity > 0 ? formData.quantity : ''} onChange={handleChange} placeholder="0" className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Unit</label>
                                <input type="text" name="unit" value={formData.unit} onChange={handleChange} placeholder={`e.g., ${getDefaultUnit()}`} className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Total Sale Amount (₦)</label>
                            <input type="number" name="amount" value={formData.amount > 0 ? formData.amount : ''} onChange={handleChange} placeholder="0" className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Notes (Optional)</label>
                            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="e.g., Sold to Mama B's Shop" className="w-full p-3 border border-border rounded-lg h-20 bg-card text-text-primary" />
                        </div>
                    </div>

                    {/* Fixed Footer */}
                    <div className="p-6 pt-4 border-t border-border flex justify-end gap-3 flex-shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-text-primary bg-muted hover:bg-border font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary-600 font-semibold">Save Sale</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SalesScreen;
