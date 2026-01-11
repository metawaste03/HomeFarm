import React, { useEffect, useState } from 'react';
import { ClipboardListIcon, ClockIcon } from './icons';
import { useFarm } from '../contexts/FarmContext';
import { dailyLogsService } from '../services/database';
import type { Tables } from '../types/database';

interface LogHistoryProps {
    onNavigate?: (screen: string) => void;
}

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

const LogHistory: React.FC<LogHistoryProps> = ({ onNavigate }) => {
    const { farms } = useFarm();
    const [recentLogs, setRecentLogs] = useState<Tables<'daily_logs'>[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentLogs = async () => {
            if (farms.length === 0) {
                setLoading(false);
                return;
            }

            try {
                const allLogs: Tables<'daily_logs'>[] = [];
                for (const farm of farms) {
                    const logs = await dailyLogsService.list(String(farm.id));
                    allLogs.push(...logs);
                }

                // Sort by date desc
                allLogs.sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
                setRecentLogs(allLogs.slice(0, 10)); // Top 10
            } catch (error) {
                console.error("Error fetching recent logs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentLogs();
    }, [farms]);

    const hasLogs = recentLogs.length > 0;

    return (
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text-primary">Log History</h3>
                {hasLogs && (
                    <button onClick={() => onNavigate?.('log_history')} className="text-sm text-primary font-medium hover:underline">
                        View All
                    </button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-6">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-text-secondary">Loading history...</p>
                </div>
            ) : hasLogs ? (
                <div className="space-y-4">
                    {recentLogs.map((log) => {
                        // Parse activities to get a summary string
                        const acts = log.activities as any;
                        let summary = 'Daily Log';
                        if (acts) {
                            const parts = [];
                            if (acts.mortality) parts.push(`${acts.mortality} mortality`);
                            if (acts.eggCollection?.total) parts.push(`${acts.eggCollection.total} eggs`);
                            if (acts.feed?.kg) parts.push(`${acts.feed.kg}kg feed`);
                            if (parts.length > 0) summary = parts.join(', ');
                        }

                        return (
                            <div key={log.id} className="flex items-start gap-3">
                                <div className="p-2 rounded-lg flex-shrink-0 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    <ClipboardListIcon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-text-primary">
                                        {/* Display Batch Name if available, else Date */}
                                        {log.log_date}
                                    </p>
                                    <p className="text-xs text-text-secondary truncate">
                                        {summary}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-text-secondary flex-shrink-0">
                                    <ClockIcon className="w-3 h-3" />
                                    <span>{formatTimeAgo(log.created_at)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClipboardListIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-text-primary mb-2">No logs yet</h4>
                    <p className="text-sm text-text-secondary leading-relaxed mb-4">
                        Start logging your daily farm activities to see them here.
                    </p>
                    {onNavigate && (
                        <button
                            onClick={() => onNavigate('tasks')}
                            className="text-sm font-semibold text-primary hover:underline"
                        >
                            Create your first log →
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default LogHistory;
