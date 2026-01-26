import React, { useState, useEffect } from 'react';
import { Screen } from '../App';
import {
    ChevronLeftIcon,
    PlusIcon,
    CheckIcon,
    ClockIcon,
    StethoscopeIcon,
    WarningIcon,
    InfoIcon
} from './icons';
import { healthSchedulesService, batchesService } from '../services/database';
import type { Tables } from '../types/database';

interface BatchHealthScheduleScreenProps {
    onNavigate: (screen: Screen, params?: any) => void;
    batchId: string;
}

interface HealthTask extends Tables<'health_schedules'> {
    status: 'completed' | 'due' | 'today' | 'upcoming';
}

const BatchHealthScheduleScreen: React.FC<BatchHealthScheduleScreenProps> = ({ onNavigate, batchId }) => {
    const [batch, setBatch] = useState<Tables<'batches'> | null>(null);
    const [tasks, setTasks] = useState<HealthTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [batchAge, setBatchAge] = useState<number | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [markingComplete, setMarkingComplete] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [batchId]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load batch details
            const batches = await batchesService.list();
            const currentBatch = batches.find(b => b.id === batchId);
            setBatch(currentBatch || null);

            // Load health schedules for this batch
            const schedules = await healthSchedulesService.listForBatch(batchId);

            // Calculate batch age
            const age = await healthSchedulesService.getBatchAge(batchId);
            setBatchAge(age);

            // Calculate status for each task
            const today = new Date().toISOString().split('T')[0];
            const tasksWithStatus: HealthTask[] = schedules.map(task => {
                let status: HealthTask['status'] = 'upcoming';

                if (task.completed) {
                    status = 'completed';
                } else if (task.scheduled_date) {
                    if (task.scheduled_date === today) {
                        status = 'today';
                    } else if (task.scheduled_date < today) {
                        status = 'due'; // Overdue
                    }
                }

                return { ...task, status };
            });

            // Sort: due first, then today, then upcoming, then completed
            tasksWithStatus.sort((a, b) => {
                const statusOrder = { due: 0, today: 1, upcoming: 2, completed: 3 };
                if (statusOrder[a.status] !== statusOrder[b.status]) {
                    return statusOrder[a.status] - statusOrder[b.status];
                }
                // Within same status, sort by scheduled_date
                return (a.scheduled_date || '').localeCompare(b.scheduled_date || '');
            });

            setTasks(tasksWithStatus);
        } catch (error) {
            console.error('Error loading health schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkComplete = async (taskId: string) => {
        setMarkingComplete(taskId);
        try {
            await healthSchedulesService.markComplete(taskId);
            await loadData(); // Refresh the list
        } catch (error) {
            console.error('Error marking task complete:', error);
            alert('Failed to mark task as complete. Please try again.');
        } finally {
            setMarkingComplete(null);
        }
    };

    const handleMarkIncomplete = async (taskId: string) => {
        try {
            await healthSchedulesService.markIncomplete(taskId);
            await loadData();
        } catch (error) {
            console.error('Error marking task incomplete:', error);
        }
    };

    const handleAddTask = async (taskData: {
        vaccine_name: string;
        day_number?: number;
        scheduled_date?: string;
        dosage?: string;
        administration_method?: string;
        notes?: string;
        is_compulsory?: boolean;
    }) => {
        try {
            await healthSchedulesService.addCustomTask(batchId, {
                ...taskData,
                sector: batch?.sector,
            });
            setShowAddModal(false);
            await loadData();
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Failed to add task. Please try again.');
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getStatusStyles = (status: HealthTask['status']) => {
        switch (status) {
            case 'completed':
                return {
                    badge: 'bg-success/20 text-success border-success',
                    card: '',
                    icon: <CheckIcon className="w-4 h-4" />,
                };
            case 'today':
                return {
                    badge: 'bg-primary/20 text-primary border-primary',
                    card: 'ring-2 ring-primary/50 bg-primary/5',
                    icon: <ClockIcon className="w-4 h-4" />,
                };
            case 'due':
                return {
                    badge: 'bg-danger/20 text-danger border-danger',
                    card: 'ring-2 ring-danger/50 bg-danger/5',
                    icon: <WarningIcon className="w-4 h-4" />,
                };
            default:
                return {
                    badge: 'bg-muted text-text-secondary border-border',
                    card: 'opacity-70',
                    icon: <ClockIcon className="w-4 h-4" />,
                };
        }
    };

    if (loading) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center">
                <p className="text-text-secondary">Loading health schedule...</p>
            </div>
        );
    }

    if (!batch) {
        return (
            <div className="bg-background min-h-screen flex flex-col items-center justify-center p-4">
                <p className="text-text-secondary mb-4">Batch not found</p>
                <button
                    onClick={() => onNavigate('batches')}
                    className="text-primary font-semibold"
                >
                    Go to Batch Management
                </button>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen pb-20">
            {/* Header */}
            <header className="bg-card p-4 pt-6 shadow-md sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => onNavigate('batches')}
                        className="p-2 -ml-2 text-text-secondary hover:text-primary"
                        aria-label="Go back"
                    >
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <div className="text-center flex-1">
                        <h1 className="text-xl font-bold text-text-primary">{batch.name}</h1>
                        <p className="text-text-secondary text-xs">
                            {batch.sector} • {batchAge ? `${batchAge} days old` : 'Age unknown'}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="p-2 -mr-2 text-primary hover:text-primary-600"
                        aria-label="Add health task"
                    >
                        <PlusIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <div className="p-4 space-y-4">
                {/* Info banner if no tasks */}
                {tasks.length === 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
                        <InfoIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">No Health Schedule</p>
                            <p className="text-xs text-blue-700 dark:text-blue-200">
                                This batch doesn't have a health schedule yet. You can add individual tasks using the + button,
                                or copy an official template from Settings → Health Schedules.
                            </p>
                        </div>
                    </div>
                )}

                {/* Task Timeline */}
                {tasks.length > 0 && (
                    <div className="space-y-3">
                        {tasks.map((task, index) => {
                            const styles = getStatusStyles(task.status);
                            const isMarking = markingComplete === task.id;

                            return (
                                <div
                                    key={task.id}
                                    className={`bg-card rounded-xl border border-border p-4 transition-all ${styles.card}`}
                                >
                                    <div className="flex gap-3">
                                        {/* Day Badge */}
                                        <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center border-2 ${styles.badge} flex-shrink-0`}>
                                            {task.day_number && (
                                                <>
                                                    <span className="text-[10px] font-medium opacity-70">Day</span>
                                                    <span className="text-sm font-bold -mt-0.5">{task.day_number}</span>
                                                </>
                                            )}
                                            {!task.day_number && styles.icon}
                                        </div>

                                        {/* Task Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-text-primary flex items-center gap-2">
                                                        {task.vaccine_name}
                                                        {task.is_compulsory && (
                                                            <span className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded font-bold">
                                                                COMPULSORY
                                                            </span>
                                                        )}
                                                    </p>
                                                    {task.dosage && (
                                                        <p className="text-xs text-text-secondary mt-0.5">
                                                            <span className="font-medium">Dosage:</span> {task.dosage}
                                                        </p>
                                                    )}
                                                    {task.administration_method && (
                                                        <p className="text-xs text-text-secondary">
                                                            <span className="font-medium">Method:</span> {task.administration_method}
                                                        </p>
                                                    )}
                                                    {task.notes && (
                                                        <p className="text-xs text-text-secondary italic mt-1">{task.notes}</p>
                                                    )}
                                                </div>

                                                {/* Action Button */}
                                                <div className="flex-shrink-0">
                                                    {task.status === 'completed' ? (
                                                        <button
                                                            onClick={() => handleMarkIncomplete(task.id)}
                                                            className="flex items-center gap-1.5 bg-success/10 text-success px-3 py-1.5 rounded-lg text-xs font-medium"
                                                        >
                                                            <CheckIcon className="w-4 h-4" />
                                                            Done
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleMarkComplete(task.id)}
                                                            disabled={isMarking}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${task.status === 'due'
                                                                    ? 'bg-danger text-white hover:bg-danger/90'
                                                                    : task.status === 'today'
                                                                        ? 'bg-primary text-white hover:bg-primary-600'
                                                                        : 'bg-muted text-text-secondary hover:bg-border'
                                                                } disabled:opacity-50`}
                                                        >
                                                            {isMarking ? 'Saving...' : 'Mark Done'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Date info */}
                                            <div className="mt-2 text-xs text-text-secondary">
                                                {task.status === 'completed' && task.completed_date && (
                                                    <span className="text-success">Completed {formatDate(task.completed_date)}</span>
                                                )}
                                                {task.status === 'due' && task.scheduled_date && (
                                                    <span className="text-danger">Overdue since {formatDate(task.scheduled_date)}</span>
                                                )}
                                                {task.status === 'today' && (
                                                    <span className="text-primary font-medium">Due Today</span>
                                                )}
                                                {task.status === 'upcoming' && task.scheduled_date && (
                                                    <span>Scheduled for {formatDate(task.scheduled_date)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Summary Stats */}
                {tasks.length > 0 && (
                    <div className="bg-card rounded-xl p-4 border border-border">
                        <div className="flex items-center gap-3 mb-3">
                            <StethoscopeIcon className="w-5 h-5 text-primary" />
                            <span className="font-semibold text-text-primary">Schedule Summary</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="bg-danger/10 rounded-lg p-2">
                                <p className="text-lg font-bold text-danger">
                                    {tasks.filter(t => t.status === 'due').length}
                                </p>
                                <p className="text-[10px] text-text-secondary">Overdue</p>
                            </div>
                            <div className="bg-primary/10 rounded-lg p-2">
                                <p className="text-lg font-bold text-primary">
                                    {tasks.filter(t => t.status === 'today').length}
                                </p>
                                <p className="text-[10px] text-text-secondary">Today</p>
                            </div>
                            <div className="bg-muted rounded-lg p-2">
                                <p className="text-lg font-bold text-text-secondary">
                                    {tasks.filter(t => t.status === 'upcoming').length}
                                </p>
                                <p className="text-[10px] text-text-secondary">Upcoming</p>
                            </div>
                            <div className="bg-success/10 rounded-lg p-2">
                                <p className="text-lg font-bold text-success">
                                    {tasks.filter(t => t.status === 'completed').length}
                                </p>
                                <p className="text-[10px] text-text-secondary">Done</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Task Modal */}
            {showAddModal && (
                <AddHealthTaskModal
                    batchStartDate={batch.start_date}
                    onSave={handleAddTask}
                    onClose={() => setShowAddModal(false)}
                />
            )}
        </div>
    );
};

// Add Health Task Modal Component
interface AddHealthTaskModalProps {
    batchStartDate: string | null;
    onSave: (taskData: {
        vaccine_name: string;
        day_number?: number;
        scheduled_date?: string;
        dosage?: string;
        administration_method?: string;
        notes?: string;
        is_compulsory?: boolean;
    }) => void;
    onClose: () => void;
}

const AddHealthTaskModal: React.FC<AddHealthTaskModalProps> = ({ batchStartDate, onSave, onClose }) => {
    const [vaccineName, setVaccineName] = useState('');
    const [dayNumber, setDayNumber] = useState<number | ''>('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [dosage, setDosage] = useState('');
    const [adminMethod, setAdminMethod] = useState('');
    const [notes, setNotes] = useState('');
    const [isCompulsory, setIsCompulsory] = useState(false);
    const [useDate, setUseDate] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
        if (!vaccineName.trim()) {
            alert('Please enter a vaccine/treatment name');
            return;
        }

        setSaving(true);

        // Calculate scheduled date from day number if batch has start date
        let calcScheduledDate = scheduledDate;
        if (!useDate && dayNumber && batchStartDate) {
            const startDate = new Date(batchStartDate);
            const taskDate = new Date(startDate.getTime() + (Number(dayNumber) - 1) * 24 * 60 * 60 * 1000);
            calcScheduledDate = taskDate.toISOString().split('T')[0];
        }

        onSave({
            vaccine_name: vaccineName.trim(),
            day_number: !useDate && dayNumber ? Number(dayNumber) : undefined,
            scheduled_date: calcScheduledDate || undefined,
            dosage: dosage.trim() || undefined,
            administration_method: adminMethod.trim() || undefined,
            notes: notes.trim() || undefined,
            is_compulsory: isCompulsory,
        });

        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
            <div
                className="bg-popover rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-border sticky top-0 bg-popover">
                    <h3 className="text-xl font-bold text-text-primary">Add Health Task</h3>
                    <p className="text-sm text-text-secondary mt-1">Add a custom vaccination or treatment task</p>
                </div>

                <div className="p-6 space-y-4">
                    {/* Vaccine Name */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Vaccine / Treatment Name *
                        </label>
                        <input
                            type="text"
                            value={vaccineName}
                            onChange={e => setVaccineName(e.target.value)}
                            placeholder="e.g., Newcastle Disease Vaccine"
                            className="w-full px-4 py-3 rounded-lg bg-input border border-border text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    {/* Day or Date Toggle */}
                    <div className="flex gap-2 p-1 bg-muted rounded-lg">
                        <button
                            type="button"
                            onClick={() => setUseDate(false)}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${!useDate ? 'bg-card text-text-primary shadow' : 'text-text-secondary'
                                }`}
                        >
                            By Day Number
                        </button>
                        <button
                            type="button"
                            onClick={() => setUseDate(true)}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${useDate ? 'bg-card text-text-primary shadow' : 'text-text-secondary'
                                }`}
                        >
                            By Date
                        </button>
                    </div>

                    {/* Day Number or Date Input */}
                    {!useDate ? (
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1">
                                Day Number
                            </label>
                            <input
                                type="number"
                                value={dayNumber}
                                onChange={e => setDayNumber(e.target.value ? parseInt(e.target.value) : '')}
                                placeholder="e.g., 14"
                                min="1"
                                className="w-full px-4 py-3 rounded-lg bg-input border border-border text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <p className="text-xs text-text-secondary mt-1">
                                {batchStartDate ? 'Day counted from batch start date' : 'Note: Batch has no start date set'}
                            </p>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1">
                                Scheduled Date
                            </label>
                            <input
                                type="date"
                                value={scheduledDate}
                                onChange={e => setScheduledDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-input border border-border text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    )}

                    {/* Dosage */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Dosage (optional)
                        </label>
                        <input
                            type="text"
                            value={dosage}
                            onChange={e => setDosage(e.target.value)}
                            placeholder="e.g., 0.5ml per bird"
                            className="w-full px-4 py-3 rounded-lg bg-input border border-border text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    {/* Administration Method */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Administration Method (optional)
                        </label>
                        <select
                            value={adminMethod}
                            onChange={e => setAdminMethod(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-input border border-border text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">Select method...</option>
                            <option value="Drinking Water">Drinking Water</option>
                            <option value="Eye Drop">Eye Drop</option>
                            <option value="Injection (Subcutaneous)">Injection (Subcutaneous)</option>
                            <option value="Injection (Intramuscular)">Injection (Intramuscular)</option>
                            <option value="Spray">Spray</option>
                            <option value="Wing Web">Wing Web</option>
                            <option value="Oral">Oral</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Any additional notes..."
                            rows={2}
                            className="w-full px-4 py-3 rounded-lg bg-input border border-border text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Compulsory Toggle */}
                    <label className="flex items-center gap-3 p-3 bg-muted rounded-lg cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isCompulsory}
                            onChange={e => setIsCompulsory(e.target.checked)}
                            className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                        />
                        <div>
                            <p className="text-sm font-medium text-text-primary">Mark as Compulsory</p>
                            <p className="text-xs text-text-secondary">Critical vaccination that must not be skipped</p>
                        </div>
                    </label>
                </div>

                <div className="p-4 border-t border-border flex gap-3 sticky bottom-0 bg-popover">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-lg text-text-primary bg-muted hover:bg-border font-semibold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || !vaccineName.trim()}
                        className="flex-1 px-4 py-3 rounded-lg text-white bg-primary hover:bg-primary-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Adding...' : 'Add Task'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BatchHealthScheduleScreen;
