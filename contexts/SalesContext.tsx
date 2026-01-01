import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { salesService } from '../services/database';
import { useAuth } from './AuthContext';
import { useFarm, Sector } from './FarmContext';
import type { Tables } from '../types/database';

export interface Sale {
    id: string;
    date: string;
    item: string;
    quantity: number;
    unit: string;
    amount: number;
    sector: Sector;
    notes?: string;
    farmId?: string;
}

interface SalesContextType {
    sales: Sale[];
    loading: boolean;
    error: string | null;
    addSale: (sale: Omit<Sale, 'id'>) => Promise<void>;
    updateSale: (sale: Sale) => Promise<void>;
    deleteSale: (id: string) => Promise<void>;
    refreshSales: () => Promise<void>;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

// Helper to convert database sale to app sale
const dbSaleToAppSale = (dbSale: Tables<'sales'>): Sale => ({
    id: dbSale.id,
    date: dbSale.sale_date,
    item: dbSale.item,
    quantity: dbSale.quantity,
    unit: dbSale.unit,
    amount: Number(dbSale.amount),
    sector: dbSale.sector as Sector,
    notes: dbSale.notes || undefined,
    farmId: dbSale.farm_id,
});

export const SalesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { farms } = useFarm();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshSales = useCallback(async () => {
        if (!user || farms.length === 0) {
            setSales([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const dbSales = await salesService.list();
            const appSales = dbSales.map(dbSaleToAppSale);
            setSales(appSales);
        } catch (err) {
            console.error('Error fetching sales:', err);
            setError('Failed to load sales. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [user, farms]);

    useEffect(() => {
        refreshSales();
    }, [refreshSales]);

    const addSale = async (saleData: Omit<Sale, 'id'>) => {
        if (!user) return;

        const farmId = saleData.farmId || farms[0]?.id;
        if (!farmId) {
            throw new Error('No farm available. Please create a farm first.');
        }

        try {
            const dbSale = await salesService.create({
                farm_id: String(farmId),
                sale_date: saleData.date,
                item: saleData.item,
                quantity: saleData.quantity,
                unit: saleData.unit,
                amount: saleData.amount,
                sector: saleData.sector,
                notes: saleData.notes || null,
                created_by: user.id,
            });

            const sale = dbSaleToAppSale(dbSale);
            setSales(prev => [sale, ...prev]);
        } catch (err) {
            console.error('Error adding sale:', err);
            throw err;
        }
    };

    const updateSale = async (updatedSale: Sale) => {
        try {
            await salesService.update(updatedSale.id, {
                sale_date: updatedSale.date,
                item: updatedSale.item,
                quantity: updatedSale.quantity,
                unit: updatedSale.unit,
                amount: updatedSale.amount,
                sector: updatedSale.sector,
                notes: updatedSale.notes || null,
            });
            setSales(prev => prev.map(s => s.id === updatedSale.id ? updatedSale : s));
        } catch (err) {
            console.error('Error updating sale:', err);
            throw err;
        }
    };

    const deleteSale = async (id: string) => {
        try {
            await salesService.delete(id);
            setSales(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error('Error deleting sale:', err);
            throw err;
        }
    };

    return (
        <SalesContext.Provider value={{
            sales,
            loading,
            error,
            addSale,
            updateSale,
            deleteSale,
            refreshSales,
        }}>
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
