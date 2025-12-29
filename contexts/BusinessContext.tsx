
import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

export interface Supplier {
    id: string;
    name: string;
    contact: string;
    category: string;
}

interface BusinessContextType {
    inventoryItems: InventoryItem[];
    suppliers: Supplier[];
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
    }) => void;
    updateThreshold: (itemId: string, newThreshold: number) => void;
    addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    const addPurchase = (data: any) => {
        const transaction: Transaction = {
            id: Date.now().toString(),
            date: data.date,
            type: 'purchase',
            quantity: data.quantity,
            unit: data.isNewItem ? data.unit : inventoryItems.find(i => i.id === data.itemId)?.unit || '',
            cost: data.cost,
            supplier: data.supplier
        };

        if (data.isNewItem) {
            const newItem: InventoryItem = {
                id: Date.now().toString(),
                name: data.name,
                category: data.category,
                quantity: data.quantity,
                unit: data.unit,
                minThreshold: 0,
                transactions: [transaction]
            };
            setInventoryItems(prev => [newItem, ...prev]);
        } else {
            setInventoryItems(prev => prev.map(item => {
                if (item.id === data.itemId) {
                    return {
                        ...item,
                        quantity: item.quantity + data.quantity,
                        transactions: [transaction, ...item.transactions]
                    };
                }
                return item;
            }));
        }
    };

    const updateThreshold = (itemId: string, newThreshold: number) => {
        setInventoryItems(prev => prev.map(item => item.id === itemId ? { ...item, minThreshold: newThreshold } : item));
    };

    const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
        setSuppliers(prev => [...prev, { ...supplier, id: Date.now().toString() }]);
    };

    return (
        <BusinessContext.Provider value={{ inventoryItems, suppliers, addPurchase, updateThreshold, addSupplier }}>
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
