// ActionsScreen - Dedicated tab for viewing and managing all actions
import React, { useState } from 'react';
import { useActions } from '../contexts/ActionsContext';
import { WarningIcon, InfoIcon, CloseIcon, ClockIcon, CheckCircleIcon, ChevronLeftIcon } from './icons';
import type { ActionSeverity, Sector } from '../types/database';
import type { Screen } from '../App';

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

interface ActionsScreenProps {
    onNavigate?: (screen: Screen) => void;
}

export default function ActionsScreen({ onNavigate }: ActionsScreenProps) {
    const { actions, loading, dismissAction, snoozeAction, resolveAction, getActionsBySector } = useActions();
    const [sectorFilter, setSectorFilter] = useState<Sector | 'All'>('All');
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleDismiss = async (actionId: string) => {
        setProcessingId(actionId);
        try {
            await dismissAction(actionId);
        } catch (error) {
            console.error('Failed to dismiss action:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleSnooze = async (actionId: string, hours: number = 24) => {
        setProcessingId(actionId);
        try {
            await snoozeAction(actionId, hours);
        } catch (error) {
            console.error('Failed to snooze action:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleResolve = async (actionId: string) => {
        setProcessingId(actionId);
        try {
            await resolveAction(actionId);
        } catch (error) {
            console.error('Failed to resolve action:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredActions = sectorFilter === 'All'
        ? actions
        : getActionsBySector(sectorFilter as Sector);

    if (loading) {
        return (
            <div className="min-h-screen bg-surface p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="h-8 bg-card rounded w-1/3 mb-4 animate-pulse"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-card rounded animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface">
            {/* Header with Back Button */}
            <div className="bg-card border-b border-border sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3 mb-3">
                        {onNavigate && (
                            <button
                                onClick={() => onNavigate('dashboard')}
                                className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
                                aria-label="Back to Dashboard"
                            >
                                <ChevronLeftIcon className="w-6 h-6 text-text-secondary" />
                            </button>
                        )}
                        <h1 className="text-2xl font-bold text-text">Today's Actions</h1>
                    </div>

                    {/* Sector Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {(['All', 'Layer', 'Broiler', 'Fish'] as const).map(sector => (
                            <button
                                key={sector}
                                onClick={() => setSectorFilter(sector)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${sectorFilter === sector
                                    ? 'bg-primary text-white'
                                    : 'bg-surface text-text-secondary hover:bg-border'
                                    }`}
                            >
                                {sector}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Actions List */}
            <div className="max-w-4xl mx-auto px-4 py-4 pb-24">
                {filteredActions.length === 0 ? (
                    <div className="bg-card rounded-lg p-8 text-center border border-border">
                        <InfoIcon className="w-12 h-12 text-text-secondary mx-auto mb-3" />
                        <h3 className="font-bold text-lg text-text mb-1">All Clear!</h3>
                        <p className="text-text-secondary">
                            {sectorFilter === 'All'
                                ? "No actions needed right now. Great work!"
                                : `No ${sectorFilter} actions at the moment.`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredActions.map(action => {
                            const config = severityConfig[action.rule.severity];
                            const Icon = config.icon;
                            const isProcessing = processingId === action.id;

                            return (
                                <div
                                    key={action.id}
                                    className={`rounded-lg p-4 border-2 ${config.bg} ${isProcessing ? 'opacity-50' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className={`flex-shrink-0 ${config.color}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h4 className="font-bold text-base text-text">
                                                    {action.rule.title}
                                                </h4>
                                                <button
                                                    onClick={() => handleDismiss(action.id)}
                                                    disabled={isProcessing}
                                                    className="flex-shrink-0 p-1 hover:bg-black/10 rounded transition disabled:opacity-50"
                                                    title="Dismiss"
                                                >
                                                    <CloseIcon className="w-4 h-4 text-text-secondary" />
                                                </button>
                                            </div>

                                            <p className="text-sm text-text-secondary mb-2">
                                                {action.rule.description}
                                            </p>

                                            {/* Metadata */}
                                            {action.metadata && Object.keys(action.metadata).length > 0 && (
                                                <div className="text-xs mb-3 bg-surface dark:bg-black/20 rounded px-2 py-1.5 text-text">
                                                    {Object.entries(action.metadata).map(([key, value]) => (
                                                        <div key={key} className="mb-0.5">
                                                            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>{' '}
                                                            <span className="font-mono">{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Tags */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${config.textColor} bg-surface dark:bg-black/30`}>
                                                    {action.rule.severity.toUpperCase()}
                                                </span>
                                                {action.rule.sector && (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-surface dark:bg-black/20 text-text">
                                                        {action.rule.sector}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Action Text */}
                                            <div className="bg-surface dark:bg-black/20 rounded p-3 mb-3 border border-border">
                                                <p className="text-sm font-medium text-text">
                                                    ✅ {action.rule.action_text}
                                                </p>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleResolve(action.id)}
                                                    disabled={isProcessing}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <CheckCircleIcon className="w-4 h-4" />
                                                    Mark Done
                                                </button>
                                                <button
                                                    onClick={() => handleSnooze(action.id, 24)}
                                                    disabled={isProcessing}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-border text-text rounded text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ClockIcon className="w-4 h-4" />
                                                    Snooze 24h
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
