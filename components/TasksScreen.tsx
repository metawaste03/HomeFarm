
import React, { useState, useMemo } from 'react';
import { Screen } from '../App';
import { CheckCircleIcon, PlusIcon, CalendarIcon, UserPlusIcon, EllipsisIcon, TrashIcon, ClockIcon } from './icons';

interface TasksScreenProps {
    onNavigate: (screen: Screen) => void;
}

export type TaskStatus = 'pending' | 'completed';
export type Recurrence = 'None' | 'Daily' | 'Weekly' | 'Monthly';

export interface User {
    id: string;
    name: string;
    role: 'Owner' | 'Manager' | 'Worker';
    avatarColor: string;
}

export interface Task {
    id: number;
    title: string;
    assignedTo: string; // User ID
    dueDate: string; // YYYY-MM-DD
    status: TaskStatus;
    isRecurring: boolean;
    recurrence: Recurrence;
    notes?: string;
}

const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Femi', role: 'Owner', avatarColor: 'bg-blue-500' },
    { id: 'u2', name: 'Aisha', role: 'Manager', avatarColor: 'bg-purple-500' },
    { id: 'u3', name: 'Ben', role: 'Worker', avatarColor: 'bg-green-500' },
];

const MOCK_TASKS: Task[] = [
    { id: 1, title: 'Clean drinker lines', assignedTo: 'u3', dueDate: '2025-11-28', status: 'pending', isRecurring: false, recurrence: 'None', notes: 'Use the new solution.' },
    { id: 2, title: 'Deworm Broiler Batch 5', assignedTo: 'u2', dueDate: new Date().toISOString().split('T')[0], status: 'pending', isRecurring: false, recurrence: 'None' },
    { id: 3, title: 'Collect Eggs', assignedTo: 'u1', dueDate: new Date().toISOString().split('T')[0], status: 'pending', isRecurring: true, recurrence: 'Daily' },
    { id: 4, title: 'Buy Chicken Feed', assignedTo: 'u2', dueDate: '2025-12-01', status: 'completed', isRecurring: false, recurrence: 'None' },
];

// Determine "My User" for demo purposes
const CURRENT_USER_ID = 'u3'; // Simulating "Ben" logged in

