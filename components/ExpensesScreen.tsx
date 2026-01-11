import React, { useMemo } from 'react';
import { Screen } from '../App';
import { WalletIcon, ChevronLeftIcon, BoxIcon } from './icons';
import { useBusiness } from '../contexts/BusinessContext';

interface ExpensesScreenProps {
    onNavigate: (screen: Screen) => void;
}

const ExpensesScreen: React.FC<ExpensesScreenProps> = ({ onNavigate }) => {
    const { inventoryItems, loading } = useBusiness();

    // Aggregate all transactions of type 'purchase' from all inventory items
    const expenses = useMemo(() => {
        const allPurchases: any[] = [];
        inventoryItems.forEach(item => {
            item.transactions.forEach(tx => {
                if (tx.type === 'purchase') {
                    allPurchases.push({
                        ...tx,
                        itemName: item.name,
                        itemCategory: item.category,
                        itemUnit: item.unit
                    });
                }
            });
        });
        // Sort by date desc
        return allPurchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [inventoryItems]);

    const totalExpenses = useMemo(() => {
        return expenses.reduce((sum, sx) => sum + (sx.cost || 0), 0);
    }, [expenses]);

    return (
        <div className="bg-background min-h-screen flex flex-col">
            <header className="bg-card p-4 pt-6 shadow-sm sticky top-0 z-10 flex items-center gap-2">
                <button onClick={() => onNavigate('business')} className="p-2 -ml-2 text-text-secondary hover:text-primary rounded-full" aria-label="Go back to business hub">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div className="flex-grow">
                    <h1 className="text-xl font-bold text-text-primary">Expenses</h1>
                    <p className="text-xs text-text-secondary">Track your farm expenditures</p>
                </div>
            </header>

            <div className="p-4 flex-grow space-y-4">
                {/* Summary Card */}
                <div className="bg-card p-6 rounded-2xl shadow-sm border border-border text-center">
                    <p className="text-xs text-text-secondary font-bold uppercase mb-2">Total Expenses (All Time)</p>
                    <p className="text-3xl font-bold text-danger">
                        {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(totalExpenses)}
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-10">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-text-secondary">Loading expenses...</p>
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="text-center py-10 text-text-secondary bg-card rounded-2xl border border-dashed border-border">
                        <p>No expenses recorded yet.</p>
                        <p className="text-sm mt-2">Log purchases in Inventory to see them here.</p>
                        <button onClick={() => onNavigate('inventory')} className="mt-4 text-primary font-bold hover:underline">
                            Go to Inventory
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold text-text-primary">Transaction History</h3>
                        {expenses.map((expense) => (
                            <div key={expense.id} className="bg-card p-4 rounded-xl shadow-sm flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                            <WalletIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-text-primary text-sm">{expense.itemName}</p>
                                            <p className="text-xs text-text-secondary">
                                                {new Date(expense.date).toLocaleDateString()}
                                                {expense.supplier && ` • ${expense.supplier}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-danger">
                                            - {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(expense.cost || 0)}
                                        </p>
                                        <p className="text-xs text-text-secondary">
                                            {expense.quantity} {expense.itemUnit}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpensesScreen;
