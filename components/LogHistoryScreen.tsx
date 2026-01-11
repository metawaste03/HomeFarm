import React, { useEffect, useState } from 'react';
import { Screen } from '../App';
import { ClipboardListIcon, ChevronLeftIcon, ClockIcon } from './icons';
import { useFarm } from '../contexts/FarmContext';
import { useTeam } from '../contexts/TeamContext';
import { dailyLogsService } from '../services/database';
import type { Tables } from '../types/database';

interface LogHistoryScreenProps {
    onNavigate: (screen: Screen) => void;
}

// Helper to format time ago (duplicated for now, could be shared)
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

const LogHistoryScreen: React.FC<LogHistoryScreenProps> = ({ onNavigate }) => {
    const { farms } = useFarm();
    const { teamMembers } = useTeam();
    const [logs, setLogs] = useState<Tables<'daily_logs'>[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllLogs = async () => {
            if (farms.length === 0) {
                setLoading(false);
                return;
            }

            try {
                const allLogs: Tables<'daily_logs'>[] = [];
                for (const farm of farms) {
                    const farmLogs = await dailyLogsService.list(String(farm.id));
                    allLogs.push(...farmLogs);
                }

                // Sort by date desc
                allLogs.sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
                setLogs(allLogs);
            } catch (error) {
                console.error("Error fetching logs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllLogs();
    }, [farms]);

    const getAuthorName = (authorId: string | null) => {
        if (!authorId) return 'Unknown';
        // Check TeamMembers first
        const member = teamMembers.find(m => m.userId === authorId);
        if (member) return member.name;
        return 'Unknown User'; // Could fetch user details if needed
    };

    return (
        <div className="bg-background min-h-screen flex flex-col">
            <header className="bg-card p-4 pt-6 shadow-sm sticky top-0 z-10 flex items-center gap-2">
                <button onClick={() => onNavigate('dashboard')} className="p-2 -ml-2 text-text-secondary hover:text-primary rounded-full" aria-label="Go back to dashboard">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div className="flex-grow">
                    <h1 className="text-xl font-bold text-text-primary">Log History</h1>
                    <p className="text-xs text-text-secondary">All activity records</p>
                </div>
            </header>

            <div className="p-4 flex-grow space-y-4">
                {loading ? (
                    <div className="text-center py-10">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-text-secondary">Loading history...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-10 text-text-secondary bg-card rounded-2xl border border-dashed border-border">
                        <p>No activity logs found.</p>
                        <button onClick={() => onNavigate('tasks')} className="mt-4 text-primary font-bold hover:underline">
                            Create a Log
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {logs.map((log) => {
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
                                <div key={log.id} className="bg-card p-4 rounded-xl shadow-sm flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                                <ClipboardListIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-text-primary text-sm">{log.log_date}</p>
                                                <p className="text-xs text-text-secondary">
                                                    Added by {getAuthorName(log.created_by)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-text-secondary">
                                            <ClockIcon className="w-3 h-3" />
                                            <span>{formatTimeAgo(log.created_at)}</span>
                                        </div>
                                    </div>
                                    <div className="pl-11">
                                        <p className="text-sm text-text-primary font-medium">{summary}</p>
                                        {log.notes && <p className="text-xs text-text-secondary italic mt-1">"{log.notes}"</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogHistoryScreen;
