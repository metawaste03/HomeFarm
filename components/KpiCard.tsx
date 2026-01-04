import React from 'react';
import AnimatedNumber from './AnimatedNumber';

interface KpiCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    trend?: string;
    accentColor?: 'blue' | 'green' | 'purple' | 'orange';
    staggerIndex?: number;
}

const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-lime-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
};

const KpiCard: React.FC<KpiCardProps> = ({
    icon,
    label,
    value,
    trend,
    accentColor = 'green',
    staggerIndex = 0
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
            className={`bg-card rounded-2xl shadow-sm border border-border overflow-hidden card-hover animate-slide-up opacity-0 stagger-${staggerIndex + 1}`}
            style={{ animationFillMode: 'forwards' }}
        >
            {/* Accent bar */}
            <div className={`h-1 ${colorClasses[accentColor]}`} />

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
                        <span className={`text-sm font-semibold ${trendColor}`}>
                            {trend}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KpiCard;
