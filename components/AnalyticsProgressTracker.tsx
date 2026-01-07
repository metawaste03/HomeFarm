import React, { useEffect, useState } from 'react';
import { BatchIcon, CalendarIcon, WalletIcon, SalesIcon } from './icons';

interface ProgressMilestone {
    id: string;
    label: string;
    icon: React.FC<{ className?: string }>;
    current: number;
    required: number;
    encouragement: string;
    completedText: string;
}

interface AnalyticsProgressTrackerProps {
    batches: number;
    dailyLogs: number;
    expenses: number;
    sales: number;
    onAllComplete?: () => void;
}

const AnalyticsProgressTracker: React.FC<AnalyticsProgressTrackerProps> = ({
    batches,
    dailyLogs,
    expenses,
    sales,
    onAllComplete
}) => {
    const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});

    const milestones: ProgressMilestone[] = [
        {
            id: 'batches',
            label: 'Batches',
            icon: BatchIcon,
            current: Math.min(batches, 1),
            required: 1,
            encouragement: 'Create your first batch!',
            completedText: 'Level Complete!'
        },
        {
            id: 'dailyLogs',
            label: 'Daily Logs',
            icon: CalendarIcon,
            current: Math.min(dailyLogs, 7),
            required: 7,
            encouragement: 'Keep logging!',
            completedText: 'Great consistency!'
        },
        {
            id: 'expenses',
            label: 'Expenses Tracked',
            icon: WalletIcon,
            current: Math.min(expenses, 2),
            required: 2,
            encouragement: 'Track your spending!',
            completedText: 'Costs tracked!'
        },
        {
            id: 'sales',
            label: 'Sales Recorded',
            icon: SalesIcon,
            current: Math.min(sales, 1),
            required: 1,
            encouragement: 'Record your first sale!',
            completedText: 'Revenue tracked!'
        }
    ];

    const overallProgress = milestones.reduce((sum, m) => sum + (m.current / m.required), 0) / milestones.length * 100;
    const isComplete = milestones.every(m => m.current >= m.required);

    // Animate values on mount and when they change
    useEffect(() => {
        const newValues: Record<string, number> = {};
        milestones.forEach(m => {
            newValues[m.id] = (m.current / m.required) * 100;
        });

        // Delay animation slightly for visual effect
        const timeout = setTimeout(() => {
            setAnimatedValues(newValues);
        }, 100);

        return () => clearTimeout(timeout);
    }, [batches, dailyLogs, expenses, sales]);

    useEffect(() => {
        if (isComplete && onAllComplete) {
            onAllComplete();
        }
    }, [isComplete, onAllComplete]);

    const ProgressBar: React.FC<{ milestone: ProgressMilestone }> = ({ milestone }) => {
        const percentage = (milestone.current / milestone.required) * 100;
        const isCompleted = milestone.current >= milestone.required;
        const animatedPercentage = animatedValues[milestone.id] || 0;
        const Icon = milestone.icon;

        return (
            <div className={`bg-card rounded-2xl p-4 border border-border transition-all duration-300 ${isCompleted ? 'ring-2 ring-primary/50' : ''}`}>
                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${isCompleted ? 'bg-primary/20' : 'bg-muted'}`}>
                        <Icon className={`w-5 h-5 ${isCompleted ? 'text-primary' : 'text-text-secondary'}`} />
                    </div>
                    <span className="font-bold text-text-primary flex-grow">{milestone.label}</span>
                    <span className={`text-sm font-bold ${isCompleted ? 'text-primary' : 'text-text-secondary'}`}>
                        {milestone.current}/{milestone.required}
                        {isCompleted && ' ✓'}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="relative h-6 bg-muted rounded-full overflow-hidden">
                    <div
                        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${isCompleted
                                ? 'bg-gradient-to-r from-primary to-lime-400 animate-pulse-glow'
                                : 'bg-gradient-to-r from-primary/80 to-primary'
                            }`}
                        style={{ width: `${animatedPercentage}%` }}
                    >
                        {/* Glow effect */}
                        {animatedPercentage > 0 && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        )}
                    </div>

                    {/* Percentage text inside bar */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-xs font-bold ${animatedPercentage > 50 ? 'text-white' : 'text-text-secondary'}`}>
                            {Math.round(percentage)}%
                        </span>
                    </div>
                </div>

                {/* Encouragement text */}
                <p className={`text-xs mt-2 font-medium ${isCompleted ? 'text-primary' : 'text-text-secondary'}`}>
                    {isCompleted ? milestone.completedText : milestone.encouragement}
                </p>
            </div>
        );
    };

    return (
        <div className="bg-background min-h-screen p-4 sm:p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
                    <span className="text-4xl">🔓</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
                    Unlock Your Analytics
                </h1>
                <p className="text-text-secondary max-w-md mx-auto">
                    Complete these milestones to see your farm insights. The more data you log, the smarter your analytics become!
                </p>
            </div>

            {/* Progress Bars */}
            <div className="space-y-4 max-w-lg mx-auto mb-8">
                {milestones.map(milestone => (
                    <ProgressBar key={milestone.id} milestone={milestone} />
                ))}
            </div>

            {/* Overall Progress */}
            <div className="bg-card rounded-2xl p-6 max-w-lg mx-auto border border-border text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-2xl">✨</span>
                    <span className="text-xl font-bold text-text-primary">
                        {Math.round(overallProgress)}% to Full Analytics
                    </span>
                    <span className="text-2xl">✨</span>
                </div>

                {/* Overall progress bar */}
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary via-lime-400 to-green-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${overallProgress}%` }}
                    />
                </div>

                {isComplete && (
                    <div className="mt-4 p-3 bg-primary/10 rounded-xl">
                        <p className="text-primary font-bold">🎉 Analytics Unlocked! Scroll down to view.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsProgressTracker;
