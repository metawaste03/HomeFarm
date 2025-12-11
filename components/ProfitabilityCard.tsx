
import React, { useState, useEffect } from 'react';
import { WarningIcon, CheckCircleIcon, CalculatorIcon, NairaIcon } from './icons';
import type { Batch, Sector } from './BatchManagementScreen';

interface ProfitabilityCardProps {
    batch: Batch;
    expenses: number;
    mortality: number;
    production?: number; // Total eggs for layers
    stockCost: number;
}

const ProfitabilityCard: React.FC<ProfitabilityCardProps> = ({ batch, expenses, mortality, production = 0, stockCost }) => {
    const [marketPrice, setMarketPrice] = useState<number>(0);
    const [breakEvenPrice, setBreakEvenPrice] = useState<number>(0);
    const [costPerUnit, setCostPerUnit] = useState<number>(0);

    const isLayer = batch.sector === 'Layer';
    const liveStock = batch.stockCount - mortality;

    useEffect(() => {
        if (isLayer) {
            // Logic for Layers: Cost per Crate
            // Formula: Total Expenses / (Total Eggs / 30) = Cost per Crate
            const cratesProduced = production > 0 ? production / 30 : 0;
            const cpc = cratesProduced > 0 ? expenses / cratesProduced : 0;
            // Assuming stock cost is depreciated or handled separately, but simple model: Total Cost / Crates
            // User requested: (Total Expenses) / (Total Eggs / 30)
            setCostPerUnit(cpc);
        } else {
            // Logic for Broiler/Fish: Break-Even Price
            // Formula: (Cost of Stock + Total Expenses) / (Initial Stock - Total Mortality)
            if (liveStock > 0) {
                const totalCost = stockCost + expenses;
                const bep = totalCost / liveStock;
                setBreakEvenPrice(bep);
            }
        }
    }, [batch, expenses, mortality, production, stockCost, liveStock, isLayer]);

    const isProfitable = marketPrice > (isLayer ? costPerUnit : breakEvenPrice);
    const hasInputPrice = marketPrice > 0;

    return (
        <div className="bg-card rounded-2xl shadow-md p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <CalculatorIcon className="w-6 h-6 text-primary" />
                <h3 className="font-bold text-lg text-text-primary">Profitability Indicator</h3>
            </div>

            <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-sm text-text-secondary uppercase font-bold mb-1">
                    {isLayer ? 'Production Cost (Per Crate)' : 'Break-Even Price (Per Animal)'}
                </p>
                <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-text-secondary">₦</span>
                    <span className="text-3xl font-extrabold text-text-primary">
                        {(isLayer ? costPerUnit : breakEvenPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                </div>
                {!isLayer && <p className="text-xs text-text-secondary mt-1">Based on {liveStock.toLocaleString()} live stock.</p>}
            </div>

            <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Current Market Price (₦)</label>
                <div className="relative">
                    <NairaIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                    <input
                        type="number"
                        value={marketPrice > 0 ? marketPrice : ''}
                        onChange={(e) => setMarketPrice(parseInt(e.target.value) || 0)}
                        placeholder="Enter current price..."
                        className="w-full pl-10 p-3 border border-border rounded-xl bg-background text-text-primary font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            {hasInputPrice && (
                <div className={`p-3 rounded-xl flex items-center gap-3 animate-fade-in ${isProfitable ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <div className={`p-2 rounded-full ${isProfitable ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300' : 'bg-red-200 dark:bg-red-800 text-danger dark:text-red-300'}`}>
                        {isProfitable ? <CheckCircleIcon className="w-5 h-5" /> : <WarningIcon className="w-5 h-5" />}
                    </div>
                    <div>
                        <p className={`font-bold ${isProfitable ? 'text-green-700 dark:text-green-300' : 'text-danger dark:text-red-300'}`}>
                            {isProfitable ? 'Profitable' : 'Loss Warning'}
                        </p>
                        <p className="text-xs text-text-secondary">
                            {isProfitable
                                ? `You are making approx. ₦${(marketPrice - (isLayer ? costPerUnit : breakEvenPrice)).toLocaleString()} profit per unit.`
                                : `You are losing approx. ₦${((isLayer ? costPerUnit : breakEvenPrice) - marketPrice).toLocaleString()} per unit.`
                            }
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfitabilityCard;
