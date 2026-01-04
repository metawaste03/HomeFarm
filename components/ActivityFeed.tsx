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
}

const mockActivities: Activity[] = [
    { id: '1', type: 'log', title: 'Daily Log Added', description: 'Recorded feed and production data', timestamp: '10 min ago' },
    { id: '2', type: 'sale', title: 'Sale Recorded', description: '50 crates of eggs sold', timestamp: '1 hour ago' },
    { id: '3', type: 'task', title: 'Task Completed', description: 'Cleaned water troughs', timestamp: '2 hours ago' },
    { id: '4', type: 'log', title: 'Daily Log Added', description: 'Morning inspection done', timestamp: '5 hours ago' },
];

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

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities = mockActivities }) => {
    return (
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text-primary">Recent Activity</h3>
                <button className="text-sm text-primary font-medium hover:underline">
                    View All
                </button>
            </div>

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
        </div>
    );
};

export default ActivityFeed;
