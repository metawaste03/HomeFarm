// TodaysActionCard - Dashboard card with red gradient showing top priority action
import React from 'react';
import { useActions } from '../contexts/ActionsContext';
import { WarningIcon, InfoIcon, ChevronRightIcon, CloseIcon } from './icons';
import type { ActionSeverity } from '../types/database';

// Lightning bolt icon for the card
const LightningIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
);

interface TodaysActionCardProps {
    onViewAll?: () => void;
}

const severityConfig: Record<ActionSeverity, { icon: React.FC<{ className?: string }>; color: string; bg: string; textColor: string }> = {
    critical: {
        icon: CloseIcon,
        color: 'text-red-500',
        bg: 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700',
        textColor: 'text-red-800 dark:text-red-200'
    },
    warning: {
        icon: WarningIcon,
        color: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
        textColor: 'text-yellow-800 dark:text-yellow-200'
    },
    info: {
        icon: InfoIcon,
        color: 'text-blue-500 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
        textColor: 'text-blue-800 dark:text-blue-200'
    }
};

export default function TodaysActionCard({ onViewAll }: TodaysActionCardProps) {
    const { getTodaysTopAction, actions, loading } = useActions();

    // Count urgent alerts (critical + warning)
    const urgentCount = actions.filter(a =>
        a.rule.severity === 'critical' || a.rule.severity === 'warning'
    ).length;

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-red-900 to-red-700 rounded-2xl p-5 animate-pulse shadow-lg">
                <div className="h-6 bg-white/20 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-white/20 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-white/20 rounded w-1/2"></div>
            </div>
        );
    }

    const topAction = getTodaysTopAction();

    // No actions state - still show the card with neutral message
    if (!topAction) {
        return (
            <button
                onClick={onViewAll}
                className="w-full bg-gradient-to-r from-red-900 to-red-700 rounded-2xl p-5 
                    hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 
                    shadow-lg hover:shadow-xl group backdrop-blur-sm border border-white/10"
            >
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20 shrink-0">
                        <LightningIcon className="w-7 h-7 text-yellow-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-left min-w-0">
                        <h3 className="font-bold text-white text-sm uppercase tracking-wide mb-1">
                            TODAY'S ACTION
                        </h3>
                        <p className="text-white/80 text-sm leading-relaxed">
                            All caught up! No urgent actions needed right now. Check back later for updates.
                        </p>
                    </div>

                    {/* Chevron */}
                    <ChevronRightIcon className="w-6 h-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>

                {/* Status footer */}
                <div className="mt-4 pt-3 border-t border-white/20">
                    <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold uppercase">
                            ✓ All Clear
                        </span>
                        <ChevronRightIcon className="w-4 h-4 text-white/70" />
                    </div>
                </div>
            </button>
        );
    }

    return (
        <button
            onClick={onViewAll}
            className="w-full bg-gradient-to-r from-red-900 to-red-700 rounded-2xl p-5 
                hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 
                shadow-lg hover:shadow-xl group backdrop-blur-sm border border-white/10
                text-left"
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20 shrink-0">
                    <LightningIcon className="w-7 h-7 text-yellow-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wide mb-1">
                        TODAY'S ACTION
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                        Immediate insights based on your latest logs. See real-time alerts for water pH levels or poultry temperature fluctuations.
                    </p>
                </div>

                {/* Chevron */}
                <ChevronRightIcon className="w-6 h-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 mt-1" />
            </div>

            {/* Status footer */}
            <div className="mt-4 pt-3 border-t border-white/20">
                <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold uppercase tracking-wide">
                        {urgentCount} URGENT ALERT{urgentCount !== 1 ? 'S' : ''}
                    </span>
                    <ChevronRightIcon className="w-4 h-4 text-white/70" />
                </div>
            </div>
        </button>
    );
}
