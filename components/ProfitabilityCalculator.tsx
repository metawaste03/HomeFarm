import React, { useState, useMemo } from 'react';
import { NairaIcon, CalculatorIcon } from './icons';
import { Sector } from '../contexts/FarmContext';

interface ProfitabilityCalculatorProps {
    sector: Sector;
}

const ProfitabilityCalculator: React.FC<ProfitabilityCalculatorProps> = ({ sector }) => {
    const [stockCount, setStockCount] = useState<number>(1000);
    const [feedCostPerBag, setFeedCostPerBag] = useState<number>(15000);
    const [bagsUsed, setBagsUsed] = useState<number>(5);
    const [otherExpenses, setOtherExpenses] = useState<number>(20000);
    const [sellingPrice, setSellingPrice] = useState<number>(
        sector === 'Layer' ? 50 : sector === 'Broiler' ? 4500 : 2000
    );
    const [outputPerUnit, setOutputPerUnit] = useState<number>(
        sector === 'Layer' ? 280 : sector === 'Broiler' ? 1 : 1
    );

    const calculations = useMemo(() => {
        const totalFeedCost = feedCostPerBag * bagsUsed;
        const totalCosts = totalFeedCost + otherExpenses;
        const totalOutput = sector === 'Layer'
            ? stockCount * (outputPerUnit / 30) // eggs per day average
            : stockCount * outputPerUnit;
        const totalRevenue = totalOutput * sellingPrice;
        const profit = totalRevenue - totalCosts;
        const breakEvenPrice = totalOutput > 0 ? totalCosts / totalOutput : 0;
        const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

        return {
            totalCosts,
            totalRevenue,
            profit,
            breakEvenPrice,
            profitMargin,
            totalOutput,
        };
    }, [stockCount, feedCostPerBag, bagsUsed, otherExpenses, sellingPrice, outputPerUnit, sector]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);

    const getOutputLabel = () => {
        switch (sector) {
            case 'Layer': return 'Eggs per month (per bird)';
            case 'Broiler': return 'Birds ready for sale';
            case 'Fish': return 'Fish ready for harvest';
        }
    };

    const getPriceLabel = () => {
        switch (sector) {
            case 'Layer': return 'Price per egg (₦)';
            case 'Broiler': return 'Price per bird (₦)';
            case 'Fish': return 'Price per fish (₦)';
        }
    };

    return (
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <CalculatorIcon className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-text-primary">Profitability Calculator</h3>
                    <p className="text-sm text-text-secondary">Estimate your {sector.toLowerCase()} profits</p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                        Stock Count
                    </label>
                    <input
                        type="number"
                        value={stockCount}
                        onChange={(e) => setStockCount(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-muted rounded-lg text-text-primary border border-border focus:border-primary focus:outline-none"
                        aria-label="Stock Count"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                        Feed Cost (per bag ₦)
                    </label>
                    <input
                        type="number"
                        value={feedCostPerBag}
                        onChange={(e) => setFeedCostPerBag(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-muted rounded-lg text-text-primary border border-border focus:border-primary focus:outline-none"
                        aria-label="Feed Cost per bag"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                        Bags Used
                    </label>
                    <input
                        type="number"
                        value={bagsUsed}
                        onChange={(e) => setBagsUsed(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-muted rounded-lg text-text-primary border border-border focus:border-primary focus:outline-none"
                        aria-label="Bags Used"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                        Other Expenses (₦)
                    </label>
                    <input
                        type="number"
                        value={otherExpenses}
                        onChange={(e) => setOtherExpenses(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-muted rounded-lg text-text-primary border border-border focus:border-primary focus:outline-none"
                        aria-label="Other Expenses"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                        {getOutputLabel()}
                    </label>
                    <input
                        type="number"
                        value={outputPerUnit}
                        onChange={(e) => setOutputPerUnit(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-muted rounded-lg text-text-primary border border-border focus:border-primary focus:outline-none"
                        aria-label={getOutputLabel()}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                        {getPriceLabel()}
                    </label>
                    <input
                        type="number"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-muted rounded-lg text-text-primary border border-border focus:border-primary focus:outline-none"
                        aria-label={getPriceLabel()}
                    />
                </div>
            </div>

            {/* Results - Enhanced with depth and visual appeal */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-4 shadow-inner">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-lime-400/20 to-green-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="grid grid-cols-2 gap-3 relative">
                    <div className="bg-card p-3 rounded-xl shadow-md border border-border text-center">
                        <p className="text-xs text-text-secondary uppercase mb-1 font-medium">Total Costs</p>
                        <p className="text-lg font-bold text-red-500 truncate">{formatCurrency(calculations.totalCosts)}</p>
                    </div>
                    <div className="bg-card p-3 rounded-xl shadow-md border border-border text-center">
                        <p className="text-xs text-text-secondary uppercase mb-1 font-medium">Revenue</p>
                        <p className="text-lg font-bold text-blue-500 truncate">{formatCurrency(calculations.totalRevenue)}</p>
                    </div>
                    <div className={`p-3 rounded-xl shadow-lg text-center ${calculations.profit >= 0
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                        : 'bg-gradient-to-br from-red-500 to-rose-600 text-white'
                        }`}>
                        <p className="text-xs uppercase mb-1 font-medium opacity-90">Net Profit</p>
                        <p className="text-lg font-bold truncate">{formatCurrency(calculations.profit)}</p>
                        {calculations.profit >= 0 && <span className="text-xs">🎉</span>}
                    </div>
                    <div className="bg-card p-3 rounded-xl shadow-md border border-border text-center">
                        <p className="text-xs text-text-secondary uppercase mb-1 font-medium">Break-even</p>
                        <p className="text-lg font-bold text-purple-500 truncate">₦{calculations.breakEvenPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                </div>

                {/* Motivational message based on profit */}
                {calculations.profit > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-lime-50 to-green-50 dark:from-lime-900/30 dark:to-green-900/30 rounded-xl border border-lime-300 dark:border-lime-800">
                        <p className="text-center font-medium text-lime-700 dark:text-lime-400">
                            ✨ At these numbers, you're on track for a <span className="font-bold">{calculations.profitMargin.toFixed(1)}% profit margin!</span>
                        </p>
                        <p className="text-center text-sm text-lime-600 dark:text-lime-500 mt-1">
                            Your break-even price is {formatCurrency(calculations.breakEvenPrice)} per unit. Sell above this to secure your profit.
                        </p>
                    </div>
                )}

                {calculations.profit < 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 rounded-xl border border-red-300 dark:border-red-800">
                        <p className="text-center font-medium text-red-700 dark:text-red-400">
                            📊 These numbers show a potential loss. Consider adjusting inputs.
                        </p>
                        <p className="text-center text-sm text-red-600 dark:text-red-500 mt-1">
                            Try reducing costs, increasing output, or raising your selling price.
                        </p>
                    </div>
                )}
            </div>

            {/* Disclaimer */}
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-400 text-center flex items-center justify-center gap-2">
                    <span>⚠️</span>
                    <span><strong>Disclaimer:</strong> These projections are estimates based on your inputs. Market prices, disease, weather, and unforeseen factors can affect actual results. Always plan for contingencies.</span>
                </p>
            </div>
        </div>
    );
};

export default ProfitabilityCalculator;
