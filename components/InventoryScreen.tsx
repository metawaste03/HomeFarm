import React, { useState, useMemo } from 'react';
import { Screen } from '../App';
import { BoxIcon, PlusIcon, ChevronRightIcon, TrendingDownIcon, BellIcon, ChevronLeftIcon, MinusIcon } from './icons';

interface InventoryScreenProps {
    onNavigate: (screen: Screen) => void;
}

type InventoryCategory = 'Feed' | 'Medication' | 'Equipment' | 'Other';

interface InventoryItem {
    id: string;
    name: string;
    category: InventoryCategory;
    quantity: number;
    unit: string;
    minThreshold: number;
    transactions: Transaction[];
}

interface Transaction {
    id: string;
    date: string;
    type: 'purchase' | 'usage';
    quantity: number;
    unit: string; // Snapshot of unit at time of transaction
    cost?: number; // Only for purchases
    supplier?: string; // Only for purchases
    notes?: string;
}

const MOCK_INVENTORY: InventoryItem[] = [
    {
        id: '1',
        name: 'TopFeed Layer Mash',
        category: 'Feed',
        quantity: 12,
        unit: 'Bags',
        minThreshold: 10,
        transactions: [
            { id: 't1', date: '2025-11-10', type: 'purchase', quantity: 50, unit: 'Bags', cost: 450000, supplier: 'Feed Depot' },
            { id: 't2', date: '2025-11-11', type: 'usage', quantity: 2, unit: 'Bags', notes: 'Daily feeding' },
            { id: 't3', date: '2025-11-12', type: 'usage', quantity: 2, unit: 'Bags', notes: 'Daily feeding' },
        ]
    },
    {
        id: '2',
        name: 'Tetracycline Powder',
        category: 'Medication',
        quantity: 500,
        unit: 'g',
        minThreshold: 100,
        transactions: [
            { id: 't4', date: '2025-10-01', type: 'purchase', quantity: 1000, unit: 'g', cost: 15000, supplier: 'Vet World' },
        ]
    },
    {
        id: '3',
        name: 'Egg Crates (Empty)',
        category: 'Equipment',
        quantity: 45,
        unit: 'pcs',
        minThreshold: 50,
        transactions: []
    }
];

