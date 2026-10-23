import type { Sector } from '../types/database';

// Single list of farm sectors the app knows about. Only `enabled` sectors are
// shown in tabs, onboarding and calculators. To launch a new sector (e.g. fish,
// cassava, soybeans), build its log screen and KPIs, then set enabled: true.
// Existing data for disabled sectors stays in the database untouched.

export type SectorGroup = 'poultry' | 'aquaculture' | 'crop';

export interface SectorConfig {
    id: Sector;
    label: string;          // plural, for tabs: "Layers"
    longLabel: string;      // for pickers: "Layer (Eggs)"
    group: SectorGroup;
    stockUnit: string;      // what a batch counts: birds, fish, plants
    enabled: boolean;
}

export const SECTORS: SectorConfig[] = [
    { id: 'Layer', label: 'Layers', longLabel: 'Layer (Eggs)', group: 'poultry', stockUnit: 'birds', enabled: true },
    { id: 'Broiler', label: 'Broilers', longLabel: 'Broiler (Meat)', group: 'poultry', stockUnit: 'birds', enabled: true },
    // Hidden during the poultry-only pilot. Code and data are kept for later.
    { id: 'Fish', label: 'Fish', longLabel: 'Aquaculture', group: 'aquaculture', stockUnit: 'fish', enabled: false },
    // Planned (not yet in the database enum): Cassava, Soybean — group 'crop', stockUnit 'plants'/'hectares'.
];

export const ENABLED_SECTORS = SECTORS.filter(s => s.enabled);

export const isSectorEnabled = (id: Sector): boolean =>
    SECTORS.some(s => s.id === id && s.enabled);

export const sectorConfig = (id: Sector): SectorConfig | undefined =>
    SECTORS.find(s => s.id === id);

export const stockUnitFor = (id: Sector): string => sectorConfig(id)?.stockUnit ?? 'birds';
