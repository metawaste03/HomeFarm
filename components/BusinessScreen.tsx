
import React from 'react';
import { Screen } from '../App';
import { SalesIcon, BoxIcon, ChevronRightIcon, WalletIcon } from './icons';

interface BusinessScreenProps {
    onNavigate: (screen: Screen) => void;
}

const BusinessScreen: React.FC<BusinessScreenProps> = ({ onNavigate }) => {
    return (
        <div className="bg-background min-h-screen">
            <header className="bg-card p-4 pt-6 shadow-sm sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-center text-text-primary">Business Hub</h1>
            </header>

            <div className="p-4 space-y-4">
                {/* Income & Sales - Now First */}
                <button
                    onClick={() => onNavigate('sales')}
                    className="w-full bg-card rounded-xl shadow-sm p-6 flex items-center justify-between hover:bg-muted transition-colors group"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full text-green-600 dark:text-green-400">
                            <SalesIcon className="w-8 h-8" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-text-primary">Income & Sales</h3>
                            <p className="text-sm text-text-secondary">Track revenue and sales history.</p>
                        </div>
                    </div>
                    <ChevronRightIcon className="w-6 h-6 text-text-secondary group-hover:text-primary transition-colors" />
                </button>

                {/* Expenses */}
                <button
                    onClick={() => onNavigate('expenses')}
                    className="w-full bg-card rounded-xl shadow-sm p-6 flex items-center justify-between hover:bg-muted transition-colors group"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full text-red-600 dark:text-red-400">
                            <WalletIcon className="w-8 h-8" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-text-primary">Expenses</h3>
                            <p className="text-sm text-text-secondary">Track farm expenditures.</p>
                        </div>
                    </div>
                    <ChevronRightIcon className="w-6 h-6 text-text-secondary group-hover:text-primary transition-colors" />
                </button>

                {/* Inventory - Now Third */}
                <button
                    onClick={() => onNavigate('inventory')}
                    className="w-full bg-card rounded-xl shadow-sm p-6 flex items-center justify-between hover:bg-muted transition-colors group"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full text-blue-600 dark:text-blue-400">
                            <BoxIcon className="w-8 h-8" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-text-primary">Inventory</h3>
                            <p className="text-sm text-text-secondary">Manage feed, meds, and supplies.</p>
                        </div>
                    </div>
                    <ChevronRightIcon className="w-6 h-6 text-text-secondary group-hover:text-primary transition-colors" />
                </button>

                {/* Description moved to bottom */}
                <p className="text-center text-sm text-text-secondary pt-4">
                    Manage your farm's operations and finances.
                </p>
            </div>
        </div>
    );
};

export default BusinessScreen;
