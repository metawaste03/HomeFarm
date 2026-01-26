import React, { useState, useEffect } from 'react';
import { Screen } from '../App';
import {
    ChevronLeftIcon,
    StethoscopeIcon,
    WarningIcon,
    InfoIcon,
    CopyIcon,
    CheckIcon,
    ClockIcon,
    PlusIcon,
    TrashIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from './icons';
import { Sector } from './BatchManagementScreen';
import { healthSchedulesService, batchesService } from '../services/database';
import { useFarm } from '../contexts/FarmContext';
import type { Tables } from '../types/database';

interface HealthScheduleScreenProps {
    onNavigate: (screen: Screen) => void;
}

interface HealthTask extends Tables<'health_schedules'> {
    status: 'completed' | 'due' | 'today' | 'upcoming';
}

interface BatchSchedule {
    batch: Tables<'batches'>;
    tasks: HealthTask[];
    batchAge: number;
}

const HealthScheduleScreen: React.FC<HealthScheduleScreenProps> = ({ onNavigate }) => {
    const { activeFarm } = useFarm();
    const [universalTemplates, setUniversalTemplates] = useState<Tables<'health_schedules'>[]>([]);
    const [batchSchedules, setBatchSchedules] = useState<BatchSchedule[]>([]);
    const [batches, setBatches] = useState<Tables<'batches'>[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
    const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());
    const [showAddTaskModal, setShowAddTaskModal] = useState<string | null>(null);
    const [markingComplete, setMarkingComplete] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [activeFarm]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load universal templates
            const [layerTemplates, broilerTemplates] = await Promise.all([
                healthSchedulesService.listUniversal('Layer'),
                healthSchedulesService.listUniversal('Broiler'),
            ]);
            setUniversalTemplates([...layerTemplates, ...broilerTemplates]);

            // Load all batches
            const allBatches = await batchesService.list();
            const activeBatches = allBatches.filter(b => b.status === 'Active');
            setBatches(activeBatches);

            // Load batch schedules with status
            const today = new Date().toISOString().split('T')[0];
            const schedules: BatchSchedule[] = [];

            for (const batch of activeBatches) {
                const tasks = await healthSchedulesService.listForBatch(batch.id);
                if (tasks.length > 0) {
                    // Calculate batch age
                    let batchAge = 0;
                    if (batch.start_date) {
                        const startDate = new Date(batch.start_date);
                        const todayDate = new Date();
                        const diffTime = todayDate.getTime() - startDate.getTime();
                        batchAge = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    }

                    // Add status to each task
                    const tasksWithStatus: HealthTask[] = tasks.map(task => {
                        let status: HealthTask['status'] = 'upcoming';

                        if (task.completed) {
                            status = 'completed';
                        } else if (task.scheduled_date) {
                            if (task.scheduled_date === today) {
                                status = 'today';
                            } else if (task.scheduled_date < today) {
                                status = 'due';
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
                        return (a.day_number || 0) - (b.day_number || 0);
                    });

                    schedules.push({
                        batch,
                        tasks: tasksWithStatus,
                        batchAge
                    });

                    // Auto-expand batches with overdue or today tasks
                    if (tasksWithStatus.some(t => t.status === 'due' || t.status === 'today')) {
                        setExpandedBatches(prev => new Set([...prev, batch.id]));
                    }
                }
            }

            setBatchSchedules(schedules);
        } catch (error) {
            console.error('Error loading health schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMakeCopy = (sector: Sector) => {
        setSelectedSector(sector);
        setShowCopyModal(true);
    };

    const handleApplyToBatch = async (batchId: string) => {
        if (!selectedSector) return;

        try {
            const batch = batches.find(b => b.id === batchId);
            if (!batch || !batch.start_date) {
                alert('Selected batch must have a start date');
                return;
            }

            await healthSchedulesService.copyTemplateToBatch(
                selectedSector,
                batchId,
                batch.start_date
            );

            setShowCopyModal(false);
            setSelectedSector(null);
            await loadData(); // Refresh to show new copy
        } catch (error) {
            console.error('Error copying template:', error);
            alert('Failed to copy template. Please try again.');
        }
    };

    const handleMarkComplete = async (taskId: string) => {
        setMarkingComplete(taskId);
        try {
            await healthSchedulesService.markComplete(taskId);
            await loadData(); // Refresh
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

    const handleAddCustomTask = async (batchId: string, taskData: {
        vaccine_name: string;
        day_number?: number;
        scheduled_date?: string;
        dosage?: string;
        administration_method?: string;
        notes?: string;
        is_compulsory?: boolean;
    }) => {
        try {
            const batch = batches.find(b => b.id === batchId);
            await healthSchedulesService.addCustomTask(batchId, {
                ...taskData,
                sector: batch?.sector,
            });
            setShowAddTaskModal(null);
            await loadData();
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Failed to add task. Please try again.');
        }
    };

    const handleDeleteBatchSchedule = async (batchId: string) => {
        if (!confirm('Are you sure you want to delete all health tasks for this batch? This cannot be undone.')) {
            return;
        }

        try {
            const tasks = batchSchedules.find(s => s.batch.id === batchId)?.tasks || [];
            for (const task of tasks) {
                await healthSchedulesService.delete(task.id);
            }
            await loadData();
        } catch (error) {
            console.error('Error deleting batch schedule:', error);
            alert('Failed to delete schedule. Please try again.');
        }
    };

    const toggleBatchExpanded = (batchId: string) => {
        setExpandedBatches(prev => {
            const newSet = new Set(prev);
            if (newSet.has(batchId)) {
                newSet.delete(batchId);
            } else {
                newSet.add(batchId);
            }
            return newSet;
        });
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
                    badge: 'bg-success/20 text-success',
                    icon: <CheckIcon className="w-3 h-3" />,
                    label: 'Done'
                };
            case 'today':
                return {
                    badge: 'bg-primary/20 text-primary',
                    icon: <ClockIcon className="w-3 h-3" />,
                    label: 'Today'
                };
            case 'due':
                return {
                    badge: 'bg-danger/20 text-danger',
                    icon: <WarningIcon className="w-3 h-3" />,
                    label: 'Overdue'
                };
            default:
                return {
                    badge: 'bg-muted text-text-secondary',
                    icon: <ClockIcon className="w-3 h-3" />,
                    label: 'Upcoming'
                };
        }
    };

    // Count tasks needing attention
    const tasksNeedingAttention = batchSchedules.reduce((count, schedule) => {
        return count + schedule.tasks.filter(t => t.status === 'due' || t.status === 'today').length;
    }, 0);

    const layerTemplates = universalTemplates.filter(t => t.sector === 'Layer');

    if (loading) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center">
                <p className="text-text-secondary">Loading health schedules...</p>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen pb-20">
            <header className="bg-card p-4 pt-6 shadow-md sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <button onClick={() => onNavigate('settings')} className="p-2 -ml-2 text-text-secondary hover:text-primary" aria-label="Go back">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <h1 className="text-xl font-bold text-text-primary">Health Schedules</h1>
                        {tasksNeedingAttention > 0 && (
                            <p className="text-danger text-xs font-semibold">{tasksNeedingAttention} tasks need attention</p>
                        )}
                    </div>
                    <div className="w-6"></div>
                </div>
            </header>

            <div className="p-4 space-y-6">
                {/* My Batch Schedules Section */}
                {batchSchedules.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold text-text-secondary uppercase mb-3 px-1 flex items-center gap-2">
                            <StethoscopeIcon className="w-4 h-4" />
                            My Batch Schedules
                        </h2>
                        <div className="space-y-4">
                            {batchSchedules.map(schedule => {
                                const isExpanded = expandedBatches.has(schedule.batch.id);
                                const overdueCount = schedule.tasks.filter(t => t.status === 'due').length;
                                const todayCount = schedule.tasks.filter(t => t.status === 'today').length;
                                const completedCount = schedule.tasks.filter(t => t.status === 'completed').length;

                                return (
                                    <div key={schedule.batch.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                                        {/* Batch Header */}
                                        <button
                                            onClick={() => toggleBatchExpanded(schedule.batch.id)}
                                            className="w-full p-4 flex items-center justify-between text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${overdueCount > 0 ? 'bg-danger/10' : todayCount > 0 ? 'bg-primary/10' : 'bg-success/10'}`}>
                                                    <StethoscopeIcon className={`w-5 h-5 ${overdueCount > 0 ? 'text-danger' : todayCount > 0 ? 'text-primary' : 'text-success'}`} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-text-primary">{schedule.batch.name}</p>
                                                    <p className="text-xs text-text-secondary">
                                                        {schedule.batch.sector} • {schedule.batchAge} days old • {schedule.tasks.length} tasks
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {/* Status badges */}
                                                <div className="flex gap-1">
                                                    {overdueCount > 0 && (
                                                        <span className="text-xs bg-danger/20 text-danger px-2 py-0.5 rounded-full font-semibold">
                                                            {overdueCount} overdue
                                                        </span>
                                                    )}
                                                    {todayCount > 0 && (
                                                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">
                                                            {todayCount} today
                                                        </span>
                                                    )}
                                                </div>
                                                {isExpanded ? (
                                                    <ChevronUpIcon className="w-5 h-5 text-text-secondary" />
                                                ) : (
                                                    <ChevronDownIcon className="w-5 h-5 text-text-secondary" />
                                                )}
                                            </div>
                                        </button>

                                        {/* Expanded Task List */}
                                        {isExpanded && (
                                            <div className="border-t border-border">
                                                <div className="p-4 space-y-2">
                                                    {schedule.tasks.map(task => {
                                                        const styles = getStatusStyles(task.status);
                                                        const isMarking = markingComplete === task.id;

                                                        return (
                                                            <div
                                                                key={task.id}
                                                                className={`flex items-center justify-between p-3 rounded-lg ${task.status === 'due' ? 'bg-danger/5 border border-danger/30' :
                                                                        task.status === 'today' ? 'bg-primary/5 border border-primary/30' :
                                                                            task.status === 'completed' ? 'bg-success/5' :
                                                                                'bg-muted'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${task.is_compulsory
                                                                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 border-2 border-orange-500'
                                                                            : 'bg-card border-2 border-border text-text-secondary'
                                                                        }`}>
                                                                        {task.day_number || '?'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
                                                                            {task.vaccine_name}
                                                                            {task.is_compulsory && (
                                                                                <span className="text-[10px] text-orange-600 font-bold">(COMPULSORY)</span>
                                                                            )}
                                                                        </p>
                                                                        <p className="text-xs text-text-secondary">
                                                                            {task.scheduled_date && formatDate(task.scheduled_date)}
                                                                            {task.dosage && ` • ${task.dosage}`}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    {task.status === 'completed' ? (
                                                                        <button
                                                                            onClick={() => handleMarkIncomplete(task.id)}
                                                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${styles.badge}`}
                                                                        >
                                                                            {styles.icon}
                                                                            {styles.label}
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => handleMarkComplete(task.id)}
                                                                            disabled={isMarking}
                                                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${task.status === 'due'
                                                                                    ? 'bg-danger text-white'
                                                                                    : task.status === 'today'
                                                                                        ? 'bg-primary text-white'
                                                                                        : 'bg-muted text-text-secondary'
                                                                                } disabled:opacity-50`}
                                                                        >
                                                                            {isMarking ? '...' : 'Mark Done'}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Actions Footer */}
                                                <div className="px-4 pb-4 flex gap-2">
                                                    <button
                                                        onClick={() => setShowAddTaskModal(schedule.batch.id)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20"
                                                    >
                                                        <PlusIcon className="w-4 h-4" />
                                                        Add Custom Task
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBatchSchedule(schedule.batch.id)}
                                                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-danger bg-danger/10 hover:bg-danger/20"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Divider if both sections exist */}
                {batchSchedules.length > 0 && layerTemplates.length > 0 && (
                    <hr className="border-border" />
                )}

                {/* Official Templates Section */}
                {layerTemplates.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold text-text-secondary uppercase mb-3 px-1">Official Templates</h2>

                        {/* Info Alert */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3 mb-4">
                            <InfoIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">Make a Copy</p>
                                <p className="text-xs text-blue-700 dark:text-blue-200">
                                    Click "Make a Copy" to create a batch-specific schedule from this template. You can then edit and track each task.
                                </p>
                            </div>
                        </div>

                        <div className="bg-card rounded-xl shadow-sm border border-border">
                            <div className="p-4 border-b border-border flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                                        <StethoscopeIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-text-primary">Official Health Schedule</p>
                                        <p className="text-xs text-text-secondary">Layer & Broiler • {layerTemplates.length} tasks</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleMakeCopy('Layer')}
                                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-600"
                                >
                                    <CopyIcon className="w-4 h-4" />
                                    Make a Copy
                                </button>
                            </div>

                            {/* Template Preview */}
                            <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                                {layerTemplates.slice(0, 5).map((task) => (
                                    <div key={task.id} className="flex items-center gap-3 py-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${task.is_compulsory
                                                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 border border-orange-400'
                                                : 'bg-muted text-text-secondary border border-border'
                                            }`}>
                                            {task.day_number}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-text-primary">
                                                {task.vaccine_name}
                                                {task.is_compulsory && <span className="ml-1 text-xs text-orange-600">(Required)</span>}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {layerTemplates.length > 5 && (
                                    <p className="text-xs text-text-secondary text-center py-2">
                                        + {layerTemplates.length - 5} more tasks...
                                    </p>
                                )}
                            </div>

                            {/* Disclaimer */}
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border-t border-yellow-200 dark:border-yellow-800 flex gap-3 rounded-b-xl">
                                <WarningIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-900 dark:text-yellow-100">
                                    <span className="font-semibold">Note:</span> Vaccination programmes may vary depending on species, location and management.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {batchSchedules.length === 0 && layerTemplates.length === 0 && (
                    <div className="text-center py-12">
                        <StethoscopeIcon className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                        <p className="text-text-secondary">No health schedules available</p>
                    </div>
                )}
            </div>

            {/* Copy Template Modal */}
            {showCopyModal && (
                <CopyTemplateModal
                    batches={batches}
                    existingBatchIds={batchSchedules.map(s => s.batch.id)}
                    onApply={handleApplyToBatch}
                    onClose={() => { setShowCopyModal(false); setSelectedSector(null); }}
                />
            )}

            {/* Add Task Modal */}
            {showAddTaskModal && (
                <AddHealthTaskModal
                    batchId={showAddTaskModal}
                    batchStartDate={batches.find(b => b.id === showAddTaskModal)?.start_date || null}
                    onSave={(taskData) => handleAddCustomTask(showAddTaskModal, taskData)}
                    onClose={() => setShowAddTaskModal(null)}
                />
            )}
        </div>
    );
};

// Copy Template Modal
interface CopyTemplateModalProps {
    batches: Tables<'batches'>[];
    existingBatchIds: string[];
    onApply: (batchId: string) => void;
    onClose: () => void;
}

const CopyTemplateModal: React.FC<CopyTemplateModalProps> = ({ batches, existingBatchIds, onApply, onClose }) => {
    const [selectedBatchId, setSelectedBatchId] = useState<string>('');

    const availableBatches = batches.filter(b => !existingBatchIds.includes(b.id));

    const handleSubmit = () => {
        if (!selectedBatchId) {
            alert('Please select a batch');
            return;
        }
        onApply(selectedBatchId);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-popover rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-border">
                    <h3 className="text-xl font-bold text-text-primary">Make a Copy</h3>
                    <p className="text-sm text-text-secondary mt-1">Select a batch to create a health schedule for</p>
                </div>

                <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
                    {availableBatches.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-text-secondary">
                                {batches.length === 0
                                    ? 'No active batches available. Please create a batch first.'
                                    : 'All batches already have a health schedule.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {availableBatches.map(batch => (
                                <label
                                    key={batch.id}
                                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedBatchId === batch.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="batch"
                                        value={batch.id}
                                        checked={selectedBatchId === batch.id}
                                        onChange={(e) => setSelectedBatchId(e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-text-primary">{batch.name}</p>
                                            <p className="text-xs text-text-secondary">{batch.sector} • {batch.stock_count} birds</p>
                                        </div>
                                        {!batch.start_date && (
                                            <span className="text-xs text-danger bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">No start date</span>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-lg text-text-primary bg-muted hover:bg-border font-semibold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedBatchId || availableBatches.length === 0}
                        className="flex-1 px-4 py-3 rounded-lg text-white bg-primary hover:bg-primary-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Create Copy
                    </button>
                </div>
            </div>
        </div>
    );
};

// Add Health Task Modal
interface AddHealthTaskModalProps {
    batchId: string;
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
                <div className="p-6 border-b border-border">
                    <h3 className="text-xl font-bold text-text-primary">Add Custom Task</h3>
                </div>

                <div className="p-6 space-y-4">
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

                    <div className="flex gap-2 p-1 bg-muted rounded-lg">
                        <button
                            type="button"
                            onClick={() => setUseDate(false)}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${!useDate ? 'bg-card text-text-primary shadow' : 'text-text-secondary'
                                }`}
                        >
                            By Day
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

                    {!useDate ? (
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1">Day Number</label>
                            <input
                                type="number"
                                value={dayNumber}
                                onChange={e => setDayNumber(e.target.value ? parseInt(e.target.value) : '')}
                                placeholder="e.g., 14"
                                min="1"
                                className="w-full px-4 py-3 rounded-lg bg-input border border-border text-text-primary"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1">Date</label>
                            <input
                                type="date"
                                value={scheduledDate}
                                onChange={e => setScheduledDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-input border border-border text-text-primary"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">Dosage (optional)</label>
                        <input
                            type="text"
                            value={dosage}
                            onChange={e => setDosage(e.target.value)}
                            placeholder="e.g., 0.5ml per bird"
                            className="w-full px-4 py-3 rounded-lg bg-input border border-border text-text-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">Method (optional)</label>
                        <select
                            value={adminMethod}
                            onChange={e => setAdminMethod(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-input border border-border text-text-primary"
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

                    <label className="flex items-center gap-3 p-3 bg-muted rounded-lg cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isCompulsory}
                            onChange={e => setIsCompulsory(e.target.checked)}
                            className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-text-primary">Mark as Compulsory</span>
                    </label>
                </div>

                <div className="p-4 border-t border-border flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-lg text-text-primary bg-muted font-semibold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || !vaccineName.trim()}
                        className="flex-1 px-4 py-3 rounded-lg text-white bg-primary font-semibold disabled:opacity-50"
                    >
                        {saving ? 'Adding...' : 'Add Task'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HealthScheduleScreen;