const InventoryScreen: React.FC<InventoryScreenProps> = ({ onNavigate }) => {
    const [items, setItems] = useState<InventoryItem[]>(MOCK_INVENTORY);
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

    // Purchase Form State
    const [isNewItem, setIsNewItem] = useState(false);
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [purchaseItemId, setPurchaseItemId] = useState(''); // For existing item
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState<InventoryCategory>('Feed');
    const [newItemUnit, setNewItemUnit] = useState('');
    const [purchaseQuantity, setPurchaseQuantity] = useState<number>(0);
    const [purchaseCost, setPurchaseCost] = useState<number>(0);
    const [supplier, setSupplier] = useState('');

    const handleItemClick = (item: InventoryItem) => {
        setSelectedItem(item);
        setViewMode('detail');
    };

    const handleBackToList = () => {
        setSelectedItem(null);
        setViewMode('list');
    };

    const handleSavePurchase = (e: React.FormEvent) => {
        e.preventDefault();
        
        const transaction: Transaction = {
            id: Date.now().toString(),
            date: purchaseDate,
            type: 'purchase',
            quantity: purchaseQuantity,
            unit: isNewItem ? newItemUnit : items.find(i => i.id === purchaseItemId)?.unit || '',
            cost: purchaseCost,
            supplier: supplier
        };

        if (isNewItem) {
            const newItem: InventoryItem = {
                id: Date.now().toString(),
                name: newItemName,
                category: newItemCategory,
                quantity: purchaseQuantity,
                unit: newItemUnit,
                minThreshold: 0, // Default
                transactions: [transaction]
            };
            setItems(prev => [newItem, ...prev]);
        } else {
            setItems(prev => prev.map(item => {
                if (item.id === purchaseItemId) {
                    return {
                        ...item,
                        quantity: item.quantity + purchaseQuantity,
                        transactions: [transaction, ...item.transactions]
                    };
                }
                return item;
            }));
        }
        
        // Reset and close
        setIsPurchaseModalOpen(false);
        setIsNewItem(false);
        setPurchaseQuantity(0);
        setPurchaseCost(0);
        setNewItemName('');
        setNewItemUnit('');
        setSupplier('');
    };
    
    const handleUpdateThreshold = (itemId: string, newThreshold: number) => {
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, minThreshold: newThreshold } : item));
        if (selectedItem && selectedItem.id === itemId) {
             setSelectedItem(prev => prev ? { ...prev, minThreshold: newThreshold } : null);
        }
    };

    // Group items by category
    const groupedItems = useMemo(() => {
        const groups: Record<string, InventoryItem[]> = {};
        items.forEach(item => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    }, [items]);

    const getStatusColor = (item: InventoryItem) => {
        if (item.quantity <= 0) return 'bg-red-500';
        if (item.quantity <= item.minThreshold) return 'bg-amber-500';
        return 'bg-green-500';
    };

    if (viewMode === 'detail' && selectedItem) {
        return (
            <div className="bg-background min-h-screen flex flex-col">
                <header className="bg-card p-4 pt-6 shadow-sm sticky top-0 z-10 flex items-center gap-2">
                    <button onClick={handleBackToList} className="p-2 -ml-2 text-text-secondary hover:text-primary rounded-full">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-text-primary">{selectedItem.name}</h1>
                        <span className="text-xs font-semibold bg-muted px-2 py-1 rounded-full text-text-secondary">{selectedItem.category}</span>
                    </div>
                </header>

                <div className="p-4 flex-grow space-y-6">
                    {/* Current Stock Card */}
                    <div className="bg-card rounded-xl shadow-sm p-6 text-center relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-2 ${getStatusColor(selectedItem)}`}></div>
                        <p className="text-sm text-text-secondary font-bold uppercase mb-2">Current Stock</p>
                        <p className="text-5xl font-bold text-text-primary">{selectedItem.quantity.toLocaleString()}</p>
                        <p className="text-xl text-text-secondary font-medium mt-1">{selectedItem.unit}</p>
                    </div>

                    {/* Alert Settings */}
                    <div className="bg-card rounded-xl shadow-sm p-4">
                         <div className="flex items-center gap-3 mb-4">
                            <BellIcon className="w-6 h-6 text-text-secondary" />
                            <h3 className="text-lg font-semibold text-text-primary">Low Stock Alert</h3>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                             <button onClick={() => handleUpdateThreshold(selectedItem.id, Math.max(0, selectedItem.minThreshold - 1))} className="bg-muted rounded-lg p-2 hover:bg-border"><MinusIcon className="w-5 h-5" /></button>
                             <div className="text-center">
                                 <p className="text-2xl font-bold text-text-primary">{selectedItem.minThreshold}</p>
                                 <p className="text-xs text-text-secondary">Alert below this level</p>
                             </div>
                             <button onClick={() => handleUpdateThreshold(selectedItem.id, selectedItem.minThreshold + 1)} className="bg-muted rounded-lg p-2 hover:bg-border"><PlusIcon className="w-5 h-5" /></button>
                        </div>
                    </div>

                    {/* History */}
                    <div>
                         <h3 className="text-lg font-bold text-text-primary mb-3">Transaction History</h3>
                         <div className="space-y-3">
                             {selectedItem.transactions.map(tx => (
                                 <div key={tx.id} className="bg-card p-3 rounded-lg shadow-sm flex justify-between items-center">
                                     <div>
                                         <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${tx.type === 'purchase' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                {tx.type === 'purchase' ? 'Purchase' : 'Used'}
                                            </span>
                                            <span className="text-xs text-text-secondary">{new Date(tx.date).toLocaleDateString()}</span>
                                         </div>
                                         {tx.notes && <p className="text-sm text-text-secondary mt-1 italic">"{tx.notes}"</p>}
                                         {tx.supplier && <p className="text-sm text-text-secondary mt-1">Supplier: {tx.supplier}</p>}
                                     </div>
                                     <div className="text-right">
                                         <p className={`font-bold text-lg ${tx.type === 'purchase' ? 'text-green-600' : 'text-text-primary'}`}>
                                             {tx.type === 'purchase' ? '+' : '-'}{tx.quantity} <span className="text-sm font-normal text-text-secondary">{tx.unit}</span>
                                         </p>
                                         {tx.cost && <p className="text-xs text-text-secondary">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(tx.cost)}</p>}
                                     </div>
                                 </div>
                             ))}
                         </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen flex flex-col">
             <header className="bg-card p-4 pt-6 shadow-sm sticky top-0 z-10 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                     <button onClick={() => onNavigate('sales')} className="p-2 -ml-2 text-text-secondary hover:text-primary rounded-full">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-text-primary">Inventory</h1>
                 </div>
                <button 
                    onClick={() => setIsPurchaseModalOpen(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1 hover:bg-primary-600 transition"
                >
                    <PlusIcon className="w-4 h-4" /> Log Purchase
                </button>
            </header>

            <div className="p-4 flex-grow space-y-6">
                {(Object.entries(groupedItems) as [string, InventoryItem[]][]).map(([category, categoryItems]) => (
                    <div key={category}>
                        <h3 className="text-sm font-bold text-text-secondary uppercase mb-2 px-1">{category}</h3>
                        <div className="space-y-3">
                            {categoryItems.map(item => (
                                <div 
                                    key={item.id} 
                                    onClick={() => handleItemClick(item)}
                                    className="bg-card p-4 rounded-xl shadow-sm flex justify-between items-center cursor-pointer hover:bg-muted transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${getStatusColor(item)}`}></div>
                                        <div>
                                            <p className="font-bold text-text-primary">{item.name}</p>
                                            {item.quantity <= item.minThreshold && (
                                                <p className="text-xs text-danger font-semibold flex items-center gap-1">
                                                    <TrendingDownIcon className="w-3 h-3" /> Low Stock
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-text-primary">{item.quantity.toLocaleString()} <span className="text-sm font-normal text-text-secondary">{item.unit}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {items.length === 0 && (
                    <div className="text-center py-10 text-text-secondary">
                        <BoxIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No inventory items yet.</p>
                        <p className="text-sm">Tap "Log Purchase" to start.</p>
                    </div>
                )}
            </div>

            {/* Purchase Modal */}
            {isPurchaseModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setIsPurchaseModalOpen(false)}>
                    <div className="bg-popover rounded-t-2xl md:rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-4 text-center text-text-primary">Log a Purchase</h3>
                            <form onSubmit={handleSavePurchase} className="space-y-4">
                                {/* Item Selection Toggle */}
                                <div className="flex bg-muted p-1 rounded-lg mb-4">
                                    <button type="button" onClick={() => setIsNewItem(false)} className={`flex-1 py-2 text-sm font-bold rounded-md transition ${!isNewItem ? 'bg-card shadow text-primary' : 'text-text-secondary'}`}>Existing Item</button>
                                    <button type="button" onClick={() => setIsNewItem(true)} className={`flex-1 py-2 text-sm font-bold rounded-md transition ${isNewItem ? 'bg-card shadow text-primary' : 'text-text-secondary'}`}>+ Create New</button>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Date of Purchase</label>
                                    <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="w-full p-2 border border-border rounded-lg bg-card text-text-primary" required />
                                </div>

                                {isNewItem ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-1">Item Name</label>
                                            <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="e.g., Broiler Starter Feed" className="w-full p-2 border border-border rounded-lg bg-card text-text-primary" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
                                                <select value={newItemCategory} onChange={e => setNewItemCategory(e.target.value as InventoryCategory)} className="w-full p-2 border border-border rounded-lg bg-card text-text-primary">
                                                    <option value="Feed">Feed</option>
                                                    <option value="Medication">Medication</option>
                                                    <option value="Equipment">Equipment</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-1">Unit</label>
                                                <input type="text" value={newItemUnit} onChange={e => setNewItemUnit(e.target.value)} placeholder="e.g., Bags, kg" className="w-full p-2 border border-border rounded-lg bg-card text-text-primary" required />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Select Item</label>
                                        <select value={purchaseItemId} onChange={e => setPurchaseItemId(e.target.value)} className="w-full p-2 border border-border rounded-lg bg-card text-text-primary" required>
                                            <option value="">-- Choose Item --</option>
                                            {items.map(item => <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>)}
                                        </select>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Quantity Purchased</label>
                                        <input type="number" value={purchaseQuantity > 0 ? purchaseQuantity : ''} onChange={e => setPurchaseQuantity(parseFloat(e.target.value))} placeholder="0" className="w-full p-2 border border-border rounded-lg bg-card text-text-primary" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Total Cost (₦)</label>
                                        <input type="number" value={purchaseCost > 0 ? purchaseCost : ''} onChange={e => setPurchaseCost(parseFloat(e.target.value))} placeholder="0" className="w-full p-2 border border-border rounded-lg bg-card text-text-primary" required />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Supplier (Optional)</label>
                                    <input type="text" value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="e.g., Feed Depot" className="w-full p-2 border border-border rounded-lg bg-card text-text-primary" />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setIsPurchaseModalOpen(false)} className="px-4 py-2 rounded-lg text-text-primary bg-muted hover:bg-border font-semibold">Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary-600 font-semibold">SAVE PURCHASE</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryScreen;