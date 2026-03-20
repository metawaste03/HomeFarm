import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { inventoryService, transactionsService, suppliersService } from '../services/database';
import { useAuth } from './AuthContext';
import { useFarm } from './FarmContext';
import type { Tables } from '../types/database';

export type InventoryCategory = 'Feed' | 'Medication' | 'Equipment' | 'Product' | 'Other';

export interface Transaction {
    id: string;
    date: string;
    type: 'purchase' | 'usage';
    quantity: number;
    unit: string;
    cost?: number;
    supplier?: string;
    notes?: string;
}

export interface InventoryItem {
    id: string;
    name: string;
    category: InventoryCategory;
    quantity: number;
    unit: string;
    minThreshold: number;
    transactions: Transaction[];
    farmId?: string;
    weightPerUnit?: number; // Weight in Kg per unit (e.g., 25 for 25Kg bags)
    baseUnit?: string; // Base unit for internal tracking (e.g., 'kg')
}

export interface Supplier {
    id: string;
    name: string;
    contact: string;
    category: string;
    farmId?: string;
}

interface BusinessContextType {
    inventoryItems: InventoryItem[];
    suppliers: Supplier[];
    loading: boolean;
    error: string | null;
    addPurchase: (purchaseData: {
        isNewItem: boolean;
        itemId?: string;
        name?: string;
        category?: InventoryCategory;
        unit?: string;
        quantity: number;
        cost: number;
        date: string;
        supplier?: string;
        weightPerUnit?: number;
    }) => Promise<void>;
    updateThreshold: (itemId: string, newThreshold: number) => Promise<void>;
    addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
    refreshData: () => Promise<void>;
    deleteInventoryItem: (itemId: string) => Promise<void>;
    updateInventoryItem: (itemId: string, updates: Partial<InventoryItem>) => Promise<void>;
    // New inventory usage functions
    recordUsage: (itemId: string, quantity: number, notes?: string) => Promise<void>;
    recordProduction: (farmId: string, itemName: string, category: InventoryCategory, quantity: number, unit: string, notes?: string) => Promise<void>;
    getAvailableFeed: () => InventoryItem[];
    getAvailableMedication: () => InventoryItem[];
    checkAvailability: (itemId: string, requestedQty: number) => { available: boolean; currentQty: number; itemName: string };
    checkProductAvailability: (itemName: string, quantity: number) => { available: boolean; currentQty: number; itemName: string; itemId?: string };
    // Unit conversion functions
    convertToBaseUnits: (item: InventoryItem, displayQuantity: number) => number;
    convertToDisplayUnits: (item: InventoryItem, baseQuantity: number) => number;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

// Helper to convert database inventory item to app inventory item
const dbItemToAppItem = (dbItem: Tables<'inventory_items'>, transactions: Transaction[]): InventoryItem => ({
    id: dbItem.id,
    name: dbItem.name,
    category: dbItem.category as InventoryCategory,
    quantity: Number(dbItem.quantity),
    unit: dbItem.unit,
    minThreshold: Number(dbItem.min_threshold),
    transactions,
    farmId: dbItem.farm_id,
    weightPerUnit: Number(dbItem.weight_per_unit),
    baseUnit: dbItem.base_unit,
});

// Helper to convert database transaction to app transaction
const dbTransactionToAppTransaction = (dbTrans: Tables<'transactions'>): Transaction => ({
    id: dbTrans.id,
    date: dbTrans.transaction_date,
    type: dbTrans.type as 'purchase' | 'usage',
    quantity: Number(dbTrans.quantity),
    unit: dbTrans.unit,
    cost: dbTrans.cost ? Number(dbTrans.cost) : undefined,
    supplier: dbTrans.supplier || undefined,
    notes: dbTrans.notes || undefined,
});

// Helper to convert database supplier to app supplier
const dbSupplierToAppSupplier = (dbSupplier: Tables<'suppliers'>): Supplier => ({
    id: dbSupplier.id,
    name: dbSupplier.name,
    contact: dbSupplier.contact || '',
    category: dbSupplier.category || '',
    farmId: dbSupplier.farm_id,
});

export const BusinessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { farms } = useFarm();
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshData = useCallback(async () => {
        if (!user || farms.length === 0) {
            setInventoryItems([]);
            setSuppliers([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fetch inventory items
            const dbItems = await inventoryService.list();

            // Fetch transactions for each item
            const itemsWithTransactions = await Promise.all(
                dbItems.map(async (item) => {
                    const dbTransactions = await transactionsService.list(item.id);
                    const transactions = dbTransactions.map(dbTransactionToAppTransaction);
                    return dbItemToAppItem(item, transactions);
                })
            );
            setInventoryItems(itemsWithTransactions);

            // Fetch suppliers
            const dbSuppliers = await suppliersService.list();
            setSuppliers(dbSuppliers.map(dbSupplierToAppSupplier));
        } catch (err) {
            console.error('Error fetching business data:', err);
            setError('Failed to load business data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [user, farms]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const addPurchase = async (data: any) => {
        if (!user) return;

        const farmId = farms[0]?.id;
        if (!farmId) {
            throw new Error('No farm available. Please create a farm first.');
        }

        try {
            const transaction: Omit<Transaction, 'id'> = {
                date: data.date,
                type: 'purchase',
                quantity: data.quantity,
                unit: data.isNewItem ? data.unit : inventoryItems.find(i => i.id === data.itemId)?.unit || '',
                cost: data.cost,
                supplier: data.supplier,
            };

            if (data.isNewItem) {
                // Calculate total quantity in base units (Kg for feed)
                let totalQuantity = data.quantity;
                let weightPerUnit = 1;
                let baseUnit = 'kg';
                
                // If it's feed and unit is bags, calculate total weight in Kg
                if (data.category === 'Feed' && data.unit.toLowerCase().includes('bag')) {
                    weightPerUnit = data.weightPerUnit || 1;
                    totalQuantity = data.quantity * weightPerUnit;
                    baseUnit = 'kg';
                }

                // Create new inventory item
                const newItem = await inventoryService.create({
                    farm_id: String(farmId),
                    name: data.name,
                    category: data.category,
                    quantity: totalQuantity,
                    unit: data.unit,
                    min_threshold: 0,
                    weight_per_unit: weightPerUnit,
                    base_unit: baseUnit,
                });

                // Create transaction for the new item (record in display units)
                const dbTransaction = await transactionsService.create({
                    item_id: newItem.id,
                    transaction_date: data.date,
                    type: 'purchase',
                    quantity: data.quantity,
                    unit: data.unit,
                    cost: data.cost,
                    supplier: data.supplier || null,
                    notes: data.weightPerUnit ? `${data.quantity} ${data.unit} × ${data.weightPerUnit} kg = ${totalQuantity} kg total` : null,
                });

                const appTransaction = dbTransactionToAppTransaction(dbTransaction);
                const appItem = dbItemToAppItem(newItem, [appTransaction]);
                setInventoryItems(prev => [appItem, ...prev]);
            } else {
                // Update existing item quantity and add transaction
                const existingItem = inventoryItems.find(i => i.id === data.itemId);
                if (!existingItem) throw new Error('Inventory item not found');

                // Calculate quantity to add in base units
                let quantityToAdd = data.quantity;
                if (existingItem.category === 'Feed' && existingItem.unit.toLowerCase().includes('bag') && existingItem.weightPerUnit) {
                    quantityToAdd = data.quantity * existingItem.weightPerUnit;
                }

                const newQuantity = existingItem.quantity + quantityToAdd;

                await inventoryService.update(data.itemId, { quantity: newQuantity });

                const dbTransaction = await transactionsService.create({
                    item_id: data.itemId,
                    transaction_date: data.date,
                    type: 'purchase',
                    quantity: data.quantity,
                    unit: existingItem.unit,
                    cost: data.cost,
                    supplier: data.supplier || null,
                    notes: existingItem.weightPerUnit ? `${data.quantity} ${existingItem.unit} × ${existingItem.weightPerUnit} kg = ${quantityToAdd} kg total` : null,
                });

                const appTransaction = dbTransactionToAppTransaction(dbTransaction);

                setInventoryItems(prev => prev.map(item => {
                    if (item.id === data.itemId) {
                        return {
                            ...item,
                            quantity: newQuantity,
                            transactions: [appTransaction, ...item.transactions],
                        };
                    }
                    return item;
                }));
            }
        } catch (err) {
            console.error('Error adding purchase:', err);
            throw err;
        }
    };

    const updateThreshold = async (itemId: string, newThreshold: number) => {
        try {
            await inventoryService.update(itemId, { min_threshold: newThreshold });
            setInventoryItems(prev => prev.map(item =>
                item.id === itemId ? { ...item, minThreshold: newThreshold } : item
            ));
        } catch (err) {
            console.error('Error updating threshold:', err);
            throw err;
        }
    };

    const updateInventoryItem = async (itemId: string, updates: Partial<InventoryItem>) => {
        try {
            // Convert app updates to database format
            const dbUpdates: any = {};
            if (updates.name) dbUpdates.name = updates.name;
            if (updates.category) dbUpdates.category = updates.category;
            if (updates.unit) dbUpdates.unit = updates.unit;
            if (updates.minThreshold !== undefined) dbUpdates.min_threshold = updates.minThreshold;
            if (updates.weightPerUnit !== undefined) dbUpdates.weight_per_unit = updates.weightPerUnit;
            if (updates.baseUnit !== undefined) dbUpdates.base_unit = updates.baseUnit;

            await inventoryService.update(itemId, dbUpdates);

            setInventoryItems(prev => prev.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
            ));
        } catch (err: any) {
            console.error('Error updating inventory item:', err);
            throw err;
        }
    };

    const deleteInventoryItem = async (itemId: string) => {
        try {
            await inventoryService.delete(itemId);
            setInventoryItems(prev => prev.filter(item => item.id !== itemId));
        } catch (err: any) {
            console.error('Error deleting inventory item:', err);
            throw err;
        }
    };

    const addSupplier = async (supplierData: Omit<Supplier, 'id'>) => {
        if (!user) return;

        const farmId = farms[0]?.id;
        if (!farmId) {
            throw new Error('No farm available. Please create a farm first.');
        }

        try {
            const dbSupplier = await suppliersService.create({
                farm_id: String(farmId),
                name: supplierData.name,
                contact: supplierData.contact || null,
                category: supplierData.category || null,
            });
            setSuppliers(prev => [...prev, dbSupplierToAppSupplier(dbSupplier)]);
        } catch (err) {
            console.error('Error adding supplier:', err);
            throw err;
        }
    };

    // Record usage of inventory item (deduct from stock)
    const recordUsage = async (itemId: string, quantity: number, notes?: string) => {
        const item = inventoryItems.find(i => i.id === itemId);
        if (!item) throw new Error('Inventory item not found');

        // Convert quantity to base units if needed
        const quantityInBaseUnits = convertToBaseUnits(item, quantity);

        if (item.quantity < quantityInBaseUnits) {
            const displayUnit = item.unit.toLowerCase().includes('bag') ? 'bags' : item.unit;
            const currentQtyDisplay = convertToDisplayUnits(item, item.quantity);
            throw new Error(`Insufficient stock. Only ${currentQtyDisplay} ${displayUnit} available.`);
        }

        const newQuantity = item.quantity - quantityInBaseUnits;

        try {
            // Update inventory quantity
            await inventoryService.update(itemId, { quantity: newQuantity });

            // Create usage transaction (record in display units)
            const dbTransaction = await transactionsService.create({
                item_id: itemId,
                transaction_date: new Date().toISOString().split('T')[0],
                type: 'usage',
                quantity: quantity, // Display quantity (what user entered)
                unit: item.unit,
                cost: null,
                supplier: null,
                notes: notes || `Daily log consumption (${quantityInBaseUnits} kg)`,
            });

            const appTransaction = dbTransactionToAppTransaction(dbTransaction);

            // Update local state
            setInventoryItems(prev => prev.map(i => {
                if (i.id === itemId) {
                    return {
                        ...i,
                        quantity: newQuantity,
                        transactions: [appTransaction, ...i.transactions],
                    };
                }
                return i;
            }));
        } catch (err) {
            console.error('Error recording usage:', err);
            throw err;
        }
    };

    // Record production of items (add to stock)
    const recordProduction = async (farmId: string, itemName: string, category: InventoryCategory, quantity: number, unit: string, notes?: string) => {
        try {
            // Find if item already exists
            const existingItem = inventoryItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());

            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;
                await inventoryService.update(existingItem.id, { quantity: newQuantity });

                const dbTransaction = await transactionsService.create({
                    item_id: existingItem.id,
                    transaction_date: new Date().toISOString().split('T')[0],
                    type: 'purchase', // Using purchase type for addition to stock
                    quantity: quantity,
                    unit: existingItem.unit,
                    cost: null,
                    supplier: null,
                    notes: notes || 'Daily log production',
                });

                const appTransaction = dbTransactionToAppTransaction(dbTransaction);

                setInventoryItems(prev => prev.map(i => {
                    if (i.id === existingItem.id) {
                        return {
                            ...i,
                            quantity: newQuantity,
                            transactions: [appTransaction, ...i.transactions],
                        };
                    }
                    return i;
                }));
            } else {
                // Create new item
                const newItem = await inventoryService.create({
                    farm_id: farmId,
                    name: itemName,
                    category: category,
                    quantity: quantity,
                    unit: unit,
                    min_threshold: 0,
                });

                const dbTransaction = await transactionsService.create({
                    item_id: newItem.id,
                    transaction_date: new Date().toISOString().split('T')[0],
                    type: 'purchase',
                    quantity: quantity,
                    unit: unit,
                    cost: null,
                    supplier: null,
                    notes: notes || 'Daily log production',
                });

                const appTransaction = dbTransactionToAppTransaction(dbTransaction);
                const appItem = dbItemToAppItem(newItem, [appTransaction]);
                setInventoryItems(prev => [appItem, ...prev]);
            }
        } catch (err) {
            console.error('Error recording production:', err);
            throw err;
        }
    };

    // Get available feed items (quantity > 0)
    const getAvailableFeed = useCallback(() => {
        return inventoryItems.filter(item => item.category === 'Feed' && item.quantity > 0);
    }, [inventoryItems]);

    // Get available medication items (quantity > 0)
    const getAvailableMedication = useCallback(() => {
        return inventoryItems.filter(item => item.category === 'Medication' && item.quantity > 0);
    }, [inventoryItems]);

    // Check if requested quantity is available
    // Note: requestedQty is always in Kg for feed (as entered in Daily Log)
    const checkAvailability = useCallback((itemId: string, requestedQty: number) => {
        const item = inventoryItems.find(i => i.id === itemId);
        if (!item) {
            return { available: false, currentQty: 0, itemName: 'Unknown' };
        }
        // item.quantity is already stored in base units (Kg)
        // requestedQty is in Kg (from Daily Log)
        return {
            available: item.quantity >= requestedQty,
            currentQty: item.quantity,
            itemName: item.name
        };
    }, [inventoryItems]);

    // Check if product is available by name
    const checkProductAvailability = useCallback((itemName: string, quantity: number) => {
        const item = inventoryItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
        if (!item) {
            return { available: false, currentQty: 0, itemName };
        }
        return {
            available: item.quantity >= quantity,
            currentQty: item.quantity,
            itemName: item.name,
            itemId: item.id
        };
    }, [inventoryItems]);

    // Convert display quantity to base units (Kg)
    const convertToBaseUnits = useCallback((item: InventoryItem, displayQuantity: number): number => {
        if (item.category === 'Feed' && item.unit.toLowerCase().includes('bag') && item.weightPerUnit) {
            return displayQuantity * item.weightPerUnit;
        }
        return displayQuantity;
    }, []);

    // Convert base units (Kg) to display units
    const convertToDisplayUnits = useCallback((item: InventoryItem, baseQuantity: number): number => {
        if (item.category === 'Feed' && item.unit.toLowerCase().includes('bag') && item.weightPerUnit) {
            return baseQuantity / item.weightPerUnit;
        }
        return baseQuantity;
    }, []);

    return (
        <BusinessContext.Provider value={{
            inventoryItems,
            suppliers,
            loading,
            error,
            addPurchase,
            updateThreshold,
            updateInventoryItem,
            deleteInventoryItem,
            addSupplier,
            refreshData,
            recordUsage,
            recordProduction,
            getAvailableFeed,
            getAvailableMedication,
            checkAvailability,
            checkProductAvailability,
            convertToBaseUnits,
            convertToDisplayUnits,
        }}>
            {children}
        </BusinessContext.Provider>
    );
};

export const useBusiness = () => {
    const context = useContext(BusinessContext);
    if (context === undefined) {
        throw new Error('useBusiness must be used within a BusinessProvider');
    }
    return context;
};
