import React from 'react';
import { BellIcon, WarningIcon, ClockIcon, StethoscopeIcon } from './icons';

interface Notification {
    id: string;
    type: 'warning' | 'info' | 'health';
    title: string;
    message: string;
    time?: string;
}

interface NotificationsPanelProps {
    notifications?: Notification[];
}

const mockNotifications: Notification[] = [
    { id: '1', type: 'warning', title: 'Low Feed Stock', message: 'Only 3 bags remaining. Consider restocking soon.', time: '2h ago' },
    { id: '2', type: 'health', title: 'Vaccination Due', message: 'Newcastle vaccine due for Batch A tomorrow.', time: '5h ago' },
    { id: '3', type: 'info', title: 'Price Alert', message: 'Egg prices up 5% in your area this week.', time: '1d ago' },
];

const iconMap = {
    warning: WarningIcon,
    info: BellIcon,
    health: StethoscopeIcon,
};

const colorMap = {
    warning: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border-l-orange-500',
    info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-l-blue-500',
    health: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-l-red-500',
};

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications = mockNotifications }) => {
    return (
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BellIcon className="w-5 h-5 text-text-secondary" />
                    <h3 className="font-bold text-text-primary">Notifications</h3>
                </div>
                <span className="px-2 py-1 bg-danger text-white text-xs font-bold rounded-full">
                    {notifications.length}
                </span>
            </div>

            <div className="space-y-3">
                {notifications.map((notif) => {
                    const Icon = iconMap[notif.type];
                    const textColors = {
                        warning: 'text-orange-800 dark:text-orange-200',
                        info: 'text-blue-800 dark:text-blue-200',
                        health: 'text-red-800 dark:text-red-200',
                    };
                    const messageColors = {
                        warning: 'text-orange-700 dark:text-orange-300',
                        info: 'text-blue-700 dark:text-blue-300',
                        health: 'text-red-700 dark:text-red-300',
                    };
                    const timeColors = {
                        warning: 'text-orange-600 dark:text-orange-400',
                        info: 'text-blue-600 dark:text-blue-400',
                        health: 'text-red-600 dark:text-red-400',
                    };
                    return (
                        <div
                            key={notif.id}
                            className={`p-3 rounded-lg border-l-4 ${colorMap[notif.type]} cursor-pointer hover:opacity-90 transition-opacity`}
                        >
                            <div className="flex items-start gap-2">
                                <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className={`font-semibold text-sm ${textColors[notif.type]}`}>{notif.title}</p>
                                    <p className={`text-xs mt-0.5 ${messageColors[notif.type]}`}>{notif.message}</p>
                                    {notif.time && (
                                        <p className={`text-xs mt-1 flex items-center gap-1 ${timeColors[notif.type]}`}>
                                            <ClockIcon className="w-3 h-3" />
                                            {notif.time}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button className="w-full mt-4 py-2 text-sm text-primary font-medium hover:underline">
                View All Notifications
            </button>
        </div>
    );
};

export default NotificationsPanel;
