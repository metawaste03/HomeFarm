
import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

interface TaskContextType {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id' | 'status'>) => void;
    toggleTaskStatus: (taskId: string) => void;
    deleteTask: (taskId: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>([]);

    const addTask = (newTask: Omit<Task, 'id' | 'status'>) => {
        const task: Task = {
            ...newTask,
            id: Date.now().toString(),
            status: 'pending'
        };
        setTasks(prev => [task, ...prev]);
    };

    const toggleTaskStatus = (taskId: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id === taskId) {
                return { ...t, status: t.status === 'pending' ? 'completed' : 'pending' };
            }
            return t;
        }));
    };

    const deleteTask = (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
    };

    return (
        <TaskContext.Provider value={{ tasks, addTask, toggleTaskStatus, deleteTask }}>
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
