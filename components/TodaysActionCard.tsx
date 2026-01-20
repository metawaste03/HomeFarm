// TodaysActionCard - Dashboard card showing top priority action
import React from 'react';
import { useActions } from '../contexts/ActionsContext';
import { WarningIcon, InfoIcon, ChevronRightIcon, CloseIcon } from './icons';
import type { ActionSeverity } from '../types/database';

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
    const { getTodaysTopAction, loading } = useActions();

    if (loading) {
        return (
            <div className="bg-card rounded-lg p-4 border border-border animate-pulse">
                <div className="h-6 bg-surface rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-surface rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-surface rounded w-1/2"></div>
            </div>
        );
    }

    const topAction = getTodaysTopAction();

    if (!topAction) {
        return (
            <div className="bg-card rounded-lg p-5 border border-border">
                <h3 className="font-bold text-lg mb-2 text-text">Today's Actions</h3>
                <div className="flex items-center gap-2 text-text-secondary">
                    <InfoIcon className="w-5 h-5" />
                    <p className="text-sm">All caught up! No actions needed right now.</p>
                </div>
            </div>
        );
    }

    const config = severityConfig[topAction.rule.severity];
    const Icon = config.icon;

    return (
        <div className={`rounded-lg p-5 border-2 ${config.bg}`}>
            <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg text-text">Today's Action</h3>
                {onViewAll && (
                    <button
                        onClick={onViewAll}
                        className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1"
                    >
                        View All
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex gap-3">
                <div className={`flex-shrink-0 ${config.color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base text-text mb-1">
                        {topAction.rule.title}
                    </h4>
                    <p className="text-sm text-text-secondary mb-2">{topAction.rule.description}</p>

                    {topAction.metadata && Object.keys(topAction.metadata).length > 0 && (
                        <div className="text-xs mb-3 bg-surface dark:bg-black/20 rounded px-2 py-1 text-text">
                            {Object.entries(topAction.metadata).map(([key, value]) => (
                                <span key={key} className="mr-3">
                                    <span className="font-medium">{key}:</span> {String(value)}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${config.textColor} bg-surface dark:bg-black/30`}>
                            {topAction.rule.severity.toUpperCase()}
                        </span>
                        {topAction.rule.sector && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-surface dark:bg-black/20 text-text">
                                {topAction.rule.sector}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/30">
                <p className="text-sm font-medium text-text">
                    ✅ {topAction.rule.action_text}
                </p>
            </div>
        </div>
    );
}
