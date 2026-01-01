import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { inventoryService, transactionsService, suppliersService } from '../services/database';
import { useAuth } from './AuthContext';
import { useFarm } from './FarmContext';
import type { Tables } from '../types/database';

export type InventoryCategory = 'Feed' | 'Medication' | 'Equipment' | 'Other';

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
    }) => Promise<void>;
    updateThreshold: (itemId: string, newThreshold: number) => Promise<void>;
    addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
    refreshData: () => Promise<void>;
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
                // Create new inventory item
                const newItem = await inventoryService.create({
                    farm_id: String(farmId),
                    name: data.name,
                    category: data.category,
                    quantity: data.quantity,
                    unit: data.unit,
                    min_threshold: 0,
                });

                // Create transaction for the new item
                const dbTransaction = await transactionsService.create({
                    item_id: newItem.id,
                    transaction_date: data.date,
                    type: 'purchase',
                    quantity: data.quantity,
                    unit: data.unit,
                    cost: data.cost,
                    supplier: data.supplier || null,
                    notes: null,
                });

                const appTransaction = dbTransactionToAppTransaction(dbTransaction);
                const appItem = dbItemToAppItem(newItem, [appTransaction]);
                setInventoryItems(prev => [appItem, ...prev]);
            } else {
                // Update existing item quantity and add transaction
                const existingItem = inventoryItems.find(i => i.id === data.itemId);
                if (!existingItem) throw new Error('Inventory item not found');

                const newQuantity = existingItem.quantity + data.quantity;

                await inventoryService.update(data.itemId, { quantity: newQuantity });

                const dbTransaction = await transactionsService.create({
                    item_id: data.itemId,
                    transaction_date: data.date,
                    type: 'purchase',
                    quantity: data.quantity,
                    unit: existingItem.unit,
                    cost: data.cost,
                    supplier: data.supplier || null,
                    notes: null,
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

    return (
        <BusinessContext.Provider value={{
            inventoryItems,
            suppliers,
            loading,
            error,
            addPurchase,
            updateThreshold,
            addSupplier,
            refreshData,
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
