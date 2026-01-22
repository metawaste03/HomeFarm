// NavigationCards - Vertical stack of navigation cards for Dashboard
import React from 'react';
import { TaskIcon, WarningIcon, CalculatorIcon, WalletIcon, ChevronRightIcon } from './icons';
import { SettingsIcon } from './CustomIcons';
import type { Screen } from '../App';

interface NavigationCardsProps {
    onNavigate: (screen: Screen) => void;
}

interface NavCardItem {
    screen: Screen;
    icon: React.FC<{ className?: string }>;
    title: string;
    description: string;
    iconBg: string;
}

const navItems: NavCardItem[] = [
    {
        screen: 'tasks',
        icon: TaskIcon,
        title: 'Tasks',
        description: 'Manage daily farming tasks',
        iconBg: 'bg-blue-500/20 text-blue-500'
    },
    {
        screen: 'actions',
        icon: WarningIcon,
        title: 'Actions',
        description: 'Review urgent farm alerts',
        iconBg: 'bg-yellow-500/20 text-yellow-500'
    },
    {
        screen: 'calculator',
        icon: CalculatorIcon,
        title: 'Calculator',
        description: 'Profitability calculators',
        iconBg: 'bg-purple-500/20 text-purple-500'
    },
    {
        screen: 'business',
        icon: WalletIcon,
        title: 'Business',
        description: 'Sales & inventory tracking',
        iconBg: 'bg-emerald-500/20 text-emerald-500'
    },
    {
        screen: 'settings',
        icon: SettingsIcon,
        title: 'Settings',
        description: 'App preferences & team',
        iconBg: 'bg-slate-500/20 text-slate-400'
    }
];

export default function NavigationCards({ onNavigate }: NavigationCardsProps) {
    return (
        <div className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary mb-4">Quick Access</h2>
            {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                    <button
                        key={item.screen}
                        onClick={() => onNavigate(item.screen)}
                        className={`w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border 
                            hover:bg-muted hover:border-primary/30 transition-all duration-200 
                            shadow-sm hover:shadow-md group animate-slide-up stagger-${index + 1}`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.iconBg}`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-sm text-text-secondary">{item.description}</p>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </button>
                );
            })}
        </div>
    );
}
