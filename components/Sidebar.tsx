import React from 'react';
import { GridIcon, ClipboardListIcon, BatchIcon, TaskIcon, WalletIcon, SettingsIcon } from './icons';
import { AnalyticsIcon } from './CustomIcons';
import type { Screen } from '../App';

interface SidebarProps {
    currentScreen: Screen;
    onNavigate: (screen: Screen) => void;
    onLogout: () => void;
    userName?: string;
}

interface NavItem {
    screen: Screen;
    label: string;
    icon: React.FC<{ className?: string }>;
}

const navItems: NavItem[] = [
    { screen: 'dashboard', label: 'Dashboard', icon: GridIcon },
    { screen: 'tasks', label: 'Tasks', icon: TaskIcon }, // Merged Log & Task
    { screen: 'batches', label: 'Batches', icon: BatchIcon },
    { screen: 'sales', label: 'Sales', icon: WalletIcon },
    { screen: 'settings', label: 'Settings', icon: SettingsIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onNavigate, onLogout, userName }) => {
    return (
        <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white min-h-screen">
            {/* Logo */}
            <div className="p-6 border-b border-slate-700">
                <h1 className="text-2xl font-bold text-lime-400">🌾 HomeFarm</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentScreen === item.screen;
                    return (
                        <button
                            key={item.screen}
                            onClick={() => onNavigate(item.screen)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-lime-500 text-slate-900 font-semibold'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-lime-500 flex items-center justify-center text-slate-900 font-bold">
                        {userName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{userName || 'Farmer'}</p>
                        <p className="text-xs text-slate-400">Farm Owner</p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
