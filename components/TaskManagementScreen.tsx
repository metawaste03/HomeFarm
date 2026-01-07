
import React, { useState, useMemo } from 'react';
import { Screen } from '../App';
import { PlusIcon, ChevronDownIcon, CloseIcon, CalendarIcon, UsersIcon, TaskIcon } from './icons';
import { useTasks, Task, RecurringType } from '../contexts/TaskContext';

interface TaskManagementScreenProps {
    onNavigate: (screen: Screen) => void;
}

const MOCK_TEAM = [
    "Femi (Owner)",
    "Aisha (Manager)",
    "Ben (Worker)",
    "Tunde (Worker)"
];

const TaskManagementScreen: React.FC<TaskManagementScreenProps> = ({ onNavigate }) => {
    const { tasks, addTask, toggleTaskStatus } = useTasks();
    const [activeFilter, setActiveFilter] = useState<'My Tasks' | 'All Tasks' | 'Overdue'>('My Tasks');
    const [isFormOpen, setIsFormOpen] = useState(false);

    // User role context (Mocked as 'Femi' for now)
    const currentUserName = "Femi (Owner)";

    const filteredTasks = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];

        switch (activeFilter) {
            case 'My Tasks':
                return tasks.filter(t => t.assignedTo === currentUserName);
            case 'Overdue':
                return tasks.filter(t => t.status === 'pending' && t.dueDate < today);
            case 'All Tasks':
            default:
                return tasks;
        }
    }, [tasks, activeFilter, currentUserName]);

    const handleSaveTask = (newTask: Omit<Task, 'id' | 'status'>) => {
        addTask(newTask);
        setIsFormOpen(false);
    };

    if (tasks.length === 0) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center p-6">
                <div className="bg-card rounded-3xl shadow-xl p-10 w-full max-w-md text-center border border-border">
                    <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <TaskIcon className="w-12 h-12 text-primary" isActive />
                    </div>
                    <h1 className="text-3xl font-bold text-text-primary mb-3">Manage Your Farm's To-Do List</h1>
                    <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                        Create and assign tasks to your team to keep everyone organized and on track.
                    </p>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="w-full bg-primary text-white font-bold py-4 px-6 rounded-2xl text-xl flex items-center justify-center gap-3 hover:bg-primary-600 active:scale-95 transition-all shadow-lg"
                    >
                        <PlusIcon className="w-6 h-6" />
                        Create Task
                    </button>
                    {isFormOpen && (
                        <TaskFormModal
                            team={MOCK_TEAM}
                            onSave={handleSaveTask}
                            onClose={() => setIsFormOpen(false)}
                        />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen relative flex flex-col">
            <header className="bg-card p-4 pt-6 shadow-md sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-center text-text-primary">Tasks</h1>

                <div className="flex justify-center p-1 bg-muted rounded-full mt-4">
                    {(['My Tasks', 'All Tasks', 'Overdue'] as const).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`flex-1 px-2 py-2 text-xs md:text-sm font-bold rounded-full transition-colors ${activeFilter === filter ? 'bg-card text-primary shadow' : 'text-text-secondary'}`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </header>

            <div className="p-4 flex-grow space-y-4 pb-32">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-20 text-text-secondary">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="font-medium">No tasks found for this filter.</p>
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onToggle={() => toggleTaskStatus(task.id)}
                        />
                    ))
                )}
            </div>

            {/* FAB */}
            <button
                onClick={() => setIsFormOpen(true)}
                className="fixed bottom-24 right-6 bg-primary text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform z-20 lg:bottom-10 lg:right-10"
                aria-label="Create New Task"
            >
                <PlusIcon className="w-8 h-8" />
            </button>

            {isFormOpen && (
                <TaskFormModal
                    team={MOCK_TEAM}
                    onSave={handleSaveTask}
                    onClose={() => setIsFormOpen(false)}
                />
            )}
        </div>
    );
};

const TaskCard: React.FC<{ task: Task, onToggle: () => void }> = ({ task, onToggle }) => {
    const isOverdue = task.status === 'pending' && task.dueDate < new Date().toISOString().split('T')[0];
    const isCompleted = task.status === 'completed';

    return (
        <div className={`bg-card p-4 rounded-xl shadow-sm border-l-4 transition-all ${isCompleted ? 'border-gray-300 opacity-60' : (isOverdue ? 'border-danger' : 'border-primary')}`}>
            <div className="flex items-start gap-4">
                <button
                    onClick={onToggle}
                    className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors ${isCompleted ? 'bg-primary border-primary text-white' : 'border-border bg-background'}`}
                >
                    {isCompleted && <CheckIcon className="w-5 h-5" />}
                </button>
                <div className="flex-grow">
                    <h3 className={`font-bold text-lg ${isCompleted ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                        {task.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
                        <UsersIcon className="w-4 h-4" />
                        <span>Assigned to: {task.assignedTo}</span>
                    </div>
                    <div className={`flex items-center gap-2 mt-1 text-sm font-semibold ${isOverdue && !isCompleted ? 'text-danger' : 'text-text-secondary'}`}>
                        <CalendarIcon className="w-4 h-4" />
                        <span>Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    {task.notes && !isCompleted && (
                        <p className="text-xs text-text-secondary mt-2 italic px-2 py-1 bg-muted rounded">
                            "{task.notes}"
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

interface TaskFormModalProps {
    team: string[];
    onSave: (task: Omit<Task, 'id' | 'status'>) => void;
    onClose: () => void;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ team, onSave, onClose }) => {
    const [title, setTitle] = useState('');
    const [assignedTo, setAssignedTo] = useState(team[0]);
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
    const [recurring, setRecurring] = useState<RecurringType>('No');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !dueDate) return alert('Task name and due date are required');

        onSave({
            title,
            assignedTo,
            dueDate,
            recurring,
            notes
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-popover rounded-t-2xl md:rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-border flex justify-between items-center sticky top-0 bg-popover z-10">
                    <h3 className="text-xl font-bold text-text-primary">Create New Task</h3>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded-full text-text-secondary"><CloseIcon className="w-6 h-6" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-1">Task Name *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g., Clean drinker lines"
                            className="w-full p-3 border border-border rounded-lg bg-card text-text-primary"
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-1">Assign To *</label>
                        <div className="relative">
                            <select
                                value={assignedTo}
                                onChange={e => setAssignedTo(e.target.value)}
                                className="w-full p-3 border border-border rounded-lg bg-card text-text-primary appearance-none"
                            >
                                {team.map(member => (
                                    <option key={member} value={member}>{member}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-text-secondary mb-1">Due Date *</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className="w-full p-3 border border-border rounded-lg bg-card text-text-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-text-secondary mb-1">Repeat?</label>
                            <div className="relative">
                                <select
                                    value={recurring}
                                    onChange={e => setRecurring(e.target.value as RecurringType)}
                                    className="w-full p-3 border border-border rounded-lg bg-card text-text-primary appearance-none"
                                >
                                    <option value="No">No</option>
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                </select>
                                <ChevronDownIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-1">Notes / Instructions</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Optional instructions for the team..."
                            className="w-full h-24 p-3 border border-border rounded-lg bg-card text-text-primary"
                        />
                    </div>

                    <div className="pt-4 sticky bottom-0 bg-popover">
                        <button
                            type="submit"
                            className="w-full bg-primary text-white font-bold py-4 rounded-xl text-lg hover:bg-primary-600 active:scale-95 transition-all shadow-lg"
                        >
                            SAVE TASK
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskManagementScreen;
