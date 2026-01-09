
import React, { useState, useMemo, useEffect } from 'react';
import { Screen } from '../App';
import { useUI } from '../contexts/UIContext';
import { supabase } from '../lib/supabase';
import { BoxIcon, PlusIcon, ChevronRightIcon, TrendingDownIcon, BellIcon, ChevronLeftIcon, MinusIcon, PencilIcon, TrashIcon } from './icons';
import { useBusiness, InventoryItem, InventoryCategory, Transaction } from '../contexts/BusinessContext';

interface InventoryScreenProps {
    onNavigate: (screen: Screen) => void;
}

const InventoryScreen: React.FC<InventoryScreenProps> = ({ onNavigate }) => {
    const { inventoryItems: items, addPurchase, updateThreshold, updateInventoryItem, deleteInventoryItem } = useBusiness();
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
    const [activeTab, setActiveTab] = useState<'inventory' | 'suppliers'>('inventory');
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const { setBottomNavVisible } = useUI();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Toggle Bottom Nav
    useEffect(() => {
        const isAnyModalOpen = isPurchaseModalOpen || isEditModalOpen;
        setBottomNavVisible(!isAnyModalOpen);
        // Ensure nav is restored when unmounting or modals close
        return () => setBottomNavVisible(true);
    }, [isPurchaseModalOpen, isEditModalOpen, setBottomNavVisible]);
    const [editName, setEditName] = useState('');
    const [editCategory, setEditCategory] = useState<InventoryCategory>('Feed');
    const [editUnit, setEditUnit] = useState('');

    // Purchase Form State
    const [isNewItem, setIsNewItem] = useState(false);
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [purchaseItemId, setPurchaseItemId] = useState('');
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState<InventoryCategory>('Feed');
    const [newItemUnit, setNewItemUnit] = useState('');
    const [purchaseQuantity, setPurchaseQuantity] = useState<number>(0);
    const [purchaseCost, setPurchaseCost] = useState<number>(0);
    const [supplier, setSupplier] = useState('');

    const handleItemClick = (item: InventoryItem) => {
        setSelectedItem(item);
        setEditName(item.name);
        setEditCategory(item.category);
        setEditUnit(item.unit);
        setViewMode('detail');
    };

    const handleBackToList = () => {
        setSelectedItem(null);
        setViewMode('list');
    };

    const handleSavePurchase = (e: React.FormEvent) => {
        e.preventDefault();

        addPurchase({
            isNewItem,
            itemId: purchaseItemId,
            name: newItemName,
            category: newItemCategory,
            unit: newItemUnit,
            quantity: purchaseQuantity,
            cost: purchaseCost,
            date: purchaseDate,
            supplier: supplier
        });

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
        updateThreshold(itemId, newThreshold);
        if (selectedItem && selectedItem.id === itemId) {
            setSelectedItem(prev => prev ? { ...prev, minThreshold: newThreshold } : null);
        }
    };

    const handleDeleteItem = async () => {
        if (!selectedItem) return;
        if (confirm(`Are you sure you want to delete ${selectedItem.name}? This cannot be undone.`)) {
            await deleteInventoryItem(selectedItem.id);
            setSelectedItem(null);
            setViewMode('list');
        }
    };

    const handleUpdateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;
        await updateInventoryItem(selectedItem.id, {
            name: editName,
            category: editCategory,
            unit: editUnit
        });
        setSelectedItem(prev => prev ? { ...prev, name: editName, category: editCategory, unit: editUnit } : null);
        setIsEditModalOpen(false);
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

    if (items.length === 0) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center p-6 relative">
                <button onClick={() => onNavigate('business')} className="absolute top-6 left-4 p-2 text-text-secondary hover:text-primary rounded-full z-10" aria-label="Go back">
                    <ChevronLeftIcon className="w-8 h-8" />
                </button>
                <div className="bg-card rounded-3xl shadow-xl p-10 w-full max-w-md text-center border border-border">
                    <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BoxIcon className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-text-primary mb-3">Track Your Supplies in Real-Time</h1>
                    <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                        Log your purchases for feed, medication, and equipment to always know your stock levels.
                    </p>
                    <button
                        onClick={() => setIsPurchaseModalOpen(true)}
                        className="w-full bg-primary text-white font-bold py-4 px-6 rounded-2xl text-xl flex items-center justify-center gap-3 hover:bg-primary-600 active:scale-95 transition-all shadow-lg"
                    >
                        <PlusIcon className="w-6 h-6" />
                        Log Purchase
                    </button>
                    {isPurchaseModalOpen && (
                        <PurchaseModal
                            isOpen={isPurchaseModalOpen}
                            onClose={() => setIsPurchaseModalOpen(false)}
                            items={items}
                            onSubmit={handleSavePurchase}
                            formData={{
                                isNewItem, setIsNewItem,
                                purchaseDate, setPurchaseDate,
                                purchaseItemId, setPurchaseItemId,
                                newItemName, setNewItemName,
                                newItemCategory, setNewItemCategory,
                                newItemUnit, setNewItemUnit,
                                purchaseQuantity, setPurchaseQuantity,
                                purchaseCost, setPurchaseCost,
                                supplier, setSupplier
                            }}
                        />
                    )}
                </div>
            </div>
        );
    }

    if (viewMode === 'detail' && selectedItem) {
        return (
            <div className="bg-background min-h-screen flex flex-col">
                <header className="bg-card p-4 pt-6 shadow-sm sticky top-0 z-10 flex items-center gap-2">
                    <button onClick={handleBackToList} className="p-2 -ml-2 text-text-secondary hover:text-primary rounded-full" aria-label="Go back to inventory list">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <div className="flex-grow">
                        <h1 className="text-xl font-bold text-text-primary">{selectedItem.name}</h1>
                        <span className="text-xs font-semibold bg-muted px-2 py-1 rounded-full text-text-secondary">{selectedItem.category}</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditModalOpen(true)} className="p-2 text-text-secondary hover:bg-muted rounded-full">
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={handleDeleteItem} className="p-2 text-danger hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <div className="p-4 flex-grow space-y-6">
                    <div className="bg-card rounded-xl shadow-sm p-6 text-center relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-2 ${getStatusColor(selectedItem)} `}></div>
                        <p className="text-sm text-text-secondary font-bold uppercase mb-2">Current Stock</p>
                        <p className="text-5xl font-bold text-text-primary">{selectedItem.quantity.toLocaleString()}</p>
                        <p className="text-xl text-text-secondary font-medium mt-1">{selectedItem.unit}</p>
                    </div>

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

                    <div>
                        <h3 className="text-lg font-bold text-text-primary mb-3">Transaction History</h3>
                        <div className="space-y-3">
                            {selectedItem.transactions.map(tx => (
                                <div key={tx.id} className="bg-card p-3 rounded-lg shadow-sm flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${tx.type === 'purchase' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'} `}>
                                                {tx.type === 'purchase' ? 'Purchase' : 'Used'}
                                            </span>
                                            <span className="text-xs text-text-secondary">{new Date(tx.date).toLocaleDateString()}</span>
                                        </div>
                                        {tx.notes && <p className="text-sm text-text-secondary mt-1 italic">"{tx.notes}"</p>}
                                        {tx.supplier && <p className="text-sm text-text-secondary mt-1">Supplier: {tx.supplier}</p>}
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold text-lg ${tx.type === 'purchase' ? 'text-green-600' : 'text-text-primary'} `}>
                                            {tx.type === 'purchase' ? '+' : '-'}{tx.quantity.toLocaleString()} <span className="text-sm font-normal text-text-secondary">{tx.unit}</span>
                                        </p>
                                        {tx.cost && <p className="text-xs text-text-secondary">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(tx.cost)}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


                {
                    isEditModalOpen && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsEditModalOpen(false)}>
                            <div className="bg-popover rounded-2xl shadow-lg w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                                <h3 className="text-lg font-bold text-text-primary mb-4">Edit Item Details</h3>
                                <form onSubmit={handleUpdateItem} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Item Name</label>
                                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
                                        <select value={editCategory} onChange={e => setEditCategory(e.target.value as InventoryCategory)} className="w-full p-3 border border-border rounded-lg bg-card text-text-primary">
                                            <option value="Feed">Feed</option>
                                            <option value="Medication">Medication</option>
                                            <option value="Equipment">Equipment</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Unit</label>
                                        <input type="text" value={editUnit} onChange={e => setEditUnit(e.target.value)} className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" required />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4">
                                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 rounded-lg text-text-primary bg-muted hover:bg-border font-semibold">Cancel</button>
                                        <button type="submit" className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary-600 font-semibold">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen flex flex-col">
            <header className="bg-card p-4 pt-6 shadow-sm sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <button onClick={() => onNavigate('business')} className="p-2 -ml-2 text-text-secondary hover:text-primary rounded-full" aria-label="Go back to business hub">
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
                                        <div className={`w-3 h-3 rounded-full ${getStatusColor(item)} `}></div>
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
            </div>

            {isPurchaseModalOpen && (
                <PurchaseModal
                    isOpen={isPurchaseModalOpen}
                    onClose={() => setIsPurchaseModalOpen(false)}
                    items={items}
                    onSubmit={handleSavePurchase}
                    formData={{
                        isNewItem, setIsNewItem,
                        purchaseDate, setPurchaseDate,
                        purchaseItemId, setPurchaseItemId,
                        newItemName, setNewItemName,
                        newItemCategory, setNewItemCategory,
                        newItemUnit, setNewItemUnit,
                        purchaseQuantity, setPurchaseQuantity,
                        purchaseCost, setPurchaseCost,
                        supplier, setSupplier
                    }}
                />
            )}
        </div>
    );
};

interface PurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: InventoryItem[];
    onSubmit: (e: React.FormEvent) => void;
    formData: any;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose, items, onSubmit, formData }) => {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-4 sm:pt-8 px-4 pb-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-popover rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-4 sm:p-6">
                    <h3 className="text-xl font-bold mb-4 text-center text-text-primary">Log a Purchase</h3>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="flex bg-muted p-1 rounded-lg mb-4">
                            <button type="button" onClick={() => formData.setIsNewItem(false)} className={`flex-1 py-2 text-sm font-bold rounded-md transition ${!formData.isNewItem ? 'bg-card shadow text-primary' : 'text-text-secondary'} `}>Existing Item</button>
                            <button type="button" onClick={() => formData.setIsNewItem(true)} className={`flex-1 py-2 text-sm font-bold rounded-md transition ${formData.isNewItem ? 'bg-card shadow text-primary' : 'text-text-secondary'} `}>+ Create New</button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Date of Purchase</label>
                            <input type="date" value={formData.purchaseDate} onChange={e => formData.setPurchaseDate(e.target.value)} className="w-full p-2 border border-border rounded-lg bg-card text-text-primary" required />
                        </div>

                        {formData.isNewItem ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Item Name</label>
                                    <input type="text" value={formData.newItemName} onChange={e => formData.setNewItemName(e.target.value)} placeholder="e.g., Broiler Starter Feed" className="w-full p-2 border border-border rounded-lg bg-card text-text-primary" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
                                        <select value={formData.newItemCategory} onChange={e => formData.setNewItemCategory(e.target.value as InventoryCategory)} className="w-full p-2 border border-border rounded-lg bg-card text-text-primary">
                                            <option value="Feed">Feed</option>
                                            <option value="Medication">Medication</option>
                                            <option value="Equipment">Equipment</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Unit</label>
                                        <input type="text" value={formData.newItemUnit} onChange={e => formData.setNewItemUnit(e.target.value)} placeholder="e.g., Bags, kg" className="w-full p-2 border border-border rounded-lg bg-card text-text-primary" required />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Select Item</label>
                                <select value={formData.purchaseItemId} onChange={e => formData.setPurchaseItemId(e.target.value)} className="w-full p-2 border border-border rounded-lg bg-card text-text-primary" required>
                                    <option value="">-- Choose Item --</option>
                                    {items.map(item => <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>)}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Quantity Purchased</label>
                                <input type="number" value={formData.purchaseQuantity > 0 ? formData.purchaseQuantity : ''} onChange={e => formData.setPurchaseQuantity(parseFloat(e.target.value))} placeholder="0" className="w-full p-2 border border-border rounded-lg bg-card text-text-primary" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Total Cost (₦)</label>
                                <input type="number" value={formData.purchaseCost > 0 ? formData.purchaseCost : ''} onChange={e => formData.setPurchaseCost(parseFloat(e.target.value))} placeholder="0" className="w-full p-2 border border-border rounded-lg bg-card text-text-primary" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Supplier (Optional)</label>
                            <input type="text" value={formData.supplier} onChange={e => formData.setSupplier(e.target.value)} placeholder="e.g., Feed Depot" className="w-full p-2 border border-border rounded-lg bg-card text-text-primary" />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-text-primary bg-muted hover:bg-border font-semibold">Cancel</button>
                            <button type="submit" className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary-600 font-semibold">SAVE PURCHASE</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InventoryScreen;
