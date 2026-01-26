import React, { useState, useEffect } from 'react';
import { Screen } from '../App';
import { ChevronLeftIcon, StethoscopeIcon, WarningIcon, InfoIcon, CopyIcon } from './icons';
import { Sector } from './BatchManagementScreen';
import { healthSchedulesService, batchesService } from '../services/database';
import { useFarm } from '../contexts/FarmContext';
import type { Tables } from '../types/database';

interface HealthScheduleScreenProps {
    onNavigate: (screen: Screen) => void;
}

const HealthScheduleScreen: React.FC<HealthScheduleScreenProps> = ({ onNavigate }) => {
    const { activeFarm } = useFarm();
    const [universalTemplates, setUniversalTemplates] = useState<Tables<'health_schedules'>[]>([]);
    const [batches, setBatches] = useState<Tables<'batches'>[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<Tables<'health_schedules'>[] | null>(null);
    const [batchAge, setBatchAge] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, [activeFarm]);

    const loadData = async () => {
        try {
            setLoading(true);
            // Load universal templates (both Layer and Broiler)
            const [layerTemplates, broilerTemplates] = await Promise.all([
                healthSchedulesService.listUniversal('Layer'),
                healthSchedulesService.listUniversal('Broiler'),
            ]);

            setUniversalTemplates([...layerTemplates, ...broilerTemplates]);

            // Load batches if farm is selected
            if (activeFarm) {
                const farmBatches = await batchesService.list(String(activeFarm.id));
                setBatches(farmBatches.filter(b => b.status === 'Active'));
            }
        } catch (error) {
            console.error('Error loading health schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyTemplate = async (sector: Sector) => {
        const templates = universalTemplates.filter(t => t.sector === sector);
        setSelectedTemplate(templates);

        // Load all user's batches (not just from activeFarm, since we might not have one set)
        try {
            console.log('Loading all batches for user');
            // Fetch all batches without farm filter - will get all user's batches via RLS
            const allBatches = await batchesService.list();
            console.log('Loaded batches:', allBatches);
            const activeBatches = allBatches.filter(b => b.status === 'Active');
            console.log('Active batches:', activeBatches);
            setBatches(activeBatches);
        } catch (error) {
            console.error('Error loading batches:', error);
        }
    };

    const handleApplyToBatch = async (batchId: string) => {
        if (!selectedTemplate || selectedTemplate.length === 0) return;

        try {
            const batch = batches.find(b => b.id === batchId);
            if (!batch || !batch.start_date) {
                alert('Selected batch must have a start date');
                return;
            }

            await healthSchedulesService.copyTemplateToBatch(
                selectedTemplate[0].sector!,
                batchId,
                batch.start_date
            );

            alert('Template successfully copied to batch!');
            setSelectedTemplate(null);
        } catch (error) {
            console.error('Error copying template:', error);
            alert('Failed to copy template. Please try again.');
        }
    };

    // Group templates by sector
    const layerTemplates = universalTemplates.filter(t => t.sector === 'Layer');
    const broilerTemplates = universalTemplates.filter(t => t.sector === 'Broiler');

    if (loading) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center">
                <p className="text-text-secondary">Loading...</p>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen pb-20">
            <header className="bg-card p-4 pt-6 shadow-md sticky top-0 z-10 flex items-center justify-between">
                <button onClick={() => onNavigate('settings')} className="p-2 -ml-2 text-text-secondary hover:text-primary" aria-label="Go back to settings">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-bold text-text-primary">Health Schedules</h1>
                    <p className="text-text-secondary text-xs">Official vaccination templates</p>
                </div>
                <div className="w-6"></div>
            </header>

            <div className="p-4 space-y-6">
                {/* Info Alert */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
                    <InfoIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">Official Templates</p>
                        <p className="text-xs text-blue-700 dark:text-blue-200">
                            Click "Copy to Batch" to apply a schedule to your batches. Vaccination programmes may vary depending on species, location, and management.
                        </p>
                    </div>
                </div>

                {/* Layer Template */}
                {layerTemplates.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold text-text-secondary uppercase mb-3 px-1">Layer / Broiler Schedule</h2>
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
                                    onClick={() => handleCopyTemplate('Layer')}
                                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-600"
                                >
                                    <CopyIcon className="w-4 h-4" />
                                    Copy to Batch
                                </button>
                            </div>

                            {/* Template Timeline */}
                            <div className="p-4 space-y-3">
                                {layerTemplates.map((task, index) => (
                                    <div key={task.id} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${task.is_compulsory
                                                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-2 border-orange-500'
                                                : 'bg-muted border-2 border-border text-text-secondary'
                                                }`}>
                                                {task.day_number}
                                            </div>
                                            {index < layerTemplates.length - 1 && (
                                                <div className="w-0.5 h-full bg-border mt-1"></div>
                                            )}
                                        </div>
                                        <div className={`flex-1 pb-3 ${task.is_compulsory ? 'bg-orange-50 dark:bg-orange-900/10 -ml-2 -mr-2 pl-2 pr-2 rounded-lg' : ''}`}>
                                            <p className="text-sm font-semibold text-text-primary">
                                                {task.vaccine_name}
                                                {task.is_compulsory && <span className="ml-2 text-xs text-orange-600 font-bold">(COMPULSORY)</span>}
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
                                    </div>
                                ))}
                            </div>

                            {/* Disclaimer */}
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border-t border-yellow-200 dark:border-yellow-800 flex gap-3 rounded-b-xl">
                                <WarningIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-900 dark:text-yellow-100">
                                    <span className="font-semibold">Note:</span> Vaccination programmes for birds may vary depending on circumstances i.e species, location and management.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Apply Template Modal */}
            {selectedTemplate && (
                <ApplyTemplateModal
                    batches={batches}
                    onApply={handleApplyToBatch}
                    onClose={() => setSelectedTemplate(null)}
                />
            )}
        </div>
    );
};

interface ApplyTemplateModalProps {
    batches: Tables<'batches'>[];
    onApply: (batchId: string) => void;
    onClose: () => void;
}

const ApplyTemplateModal: React.FC<ApplyTemplateModalProps> = ({ batches, onApply, onClose }) => {
    const [selectedBatchId, setSelectedBatchId] = useState<string>('');

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
                    <h3 className="text-xl font-bold text-text-primary">Copy Template to Batch</h3>
                    <p className="text-sm text-text-secondary mt-1">Select a batch to apply the health schedule</p>
                </div>

                <div className="p-6 space-y-4">
                    {batches.length === 0 ? (
                        <p className="text-center text-text-secondary py-4">No active batches available. Please create a batch first.</p>
                    ) : (
                        <div className="space-y-2">
                            {batches.map(batch => (
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
                        disabled={!selectedBatchId || batches.length === 0}
                        className="flex-1 px-4 py-3 rounded-lg text-white bg-primary hover:bg-primary-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Apply Template
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HealthScheduleScreen;
