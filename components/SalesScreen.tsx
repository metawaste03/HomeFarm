
import React, { useState, useMemo, useEffect } from 'react';
// Fix: Use `import type` for type-only imports to prevent circular dependency issues.
import type { Screen } from '../App';
import { PencilIcon, TrashIcon } from './icons';
import type { Batch, Sector } from './BatchManagementScreen';


interface SalesScreenProps {
    onNavigate: (screen: Screen) => void;
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
    activeSector: Sector;
}

type Sale = {
    id: number;
    date: string;
    item: string;
    quantity: number;
    unit: string;
    amount: number;
    notes?: string;
};

const MOCK_SALES_DATA: Record<Sector, Sale[]> = {
    Layer: [
        { id: 1, date: '2025-11-17', item: 'Large Eggs', quantity: 15, unit: 'Crates', amount: 112500, notes: 'Sold to Mama B\'s Shop' },
        { id: 2, date: '2025-11-16', item: 'Culled Hens', quantity: 25, unit: 'Birds', amount: 75000 },
        { id: 3, date: '2025-11-16', item: 'Medium Eggs', quantity: 10, unit: 'Crates', amount: 70000, notes: 'Paid via bank transfer' },
        { id: 4, date: '2025-11-15', item: 'Jumbo Eggs', quantity: 5, unit: 'Crates', amount: 40000 },
    ],
    Broiler: [
        { id: 1, date: '2025-11-17', item: 'Live Broilers', quantity: 200, unit: 'Birds', amount: 900000, notes: 'Sold to Mr. Okoro' },
        { id: 2, date: '2025-11-15', item: 'Dressed Chicken', quantity: 50, unit: 'kg', amount: 150000 },
        { id: 3, date: '2025-11-14', item: 'Chicken Manure', quantity: 10, unit: 'Bags', amount: 20000 },
    ],
    Fish: [
        { id: 1, date: '2025-11-18', item: 'Live Tilapia', quantity: 150, unit: 'kg', amount: 225000, notes: 'Market sale' },
        { id: 2, date: '2025-11-17', item: 'Smoked Catfish', quantity: 25, unit: 'kg', amount: 100000 },
        { id: 3, date: '2025-11-15', item: 'Fish Fingerlings', quantity: 1000, unit: 'fingerlings', amount: 50000 },
    ]
};


const SalesScreen: React.FC<SalesScreenProps> = ({ onNavigate, isModalOpen, setIsModalOpen, activeSector }) => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [editingSale, setEditingSale] = useState<Sale | null>(null);

    useEffect(() => {
        setSales(MOCK_SALES_DATA[activeSector] || []);
    }, [activeSector]);

    const handleOpenModal = (sale: Sale | null = null) => {
        setEditingSale(sale);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingSale(null);
        setIsModalOpen(false);
    };

    const handleSaveSale = (sale: Sale) => {
        setSales(prevSales => {
            if (editingSale) {
                return prevSales.map(s => s.id === sale.id ? sale : s);
            } else {
                const newSale = { ...sale, id: Date.now() };
                return [newSale, ...prevSales];
            }
        });
        handleCloseModal();
    };

    const handleDeleteSale = (id: number) => {
        setSales(sales.filter(s => s.id !== id));
    };

    const { totalRevenue, totalItemsSold } = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentSales = sales.filter(sale => new Date(sale.date + 'T00:00:00') >= thirtyDaysAgo);
        const revenue = recentSales.reduce((sum, sale) => sum + sale.amount, 0);
        const items = recentSales.reduce((sum, sale) => sum + sale.quantity, 0);
        return { totalRevenue: revenue, totalItemsSold: items };
    }, [sales]);

    return (
        <div className="bg-background min-h-screen">
            <header className="bg-card p-4 pt-6 shadow-md sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-center text-text-primary">Income & Sales ({activeSector})</h1>
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
                    <h3 className="text-lg font-bold text-text-primary">Recent Transactions</h3>
                    {sales.map(sale => (
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
                                    <button onClick={() => handleDeleteSale(sale.id)} aria-label={`Delete sale of ${sale.item}`}>
                                        <TrashIcon className="w-5 h-5 text-text-secondary hover:text-danger transition-colors" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && <AddSaleForm sale={editingSale} onSave={handleSaveSale} onClose={handleCloseModal} activeSector={activeSector} />}
        </div>
    );
};

interface AddSaleFormProps {
    sale: Sale | null;
    onSave: (sale: Sale) => void;
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
        notes: sale?.notes || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumericField = ['quantity', 'amount'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumericField ? (value === '' ? 0 : parseFloat(value)) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const saleToSave = { ...formData, id: sale?.id || 0 };
        onSave(saleToSave);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4" onClick={onClose}>
            {/* Added max-h and overflow for desktop sizing issues, fixed accessibility lints */}
            <div className="bg-popover rounded-2xl shadow-lg p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4 text-text-primary">{sale ? 'Edit Sale' : 'Record a New Sale'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="sale-date" className="block text-sm font-medium text-text-secondary mb-1">Date of Sale</label>
                        <input id="sale-date" type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" />
                    </div>
                    <div>
                        <label htmlFor="sale-item" className="block text-sm font-medium text-text-secondary mb-1">Item Sold</label>
                        <input id="sale-item" type="text" name="item" value={formData.item} onChange={handleChange} placeholder={getPlaceholder()} className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="sale-quantity" className="block text-sm font-medium text-text-secondary mb-1">Quantity</label>
                            <input id="sale-quantity" type="number" name="quantity" value={formData.quantity > 0 ? formData.quantity : ''} onChange={handleChange} placeholder="0" className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" required />
                        </div>
                        <div>
                            <label htmlFor="sale-unit" className="block text-sm font-medium text-text-secondary mb-1">Unit</label>
                            <input id="sale-unit" type="text" name="unit" value={formData.unit} onChange={handleChange} placeholder={`e.g., ${getDefaultUnit()}`} className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="sale-amount" className="block text-sm font-medium text-text-secondary mb-1">Total Sale Amount (₦)</label>
                        <input id="sale-amount" type="number" name="amount" value={formData.amount > 0 ? formData.amount : ''} onChange={handleChange} placeholder="0" className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" required />
                    </div>
                    <div>
                        <label htmlFor="sale-notes" className="block text-sm font-medium text-text-secondary mb-1">Notes (Optional)</label>
                        <textarea id="sale-notes" name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="e.g., Sold to Mama B's Shop" className="w-full p-3 border border-border rounded-lg h-20 bg-card text-text-primary" />
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-text-primary bg-muted hover:bg-border font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary-600 font-semibold">Save Sale</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SalesScreen;