const TasksScreen: React.FC<TasksScreenProps> = ({ onNavigate }) => {
    const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
    const [filter, setFilter] = useState<'my_tasks' | 'all_tasks' | 'overdue'>('my_tasks');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Derived State
    const filteredTasks = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];

        return tasks.filter(task => {
            if (task.status === 'completed') return filter === 'all_tasks'; // Only show completed in "All Tasks" for now, or maybe separate tab? Keeping simple.

            switch (filter) {
                case 'my_tasks':
                    return task.assignedTo === CURRENT_USER_ID;
                case 'overdue':
                    return task.dueDate < today && task.status === 'pending';
                case 'all_tasks':
                default:
                    return true;
            }
        }).sort((a, b) => a.dueDate.localeCompare(b.dueDate)); // Sort by due date
    }, [tasks, filter]);

    const handleToggleTask = (taskId: number) => {
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' } : t
        ));
    };

    const handleSaveTask = (newTask: Omit<Task, 'id' | 'status'>) => {
        const task: Task = {
            ...newTask,
            id: Date.now(),
            status: 'pending'
        };
        setTasks(prev => [task, ...prev]);
        setIsCreateModalOpen(false);
    };

    const handleDeleteTask = (taskId: number) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
    };

    return (
        <div className="bg-background min-h-screen pb-20 lg:pb-4">
            {/* Header */}
            <header className="bg-card p-4 pt-6 shadow-sm sticky top-0 z-10">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-text-primary">Tasks</h1>
                    {/* Filter Tabs */}
                    <div className="flex space-x-1 bg-muted/50 p-1 rounded-lg">
                        {(['my_tasks', 'all_tasks', 'overdue'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${filter === f
                                    ? 'bg-card text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                {f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Task List */}
            <div className="p-4 space-y-3">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-10 text-text-secondary">
                        <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-muted opacity-50" />
                        <p>No tasks found in this view.</p>
                    </div>
                ) : (
                    filteredTasks.map(task => {
                        const assignee = MOCK_USERS.find(u => u.id === task.assignedTo);
                        const isOverdue = task.dueDate < new Date().toISOString().split('T')[0] && task.status === 'pending';

                        return (
                            <div key={task.id} className={`bg-card p-4 rounded-xl shadow-sm border-l-4 ${isOverdue ? 'border-danger' : 'border-primary'} flex items-start gap-3 animate-fade-in`}>
                                <button
                                    onClick={() => handleToggleTask(task.id)}
                                    className={`mt-1 flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${task.status === 'completed'
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'border-text-secondary text-transparent hover:border-primary'
                                        }`}
                                    aria-label={task.status === 'completed' ? "Mark as pending" : "Mark as completed"}
                                >
                                    <CheckCircleIcon className="w-4 h-4" />
                                </button>

                                <div className="flex-grow">
                                    <h3 className={`font-bold text-text-primary ${task.status === 'completed' ? 'line-through text-text-secondary' : ''}`}>
                                        {task.title}
                                    </h3>

                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        {assignee && (
                                            <div className="flex items-center gap-1 text-xs text-text-secondary bg-muted px-2 py-0.5 rounded-full">
                                                <div className={`w-2 h-2 rounded-full ${assignee.avatarColor}`} />
                                                <span>{assignee.name}</span>
                                            </div>
                                        )}
                                        {task.isRecurring && (
                                            <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                                                <div className="w-3 h-3 border-2 border-current rounded-full border-t-transparent animate-spin-slow" /> {/* Simulated recurring icon */}
                                                <span>{task.recurrence}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center mt-2">
                                        <p className={`text-xs font-medium ${isOverdue ? 'text-danger' : 'text-text-secondary'}`}>
                                            Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    {task.notes && <p className="text-xs text-text-secondary mt-1 italic">"{task.notes}"</p>}
                                </div>

                                <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="text-text-secondary hover:text-danger p-1"
                                    aria-label={`Delete task: ${task.title}`}
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* FAB */}
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform z-20"
                aria-label="Create New Task"
            >
                <PlusIcon className="w-8 h-8" />
            </button>

            {/* Create Task Modal */}
            {isCreateModalOpen && (
                <TaskFormModal
                    users={MOCK_USERS}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSave={handleSaveTask}
                />
            )}
        </div>
    );
};

interface TaskFormModalProps {
    users: User[];
    onClose: () => void;
    onSave: (task: Omit<Task, 'id' | 'status'>) => void;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ users, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [assignedTo, setAssignedTo] = useState(users[0]?.id || '');
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
    const [recurrence, setRecurrence] = useState<Recurrence>('None');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title,
            assignedTo,
            dueDate,
            isRecurring: recurrence !== 'None',
            recurrence,
            notes
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-end lg:items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div
                className="bg-card w-full max-w-md rounded-t-3xl lg:rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-text-primary">Create New Task</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-sm font-semibold">Cancel</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="task-title" className="block text-sm font-medium text-text-secondary mb-1">Task Title <span className="text-danger">*</span></label>
                        <input
                            id="task-title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full p-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary font-semibold placeholder:font-normal"
                            placeholder="e.g., Vaccinate Layer Batch 2"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="assign-to" className="block text-sm font-medium text-text-secondary mb-1">Assign To</label>
                            <div className="relative">
                                <select
                                    id="assign-to"
                                    value={assignedTo}
                                    onChange={e => setAssignedTo(e.target.value)}
                                    className="w-full p-3 pl-3 pr-8 bg-muted/30 border border-border rounded-xl appearance-none text-text-primary"
                                >
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                                    <UserPlusIcon className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="due-date" className="block text-sm font-medium text-text-secondary mb-1">Due Date</label>
                            <input
                                id="due-date"
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className="w-full p-3 bg-muted/30 border border-border rounded-xl text-text-primary"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="recurrence" className="block text-sm font-medium text-text-secondary mb-1">Recurring Task?</label>
                        <select
                            id="recurrence"
                            value={recurrence}
                            onChange={e => setRecurrence(e.target.value as Recurrence)}
                            className="w-full p-3 bg-muted/30 border border-border rounded-xl text-text-primary"
                        >
                            <option value="None">No, one-time task</option>
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-text-secondary mb-1">Notes / Instructions</label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full p-3 bg-muted/30 border border-border rounded-xl h-24 text-text-primary resize-none"
                            placeholder="Add specific details..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-all mt-4"
                    >
                        SAVE TASK
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TasksScreen;
