import React from 'react';
import { ClipboardListIcon, WalletIcon, TaskIcon, ClockIcon } from './icons';

interface Activity {
    id: string;
    type: 'log' | 'sale' | 'task';
    title: string;
    description: string;
    timestamp: string;
}

interface ActivityFeedProps {
    activities?: Activity[];
    onNavigate?: (screen: string) => void;
}

const iconMap = {
    log: ClipboardListIcon,
    sale: WalletIcon,
    task: TaskIcon,
};

const colorMap = {
    log: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    sale: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    task: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities = [], onNavigate }) => {
    const hasActivities = activities.length > 0;

    return (
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text-primary">Recent Activity</h3>
                {hasActivities && (
                    <button className="text-sm text-primary font-medium hover:underline">
                        View All
                    </button>
                )}
            </div>

            {hasActivities ? (
                <div className="space-y-3">
                    {activities.map((activity) => {
                        const Icon = iconMap[activity.type];
                        return (
                            <div key={activity.id} className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg flex-shrink-0 ${colorMap[activity.type]}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-text-primary">{activity.title}</p>
                                    <p className="text-xs text-text-secondary truncate">{activity.description}</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-text-secondary flex-shrink-0">
                                    <ClockIcon className="w-3 h-3" />
                                    <span>{activity.timestamp}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                // Empty state for new users
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClipboardListIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-text-primary mb-2">No activity yet</h4>
                    <p className="text-sm text-text-secondary leading-relaxed mb-4">
                        Your daily logs, sales, and tasks will show up here as you use the app.
                    </p>
                    {onNavigate && (
                        <button
                            onClick={() => onNavigate('log')}
                            className="text-sm font-semibold text-primary hover:underline"
                        >
                            Log your first activity →
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ActivityFeed;
