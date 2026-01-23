// NavigationCards - Full-width gradient navigation cards for Dashboard
import React from 'react';
import { TaskIcon, WarningIcon, CalculatorIcon, WalletIcon, ChevronRightIcon } from './icons';
import { SettingsIcon } from './CustomIcons';
import type { Screen } from '../App';

interface NavigationCardsProps {
    onNavigate: (screen: Screen) => void;
    taskCount?: number;
    transactionCount?: number;
    profileCompletion?: number;
}

interface NavCardItem {
    screen: Screen;
    icon: React.FC<{ className?: string }>;
    title: string;
    description: string;
    statusText: string;
    gradient: string;
    iconBg: string;
}

const getNavItems = (taskCount: number, transactionCount: number, profileCompletion: number): NavCardItem[] => [
    {
        screen: 'tasks',
        icon: TaskIcon,
        title: 'TASKS',
        description: 'Manage your daily farm operations. Log feedings and vaccinations.',
        statusText: `${taskCount} tasks remaining today`,
        gradient: 'from-blue-800 to-blue-600',
        iconBg: 'bg-white/20'
    },
    {
        screen: 'calculator',
        icon: CalculatorIcon,
        title: 'PROFITABILITY CALCULATOR',
        description: 'Calculate your margins with ease. Input your feed costs and sales to visualize your ROI and projected monthly earnings.',
        statusText: 'Current Margin: +12%',
        gradient: 'from-teal-700 to-teal-500',
        iconBg: 'bg-white/20'
    },
    {
        screen: 'business',
        icon: WalletIcon,
        title: 'BUSINESS HUB',
        description: 'Track your farm finances. Manage expenses, record sales, and monitor inventory all in one place.',
        statusText: `${transactionCount} new transactions`,
        gradient: 'from-amber-700 to-amber-500',
        iconBg: 'bg-white/20'
    },
    {
        screen: 'settings',
        icon: SettingsIcon,
        title: 'SETTINGS',
        description: 'Customize your farm profile. Manage notifications, calibrate sensor inputs, and adjust your livestock batch details.',
        statusText: `Profile ${profileCompletion}% complete`,
        gradient: 'from-purple-800 to-purple-600',
        iconBg: 'bg-white/20'
    }
];

export default function NavigationCards({
    onNavigate,
    taskCount = 4,
    transactionCount = 3,
    profileCompletion = 80
}: NavigationCardsProps) {
    const navItems = getNavItems(taskCount, transactionCount, profileCompletion);

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-text-primary mb-4">Quick Access</h2>
            {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                    <button
                        key={item.screen}
                        onClick={() => onNavigate(item.screen)}
                        className={`w-full bg-gradient-to-r ${item.gradient} rounded-2xl p-5 
                            hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 
                            shadow-lg hover:shadow-xl group animate-slide-up stagger-${index + 1}
                            backdrop-blur-sm border border-white/10`}
                    >
                        <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.iconBg} shrink-0`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 text-left min-w-0">
                                <h3 className="font-bold text-white text-sm uppercase tracking-wide mb-1">
                                    {item.title}
                                </h3>
                                <p className="text-white/80 text-sm leading-relaxed">
                                    {item.description}
                                </p>
                            </div>

                            {/* Chevron */}
                            <ChevronRightIcon className="w-6 h-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                        </div>

                        {/* Status footer */}
                        <div className="mt-4 pt-3 border-t border-white/20">
                            <div className="flex items-center justify-between">
                                <span className="text-white font-medium text-sm">
                                    {item.statusText}
                                </span>
                                <ChevronRightIcon className="w-4 h-4 text-white/70" />
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
