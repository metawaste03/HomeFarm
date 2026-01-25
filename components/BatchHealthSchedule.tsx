import React, { useState, useEffect } from 'react';
import { healthSchedulesService } from '../services/database';
import { CheckCircleIcon, ClockIcon, WarningIcon, CalendarIcon } from './icons';
import type { Tables } from '../types/database';

interface BatchHealthScheduleProps {
    batchId: string;
    batchStartDate: string | null;
}

const BatchHealthSchedule: React.FC<BatchHealthScheduleProps> = ({ batchId, batchStartDate }) => {
    const [schedules, setSchedules] = useState<Tables<'health_schedules'>[]>([]);
    const [loading, setLoading] = useState(true);
    const [batchAge, setBatchAge] = useState<number | null>(null);

    useEffect(() => {
        loadSchedules();
    }, [batchId]);

    const loadSchedules = async () => {
        try {
            setLoading(true);
            const data = await healthSchedulesService.listForBatch(batchId);
            setSchedules(data.sort((a, b) => (a.day_number || 0) - (b.day_number || 0)));

            // Calculate batch age
            if (batchStartDate) {
                const age = await healthSchedulesService.getBatchAge(batchId);
                setBatchAge(age);
            }
        } catch (error) {
            console.error('Error loading health schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleComplete = async (schedule: Tables<'health_schedules'>) => {
        try {
            await healthSchedulesService.update(schedule.id, {
                completed: !schedule.completed
            });
            // Reload schedules
            loadSchedules();
        } catch (error) {
            console.error('Error updating schedule:', error);
            alert('Failed to update vaccination status');
        }
    };

    const getScheduleStatus = (schedule: Tables<'health_schedules'>) => {
        if (schedule.completed) return 'completed';

        if (!schedule.scheduled_date) return 'unknown';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const scheduleDate = new Date(schedule.scheduled_date);
        scheduleDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((scheduleDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff < 0) return 'overdue';
        if (daysDiff === 0) return 'due';
        return 'upcoming';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return <div className="py-4 text-center text-text-secondary">Loading health schedule...</div>;
    }

    if (schedules.length === 0) {
        return (
            <div className="py-6 text-center bg-muted rounded-lg">
                <p className="text-text-secondary text-sm">No health schedule for this batch</p>
                <p className="text-text-secondary text-xs mt-1">Apply an official template from Health Schedules</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Batch Age Indicator */}
            {batchAge !== null && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        Batch Age: {batchAge} {batchAge === 1 ? 'day' : 'days'} old
                    </p>
                </div>
            )}

            {/* Vaccination Timeline */}
            <div className="space-y-3">
                {schedules.map((schedule, index) => {
                    const status = getScheduleStatus(schedule);

                    return (
                        <div key={schedule.id} className="flex gap-3">
                            {/* Timeline connector */}
                            <div className="flex flex-col items-center">
                                {/* Circle indicator */}
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${status === 'completed'
                                            ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300'
                                            : status === 'overdue'
                                                ? 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300'
                                                : status === 'due'
                                                    ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-300'
                                                    : schedule.is_compulsory
                                                        ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-300'
                                                        : 'bg-muted border-border text-text-secondary'
                                        }`}
                                >
                                    {status === 'completed' ? (
                                        <CheckCircleIcon className="w-5 h-5" />
                                    ) : (
                                        schedule.day_number || '?'
                                    )}
                                </div>

                                {/* Vertical line */}
                                {index < schedules.length - 1 && (
                                    <div className="w-0.5 h-full bg-border mt-1"></div>
                                )}
                            </div>

                            {/* Schedule details */}
                            <div className={`flex-1 pb-4 ${schedule.is_compulsory && status !== 'completed' ? 'bg-orange-50 dark:bg-orange-900/10 -ml-2 -mr-2 pl-2 pr-2 rounded-lg' : ''}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-text-primary">
                                            {schedule.vaccine_name}
                                            {schedule.is_compulsory && status !== 'completed' && (
                                                <span className="ml-2 text-xs text-orange-600 font-bold">(COMPULSORY)</span>
                                            )}
                                        </p>

                                        {/* Status indicator */}
                                        {status === 'completed' && (
                                            <div className="flex items-center gap-1 mt-1 text-xs text-green-600 dark:text-green-400">
                                                <CheckCircleIcon className="w-3 h-3" />
                                                <span>Completed</span>
                                            </div>
                                        )}
                                        {status === 'due' && (
                                            <div className="flex items-center gap-1 mt-1 text-xs text-orange-600 dark:text-orange-400 font-semibold">
                                                <ClockIcon className="w-3 h-3" />
                                                <span>DUE TODAY</span>
                                            </div>
                                        )}
                                        {status === 'overdue' && schedule.scheduled_date && (
                                            <div className="flex items-center gap-1 mt-1 text-xs text-red-600 dark:text-red-400 font-semibold">
                                                <WarningIcon className="w-3 h-3" />
                                                <span>OVERDUE by {Math.abs(Math.floor((new Date(schedule.scheduled_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days</span>
                                            </div>
                                        )}
                                        {status === 'upcoming' && schedule.scheduled_date && (
                                            <div className="flex items-center gap-1 mt-1 text-xs text-text-secondary">
                                                <CalendarIcon className="w-3 h-3" />
                                                <span>Due {formatDate(schedule.scheduled_date)}</span>
                                            </div>
                                        )}

                                        {/* Details */}
                                        {schedule.dosage && (
                                            <p className="text-xs text-text-secondary mt-1">
                                                <span className="font-medium">Dosage:</span> {schedule.dosage}
                                            </p>
                                        )}
                                        {schedule.administration_method && (
                                            <p className="text-xs text-text-secondary">
                                                <span className="font-medium">Method:</span> {schedule.administration_method}
                                            </p>
                                        )}
                                        {schedule.notes && (
                                            <p className="text-xs text-text-secondary italic mt-1">{schedule.notes}</p>
                                        )}
                                    </div>

                                    {/* Toggle button */}
                                    <button
                                        onClick={() => handleToggleComplete(schedule)}
                                        className={`ml-3 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${schedule.completed
                                                ? 'bg-gray-100 dark:bg-gray-800 text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700'
                                                : 'bg-primary text-white hover:bg-primary-600'
                                            }`}
                                    >
                                        {schedule.completed ? 'Undo' : 'Mark Done'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BatchHealthSchedule;
