
import React, { useState } from 'react';
import { Screen } from '../App';
import { ChevronLeftIcon, PlusIcon, PencilIcon, TrashIcon, StethoscopeIcon, CloseIcon, WarningIcon } from './icons';
import { Sector } from './BatchManagementScreen';

interface HealthScheduleScreenProps {
    onNavigate: (screen: Screen) => void;
}

type TimeUnit = 'Day' | 'Week';

interface ScheduleTask {
    id: string;
    timeValue: number;
    timeUnit: TimeUnit;
    title: string;
    dosage: string;
    method: string;
}

interface ScheduleTemplate {
    id: string;
    name: string;
    sector: Sector;
    isDefault: boolean;
    tasks: ScheduleTask[];
}

const MOCK_TEMPLATES: ScheduleTemplate[] = [
    {
        id: 'def_1',
        name: 'Standard Broiler Schedule',
        sector: 'Broiler',
        isDefault: true,
        tasks: [
            { id: 't1', timeValue: 1, timeUnit: 'Day', title: 'Multivitamins & Glucose', dosage: '10g/4L', method: 'Drinking Water' },
            { id: 't2', timeValue: 7, timeUnit: 'Day', title: 'Newcastle Disease (Lasota)', dosage: '1 vial/1000 birds', method: 'Drinking Water' },
            { id: 't3', timeValue: 14, timeUnit: 'Day', title: 'Gumboro (IBD)', dosage: '1 vial/1000 birds', method: 'Drinking Water' },
        ]
    },
    {
        id: 'def_2',
        name: 'Layer Pullet Rearing',
        sector: 'Layer',
        isDefault: true,
        tasks: [
             { id: 't4', timeValue: 1, timeUnit: 'Day', title: 'Marek\'s Vaccine', dosage: '0.2ml/bird', method: 'Subcutaneous Injection' },
        ]
    }
];

