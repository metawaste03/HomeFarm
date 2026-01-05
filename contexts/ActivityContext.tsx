import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { dailyLogsService } from '../services/database';
import { useAuth } from './AuthContext';
import { useFarm } from './FarmContext';

export interface Activity {
    id: string;
    type: 'log' | 'sale' | 'task';
    title: string;
    description: string;
    timestamp: string;
}

interface ActivityContextType {
    activities: Activity[];
    loading: boolean;
    refreshActivities: () => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

// Helper to format time ago
const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
};

export const ActivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { farms } = useFarm();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(false);

    const refreshActivities = useCallback(async () => {
        if (!user || farms.length === 0) {
            setActivities([]);
            return;
        }

        setLoading(true);
        try {
            // Fetch recent daily logs from all farms
            const allActivities: Activity[] = [];

            for (const farm of farms) {
                try {
                    const logs = await dailyLogsService.list(String(farm.id));

                    // Convert logs to activities
                    for (const log of logs.slice(0, 5)) { // Only last 5 per farm
                        const activities = log.activities as Record<string, any> | null;
                        const sector = activities?.sector || 'Unknown';

                        let description = 'Daily log recorded';
                        if (activities) {
                            const parts: string[] = [];
                            if (activities.eggCollection?.total > 0) {
                                parts.push(`${activities.eggCollection.total} eggs`);
                            }
                            if (activities.feed?.kg > 0) {
                                parts.push(`${activities.feed.kg}kg feed`);
                            }
                            if (activities.mortality > 0) {
                                parts.push(`${activities.mortality} mortality`);
                            }
                            if (parts.length > 0) {
                                description = parts.join(', ');
                            }
                        }

                        allActivities.push({
                            id: log.id,
                            type: 'log',
                            title: `${sector} Log - ${farm.name}`,
                            description,
                            timestamp: formatTimeAgo(log.created_at),
                        });
                    }
                } catch (err) {
                    console.warn(`Failed to fetch logs for farm ${farm.name}:`, err);
                }
            }

            // Sort by created_at (most recent first) and limit to 10
            setActivities(allActivities.slice(0, 10));
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    }, [user, farms]);

    // Auto-refresh when user or farms change
    useEffect(() => {
        refreshActivities();
    }, [refreshActivities]);

    return (
        <ActivityContext.Provider value={{ activities, loading, refreshActivities }}>
            {children}
        </ActivityContext.Provider>
    );
};

export const useActivity = () => {
    const context = useContext(ActivityContext);
    if (context === undefined) {
        throw new Error('useActivity must be used within an ActivityProvider');
    }
    return context;
};
