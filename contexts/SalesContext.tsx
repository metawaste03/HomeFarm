
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Sector } from './FarmContext';

export interface Sale {
    id: number;
    date: string;
    item: string;
    quantity: number;
    unit: string;
    amount: number;
    sector: Sector;
    notes?: string;
}

interface SalesContextType {
    sales: Sale[];
    addSale: (sale: Omit<Sale, 'id'>) => void;
    updateSale: (sale: Sale) => void;
    deleteSale: (id: number) => void;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [sales, setSales] = useState<Sale[]>([]);

    const addSale = (saleData: Omit<Sale, 'id'>) => {
        const newSale = { ...saleData, id: Date.now() };
        setSales(prev => [newSale, ...prev]);
    };

    const updateSale = (updatedSale: Sale) => {
        setSales(prev => prev.map(s => s.id === updatedSale.id ? updatedSale : s));
    };

    const deleteSale = (id: number) => {
        setSales(prev => prev.filter(s => s.id !== id));
    };

    return (
        <SalesContext.Provider value={{ sales, addSale, updateSale, deleteSale }}>
            {children}
        </SalesContext.Provider>
    );
};

export const useSales = () => {
    const context = useContext(SalesContext);
    if (context === undefined) {
        throw new Error('useSales must be used within a SalesProvider');
    }
    return context;
};
