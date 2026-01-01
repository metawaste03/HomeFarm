import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { tasksService } from '../services/database';
import { useAuth } from './AuthContext';
import { useFarm } from './FarmContext';
import type { Tables } from '../types/database';

export type TaskStatus = 'pending' | 'completed';
export type RecurringType = 'No' | 'Daily' | 'Weekly' | 'Monthly';

export interface Task {
    id: string;
    title: string;
    assignedTo: string;
    dueDate: string;
    recurring: RecurringType;
    notes: string;
    status: TaskStatus;
    farmId?: string; // Optional for backwards compatibility
}

interface TaskContextType {
    tasks: Task[];
    loading: boolean;
    error: string | null;
    addTask: (task: Omit<Task, 'id' | 'status'>) => Promise<void>;
    updateTask: (task: Task) => Promise<void>;
    toggleTaskStatus: (taskId: string) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Helper to convert database task to app task
const dbTaskToAppTask = (dbTask: Tables<'tasks'>): Task => ({
    id: dbTask.id,
    title: dbTask.title,
    assignedTo: dbTask.assigned_to || '',
    dueDate: dbTask.due_date || '',
    recurring: dbTask.recurring as RecurringType,
    notes: dbTask.notes || '',
    status: dbTask.status as TaskStatus,
    farmId: dbTask.farm_id,
});

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { farms } = useFarm();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshTasks = useCallback(async () => {
        if (!user || farms.length === 0) {
            setTasks([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fetch tasks for all farms the user has access to
            const dbTasks = await tasksService.list();
            const appTasks = dbTasks.map(dbTaskToAppTask);
            setTasks(appTasks);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError('Failed to load tasks. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [user, farms]);

    // Load tasks when user or farms change
    useEffect(() => {
        refreshTasks();
    }, [refreshTasks]);

    const addTask = async (newTask: Omit<Task, 'id' | 'status'>) => {
        if (!user) return;

        // Use the first farm if no farmId is provided
        const farmId = newTask.farmId || farms[0]?.id;
        if (!farmId) {
            throw new Error('No farm available. Please create a farm first.');
        }

        try {
            const dbTask = await tasksService.create({
                farm_id: String(farmId),
                title: newTask.title,
                assigned_to: newTask.assignedTo || null,
                due_date: newTask.dueDate || null,
                recurring: newTask.recurring,
                notes: newTask.notes || null,
                status: 'pending',
                created_by: user.id,
            });

            const task = dbTaskToAppTask(dbTask);
            setTasks(prev => [task, ...prev]);
        } catch (err) {
            console.error('Error adding task:', err);
            throw err;
        }
    };

    const updateTask = async (updatedTask: Task) => {
        try {
            await tasksService.update(updatedTask.id, {
                title: updatedTask.title,
                assigned_to: updatedTask.assignedTo || null,
                due_date: updatedTask.dueDate || null,
                recurring: updatedTask.recurring,
                notes: updatedTask.notes || null,
                status: updatedTask.status,
            });
            setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        } catch (err) {
            console.error('Error updating task:', err);
            throw err;
        }
    };

    const toggleTaskStatus = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const newStatus: TaskStatus = task.status === 'pending' ? 'completed' : 'pending';

        try {
            await tasksService.update(taskId, { status: newStatus });
            setTasks(prev => prev.map(t => {
                if (t.id === taskId) {
                    return { ...t, status: newStatus };
                }
                return t;
            }));
        } catch (err) {
            console.error('Error toggling task status:', err);
            throw err;
        }
    };

    const deleteTask = async (taskId: string) => {
        try {
            await tasksService.delete(taskId);
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (err) {
            console.error('Error deleting task:', err);
            throw err;
        }
    };

    return (
        <TaskContext.Provider value={{
            tasks,
            loading,
            error,
            addTask,
            toggleTaskStatus,
            updateTask,
            deleteTask,
            refreshTasks,
        }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};
