import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { farmsService, batchesService } from '../services/database';
import { useAuth } from './AuthContext';
import type { Tables } from '../types/database';

export type Sector = 'Layer' | 'Broiler' | 'Fish';

// Extended types that include farm name for backwards compatibility
// ID is string | number to support both legacy components (number) and Supabase (UUID string)
export interface Farm {
  id: string | number;
  name: string;
  location?: string;
}

export interface Batch {
  id: string | number;
  name: string;
  farm: string; // Farm name for backwards compatibility
  farmId?: string; // Farm UUID for database (optional for backwards compat)
  status: 'Active' | 'Completed';
  stockCount: number;
  age: string;
  sector: Sector;
  scheduleId?: string;
}

interface FarmContextType {
  farms: Farm[];
  batches: Batch[];
  activeFarm: Farm | null;
  activeBatch: Batch | null;
  kpiData: any;
  loading: boolean;
  error: string | null;
  setActiveFarm: React.Dispatch<React.SetStateAction<Farm | null>>;
  setActiveBatch: React.Dispatch<React.SetStateAction<Batch | null>>;
  setKpiData: React.Dispatch<React.SetStateAction<any>>;
  addFarm: (farm: Omit<Farm, 'id'>) => Promise<void>;
  updateFarm: (farm: Farm) => Promise<void>;
  deleteFarm: (id: string | number) => Promise<void>;
  addBatch: (batch: Omit<Batch, 'id'>) => Promise<void>;
  updateBatch: (batch: Batch) => Promise<void>;
  deleteBatch: (id: string | number) => Promise<void>;
  refreshData: () => Promise<void>;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

// Helper to convert database farm to app farm
const dbFarmToAppFarm = (dbFarm: Tables<'farms'>): Farm => ({
  id: dbFarm.id,
  name: dbFarm.name,
  location: dbFarm.location || undefined,
});

// Helper to convert database batch to app batch
const dbBatchToAppBatch = (dbBatch: Tables<'batches'>, farmName: string): Batch => ({
  id: dbBatch.id,
  name: dbBatch.name,
  farm: farmName,
  farmId: dbBatch.farm_id,
  status: dbBatch.status as 'Active' | 'Completed',
  stockCount: dbBatch.stock_count,
  age: dbBatch.age || '',
  sector: dbBatch.sector as Sector,
  scheduleId: dbBatch.schedule_id || undefined,
});

export const FarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [activeFarm, setActiveFarm] = useState<Farm | null>(null);
  const [activeBatch, setActiveBatch] = useState<Batch | null>(null);
  const [kpiData, setKpiData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data from Supabase
  const refreshData = useCallback(async () => {
    if (!user) {
      setFarms([]);
      setBatches([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch farms
      const dbFarms = await farmsService.list();
      const appFarms = dbFarms.map(dbFarmToAppFarm);
      setFarms(appFarms);

      // Create farm name lookup
      const farmNameMap = new Map(dbFarms.map(f => [f.id, f.name]));

      // Fetch batches
      const dbBatches = await batchesService.list();
      const appBatches = dbBatches.map(b =>
        dbBatchToAppBatch(b, farmNameMap.get(b.farm_id) || 'Unknown Farm')
      );
      setBatches(appBatches);
    } catch (err) {
      console.error('Error fetching farm data:', err);
      setError('Failed to load farm data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load data on mount and when user changes
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addFarm = async (farm: Omit<Farm, 'id'>) => {
    if (!user) return;

    try {
      const newFarm = await farmsService.create({
        name: farm.name,
        location: farm.location || null,
        owner_id: user.id,
      });
      setFarms(prev => [dbFarmToAppFarm(newFarm), ...prev]);
    } catch (err: any) {
      console.error('Error adding farm:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      console.error('User ID:', user.id);
      throw err;
    }
  };

  const updateFarm = async (updatedFarm: Farm) => {
    try {
      await farmsService.update(String(updatedFarm.id), {
        name: updatedFarm.name,
        location: updatedFarm.location || null,
      });
      setFarms(prev => prev.map(f => f.id === updatedFarm.id ? updatedFarm : f));
    } catch (err) {
      console.error('Error updating farm:', err);
      throw err;
    }
  };

  const deleteFarm = async (id: string | number) => {
    try {
      await farmsService.delete(String(id));
      const farmToDelete = farms.find(f => f.id === id);
      setFarms(prev => prev.filter(f => f.id !== id));
      // Also remove batches associated with this farm
      if (farmToDelete) {
        setBatches(prev => prev.filter(b => b.farm !== farmToDelete.name));
      }
    } catch (err) {
      console.error('Error deleting farm:', err);
      throw err;
    }
  };

  const addBatch = async (batch: Omit<Batch, 'id'>) => {
    if (!user) return;

    // Find farm ID from farm name
    const farm = farms.find(f => f.name === batch.farm);
    if (!farm) {
      throw new Error('Farm not found');
    }

    try {
      const newBatch = await batchesService.create({
        farm_id: String(farm.id),
        name: batch.name,
        sector: batch.sector,
        status: batch.status,
        stock_count: batch.stockCount,
        age: batch.age || null,
        schedule_id: batch.scheduleId || null,
      });
      setBatches(prev => [dbBatchToAppBatch(newBatch, batch.farm), ...prev]);
    } catch (err) {
      console.error('Error adding batch:', err);
      throw err;
    }
  };

  const updateBatch = async (updatedBatch: Batch) => {
    try {
      await batchesService.update(String(updatedBatch.id), {
        name: updatedBatch.name,
        sector: updatedBatch.sector,
        status: updatedBatch.status,
        stock_count: updatedBatch.stockCount,
        age: updatedBatch.age || null,
        schedule_id: updatedBatch.scheduleId || null,
      });
      setBatches(prev => prev.map(b => b.id === updatedBatch.id ? updatedBatch : b));
    } catch (err) {
      console.error('Error updating batch:', err);
      throw err;
    }
  };

  const deleteBatch = async (id: string | number) => {
    try {
      await batchesService.delete(String(id));
      setBatches(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Error deleting batch:', err);
      throw err;
    }
  };

  return (
    <FarmContext.Provider value={{
      farms,
      batches,
      activeFarm,
      activeBatch,
      kpiData,
      loading,
      error,
      setActiveFarm,
      setActiveBatch,
      setKpiData,
      addFarm,
      updateFarm,
      deleteFarm,
      addBatch,
      updateBatch,
      deleteBatch,
      refreshData,
    }}>
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
