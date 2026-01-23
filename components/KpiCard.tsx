import React from 'react';
import AnimatedNumber from './AnimatedNumber';

interface KpiCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    trend?: string;
    accentColor?: 'blue' | 'green' | 'purple' | 'orange' | 'yellow';
    staggerIndex?: number;
    className?: string;
}

const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-lime-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
};

const borderColorClasses = {
    blue: 'border-blue-200 dark:border-blue-800',
    green: 'border-lime-200 dark:border-lime-800',
    purple: 'border-purple-200 dark:border-purple-800',
    orange: 'border-orange-200 dark:border-orange-800',
    yellow: 'border-yellow-200 dark:border-yellow-800',
};

const KpiCard: React.FC<KpiCardProps> = ({
    icon,
    label,
    value,
    trend,
    accentColor = 'green',
    staggerIndex = 0,
    className = ''
}) => {
    const trendColor = trend?.startsWith('+')
        ? 'text-green-500'
        : trend?.startsWith('-')
            ? 'text-red-500'
            : 'text-slate-400';

    // Parse numeric value for animation
    const numericValue = typeof value === 'number' ? value : parseFloat(value.replace(/[^0-9.-]/g, ''));
    const isNumeric = !isNaN(numericValue);
    const prefix = typeof value === 'string' ? value.match(/^[^0-9]*/)?.[0] || '' : '';

    return (
        <div
            className={`bg-card rounded-2xl shadow-md border-2 ${borderColorClasses[accentColor]} overflow-hidden card-hover animate-slide-up opacity-0 stagger-${staggerIndex + 1} ${className} [animation-fill-mode:forwards] hover:shadow-lg transition-shadow duration-200`}
        >
            {/* Accent bar */}
            <div className={`h-1.5 ${colorClasses[accentColor]}`} />

            <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${colorClasses[accentColor]} bg-opacity-10`}>
                        {icon}
                    </div>
                    <span className="text-sm font-medium text-text-secondary uppercase tracking-wide">
                        {label}
                    </span>
                </div>

                <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold text-text-primary">
                        {isNumeric ? (
                            <>
                                {prefix}
                                <AnimatedNumber
                                    value={numericValue}
                                    duration={800}
                                />
                            </>
                        ) : (
                            value
                        )}
                    </span>
                    {trend && (
                        <span className={`text-sm font-semibold flex items-center gap-0.5 ${trendColor}`}>
                            {trend.startsWith('+') && parseFloat(trend) !== 0 && (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                            {trend.startsWith('-') && parseFloat(trend) !== 0 && (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                            {trend}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KpiCard;
