
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Sector = 'Layer' | 'Broiler' | 'Fish';

export interface Farm {
  id: number;
  name: string;
  location?: string;
}

export interface Batch {
  id: number;
  name: string;
  farm: string;
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
  setFarms: React.Dispatch<React.SetStateAction<Farm[]>>;
  setBatches: React.Dispatch<React.SetStateAction<Batch[]>>;
  setActiveFarm: React.Dispatch<React.SetStateAction<Farm | null>>;
  setActiveBatch: React.Dispatch<React.SetStateAction<Batch | null>>;
  setKpiData: React.Dispatch<React.SetStateAction<any>>;
  addFarm: (farm: Omit<Farm, 'id'>) => void;
  updateFarm: (farm: Farm) => void;
  deleteFarm: (id: number) => void;
  addBatch: (batch: Omit<Batch, 'id'>) => void;
  updateBatch: (batch: Batch) => void;
  deleteBatch: (id: number) => void;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [activeFarm, setActiveFarm] = useState<Farm | null>(null);
  const [activeBatch, setActiveBatch] = useState<Batch | null>(null);
  const [kpiData, setKpiData] = useState<any>({});

  const addFarm = (farm: Omit<Farm, 'id'>) => {
    const newFarm = { ...farm, id: Date.now() };
    setFarms(prev => [...prev, newFarm]);
  };

  const updateFarm = (updatedFarm: Farm) => {
    setFarms(prev => prev.map(f => f.id === updatedFarm.id ? updatedFarm : f));
  };

  const deleteFarm = (id: number) => {
    const farmToDelete = farms.find(f => f.id === id);
    if (!farmToDelete) return;
    setFarms(prev => prev.filter(f => f.id !== id));
    setBatches(prev => prev.filter(b => b.farm !== farmToDelete.name));
  };

  const addBatch = (batch: Omit<Batch, 'id'>) => {
    const newBatch = { ...batch, id: Date.now() };
    setBatches(prev => [...prev, newBatch]);
  };

  const updateBatch = (updatedBatch: Batch) => {
    setBatches(prev => prev.map(b => b.id === updatedBatch.id ? updatedBatch : b));
  };

  const deleteBatch = (id: number) => {
    setBatches(prev => prev.filter(b => b.id !== id));
  };

  return (
    <FarmContext.Provider value={{
      farms, batches, activeFarm, activeBatch, kpiData,
      setFarms, setBatches, setActiveFarm, setActiveBatch, setKpiData,
      addFarm, updateFarm, deleteFarm,
      addBatch, updateBatch, deleteBatch
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
