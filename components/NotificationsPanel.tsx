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

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications = [] }) => {
    const hasNotifications = notifications.length > 0;

    return (
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BellIcon className="w-5 h-5 text-text-secondary" />
                    <h3 className="font-bold text-text-primary">Notifications</h3>
                </div>
                {hasNotifications && (
                    <span className="px-2 py-1 bg-danger text-white text-xs font-bold rounded-full">
                        {notifications.length}
                    </span>
                )}
            </div>

            {hasNotifications ? (
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
            ) : (
                // Empty state for new users
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BellIcon className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="font-semibold text-text-primary mb-2">You're all caught up! ✨</h4>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        Smart alerts will appear here when you need to take action — like low feed stock or upcoming vaccinations.
                    </p>
                </div>
            )}

            {hasNotifications && (
                <button className="w-full mt-4 py-2 text-sm text-primary font-medium hover:underline">
                    View All Notifications
                </button>
            )}
        </div>
    );
};

export default NotificationsPanel;