const HealthScheduleScreen: React.FC<HealthScheduleScreenProps> = ({ onNavigate }) => {
    const [templates, setTemplates] = useState<ScheduleTemplate[]>(MOCK_TEMPLATES);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [templateToEdit, setTemplateToEdit] = useState<ScheduleTemplate | null>(null);
    const [templateToDelete, setTemplateToDelete] = useState<ScheduleTemplate | null>(null);

    const handleCreateNew = () => {
        setTemplateToEdit(null);
        setIsEditorOpen(true);
    };

    const handleEdit = (template: ScheduleTemplate) => {
        setTemplateToEdit(template);
        setIsEditorOpen(true);
    };

    const handleDeleteClick = (template: ScheduleTemplate) => {
        setTemplateToDelete(template);
    };

    const confirmDelete = () => {
        if (templateToDelete) {
            setTemplates(prev => prev.filter(t => t.id !== templateToDelete.id));
            setTemplateToDelete(null);
        }
    };

    const handleSaveTemplate = (savedTemplate: ScheduleTemplate) => {
        setTemplates(prev => {
            const index = prev.findIndex(t => t.id === savedTemplate.id);
            if (index !== -1) {
                // Update existing
                const updatedTemplates = [...prev];
                updatedTemplates[index] = savedTemplate;
                return updatedTemplates;
            } else {
                // Create new
                return [...prev, savedTemplate];
            }
        });
        setIsEditorOpen(false);
        setTemplateToEdit(null);
    };

    const defaultTemplates = templates.filter(t => t.isDefault);
    const customTemplates = templates.filter(t => !t.isDefault);

    return (
        <div className="bg-background min-h-screen">
            <header className="bg-card p-4 pt-6 shadow-md sticky top-0 z-10 flex items-center justify-between">
                <button onClick={() => onNavigate('settings')} className="p-2 -ml-2 text-text-secondary hover:text-primary">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-bold text-text-primary">Health Schedules</h1>
                    <p className="text-text-secondary text-xs">Manage vaccination & medication plans.</p>
                </div>
                <div className="w-6"></div>
            </header>

            <div className="p-4 space-y-6">
                <button 
                    onClick={handleCreateNew}
                    className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl text-lg flex items-center justify-center gap-2 hover:bg-primary-600 active:bg-primary-700 transition-colors"
                >
                    <PlusIcon className="w-6 h-6" />
                    CREATE NEW TEMPLATE
                </button>

                <div>
                    <h2 className="text-sm font-bold text-text-secondary uppercase mb-3 px-1">Default Templates</h2>
                    <div className="space-y-3">
                        {defaultTemplates.map(template => (
                            <div key={template.id} className="bg-card p-4 rounded-xl shadow-sm border border-border opacity-80">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-muted p-2 rounded-lg text-text-secondary">
                                            <StethoscopeIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-text-primary">{template.name}</p>
                                            <p className="text-xs text-text-secondary">{template.sector} • {template.tasks.length} tasks</p>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-muted px-2 py-1 rounded text-text-secondary font-medium">Read-only</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-sm font-bold text-text-secondary uppercase mb-3 px-1">My Custom Templates</h2>
                    {customTemplates.length === 0 ? (
                        <div className="text-center py-8 text-text-secondary bg-card rounded-xl border border-dashed border-border">
                            <p>No custom templates yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {customTemplates.map(template => (
                                <div key={template.id} className="bg-card p-4 rounded-xl shadow-sm border border-border">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                                                <StethoscopeIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-text-primary">{template.name}</p>
                                                <p className="text-xs text-text-secondary">{template.sector} • {template.tasks.length} tasks</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(template)} className="p-2 text-text-secondary hover:text-primary bg-muted rounded-full">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteClick(template)} className="p-2 text-text-secondary hover:text-danger bg-muted rounded-full">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isEditorOpen && (
                <TemplateEditorModal 
                    template={templateToEdit} 
                    onSave={handleSaveTemplate} 
                    onClose={() => setIsEditorOpen(false)} 
                />
            )}
            
            {templateToDelete && (
                <DeleteConfirmationModal 
                    template={templateToDelete}
                    onConfirm={confirmDelete}
                    onClose={() => setTemplateToDelete(null)}
                />
            )}
        </div>
    );
};

interface TemplateEditorModalProps {
    template: ScheduleTemplate | null;
    onSave: (template: ScheduleTemplate) => void;
    onClose: () => void;
}

const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({ template, onSave, onClose }) => {
    const [name, setName] = useState(template?.name || '');
    const [sector, setSector] = useState<Sector>(template?.sector || 'Layer');
    const [tasks, setTasks] = useState<ScheduleTask[]>(template?.tasks || [{ id: Date.now().toString(), timeValue: 1, timeUnit: 'Day', title: '', dosage: '', method: '' }]);

    const handleAddTask = () => {
        setTasks(prev => [...prev, { id: Date.now().toString(), timeValue: 1, timeUnit: 'Day', title: '', dosage: '', method: '' }]);
    };

    const handleRemoveTask = (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
    };

    const updateTask = (id: string, field: keyof ScheduleTask, value: any) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return alert('Template name is required');
        if (tasks.length === 0) return alert('At least one task is required');

        const newTemplate: ScheduleTemplate = {
            id: template?.id || Date.now().toString(),
            name,
            sector,
            isDefault: false,
            tasks
        };
        onSave(newTemplate);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
            <div className="bg-popover rounded-t-2xl md:rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-border flex justify-between items-center sticky top-0 bg-popover z-10">
                    <h3 className="text-xl font-bold text-text-primary">{template ? 'Edit Template' : 'Create New Template'}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded-full text-text-secondary"><CloseIcon className="w-6 h-6" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-5 space-y-6 flex-grow overflow-y-auto">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-text-secondary mb-1">Template Name *</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., My Organic Broiler Meds" className="w-full p-3 border border-border rounded-lg bg-card text-text-primary" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-text-secondary mb-1">Sector *</label>
                            <select value={sector} onChange={e => setSector(e.target.value as Sector)} className="w-full p-3 border border-border rounded-lg bg-card text-text-primary">
                                <option value="Layer">Layer</option>
                                <option value="Broiler">Broiler</option>
                                <option value="Fish">Fish</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-bold text-text-primary uppercase">Schedule Tasks</h4>
                            <span className="text-xs text-text-secondary">{tasks.length} tasks</span>
                        </div>
                        
                        <div className="space-y-3">
                            {tasks.map((task, index) => (
                                <div key={task.id} className="bg-card p-4 rounded-xl border border-border shadow-sm relative group">
                                    <div className="grid grid-cols-12 gap-3">
                                        <div className="col-span-4 md:col-span-2">
                                            <label className="block text-xs font-semibold text-text-secondary mb-1">Timeline</label>
                                            <div className="flex">
                                                <input 
                                                    type="number" 
                                                    min="1"
                                                    value={task.timeValue} 
                                                    onChange={e => updateTask(task.id, 'timeValue', parseInt(e.target.value))} 
                                                    className="w-full p-2 border border-border rounded-l-lg bg-background text-text-primary text-center font-bold" 
                                                />
                                                <select 
                                                    value={task.timeUnit} 
                                                    onChange={e => updateTask(task.id, 'timeUnit', e.target.value)} 
                                                    className="bg-muted border-y border-r border-border rounded-r-lg text-xs font-medium px-1 text-text-primary"
                                                >
                                                    <option value="Day">Day</option>
                                                    <option value="Week">Wk</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-span-8 md:col-span-4">
                                            <label className="block text-xs font-semibold text-text-secondary mb-1">Task Name</label>
                                            <input 
                                                type="text" 
                                                value={task.title} 
                                                onChange={e => updateTask(task.id, 'title', e.target.value)} 
                                                placeholder="e.g. Gumboro Vaccine" 
                                                className="w-full p-2 border border-border rounded-lg bg-background text-text-primary" 
                                                required
                                            />
                                        </div>
                                        <div className="col-span-6 md:col-span-3">
                                            <label className="block text-xs font-semibold text-text-secondary mb-1">Dosage</label>
                                            <input 
                                                type="text" 
                                                value={task.dosage} 
                                                onChange={e => updateTask(task.id, 'dosage', e.target.value)} 
                                                placeholder="e.g. 10g/L" 
                                                className="w-full p-2 border border-border rounded-lg bg-background text-text-primary" 
                                            />
                                        </div>
                                        <div className="col-span-6 md:col-span-3">
                                            <label className="block text-xs font-semibold text-text-secondary mb-1">Method</label>
                                            <input 
                                                type="text" 
                                                value={task.method} 
                                                onChange={e => updateTask(task.id, 'method', e.target.value)} 
                                                placeholder="e.g. Water" 
                                                list="methods"
                                                className="w-full p-2 border border-border rounded-lg bg-background text-text-primary" 
                                            />
                                            <datalist id="methods">
                                                <option value="Drinking Water" />
                                                <option value="Feed Mix" />
                                                <option value="Injection" />
                                                <option value="Spray" />
                                                <option value="Eye Drop" />
                                            </datalist>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveTask(task.id)}
                                        className="absolute -top-2 -right-2 bg-red-100 text-danger p-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-200"
                                        title="Remove task"
                                    >
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <button 
                            type="button" 
                            onClick={handleAddTask}
                            className="mt-4 w-full py-2 border-2 border-dashed border-primary/50 text-primary font-bold rounded-xl hover:bg-primary/5 hover:border-primary transition-colors flex items-center justify-center gap-2"
                        >
                            <PlusIcon className="w-5 h-5" /> Add Another Task
                        </button>
                    </div>
                </form>

                <div className="p-4 border-t border-border bg-popover sticky bottom-0 z-10">
                    <button 
                        onClick={handleSubmit}
                        className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl text-lg hover:bg-primary-600 active:scale-95 transition-all shadow-md"
                    >
                        {template ? 'SAVE CHANGES' : 'SAVE TEMPLATE'}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface DeleteConfirmationModalProps {
    template: ScheduleTemplate;
    onConfirm: () => void;
    onClose: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ template, onConfirm, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
             <div className="bg-popover rounded-2xl shadow-lg p-6 w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
                <div className="mx-auto bg-red-100 dark:bg-red-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <WarningIcon className="w-6 h-6 text-danger" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-text-primary">Delete Template?</h3>
                <p className="text-text-secondary text-sm mb-6">
                    Are you sure you want to permanently delete the '<span className="font-semibold">{template.name}</span>' schedule? This action cannot be undone.
                </p>
                <div className="flex justify-center gap-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-text-primary bg-muted hover:bg-border font-semibold">Cancel</button>
                    <button onClick={onConfirm} className="px-6 py-2 rounded-lg text-white bg-danger hover:bg-red-600 font-semibold">Delete</button>
                </div>
            </div>
        </div>
    );
};

export default HealthScheduleScreen;
