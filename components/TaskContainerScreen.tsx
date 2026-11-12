
import React, { useState, useMemo, useEffect } from 'react';
import type { Screen } from '../App';
import DailyLogScreen from './DailyLogScreen';
import TaskManagementScreen from './TaskManagementScreen';
import BroilerLogScreen from './BroilerLogScreen';
import FishLogScreen from './FishLogScreen';
import LogHistory from './LogHistory';
import type { Farm } from './FarmManagementScreen';
import type { Batch, Sector } from './BatchManagementScreen';
import { ClipboardListIcon, TaskIcon, PlusIcon, ClockIcon, ChevronLeftIcon } from './icons';
import { useFarm } from '../contexts/FarmContext';
import { isSectorEnabled, sectorConfig } from '../config/sectors';

interface TaskContainerScreenProps {
    onNavigate: (screen: Screen) => void;
    farm: Farm | null;
    batch: Batch | null;
    activeSector: Sector;
}

type MainTab = 'log' | 'assign';
type SubView = 'new' | 'history';

const TaskContainerScreen: React.FC<TaskContainerScreenProps> = ({ onNavigate, farm, batch, activeSector }) => {
    const [activeTab, setActiveTab] = useState<MainTab>('log');
    const [logSubView, setLogSubView] = useState<SubView>('new');
    const [assignSubView, setAssignSubView] = useState<SubView>('new');

    // The batch being logged for is chosen here, so a log always has a farm and a
    // batch even when the dashboard is showing "All farms".
    const { farms, batches } = useFarm();
    const loggableBatches = useMemo(
        () => batches.filter(b => b.status === 'Active' && isSectorEnabled(b.sector)),
        [batches]
    );
    const [logBatchId, setLogBatchId] = useState('');

    useEffect(() => {
        if (logBatchId && loggableBatches.some(b => String(b.id) === logBatchId)) return;
        // Preselect only when there is no doubt which batch is meant
        let preselected = batch && loggableBatches.find(b => b.id === batch.id);
        if (!preselected) {
            const inScope = loggableBatches.filter(b => b.sector === activeSector && (!farm || b.farm === farm.name));
            if (inScope.length === 1) preselected = inScope[0];
            else if (loggableBatches.length === 1) preselected = loggableBatches[0];
        }
        setLogBatchId(preselected ? String(preselected.id) : '');
    }, [loggableBatches, batch, farm, activeSector, logBatchId]);

    const logBatch = loggableBatches.find(b => String(b.id) === logBatchId) || null;
    const logFarm = logBatch
        ? farms.find(f => String(f.id) === logBatch.farmId || f.name === logBatch.farm) || null
        : null;

    const renderLogScreen = () => {
        if (!logBatch || !logFarm) return null;
        switch (logBatch.sector) {
            case 'Broiler':
                return <BroilerLogScreen key={logBatchId} onNavigate={onNavigate} farm={logFarm} batch={logBatch} />;
            case 'Fish':
                return <FishLogScreen key={logBatchId} onNavigate={onNavigate} farm={logFarm} batch={logBatch} />;
            case 'Layer':
            default:
                return <DailyLogScreen key={logBatchId} onNavigate={onNavigate} farm={logFarm} batch={logBatch} activeSector={logBatch.sector} />;
        }
    };

    const renderBatchPicker = () => {
        if (loggableBatches.length === 0) {
            return (
                <div className="p-4 max-w-2xl mx-auto">
                    <div className="bg-card border border-border rounded-2xl p-6 text-center">
                        <p className="font-bold text-text-primary mb-1">No active batch yet</p>
                        <p className="text-sm text-text-secondary mb-4">Add a batch of birds first, then you can log feed, deaths and eggs for it.</p>
                        <button onClick={() => onNavigate('batches')} className="bg-primary text-white font-bold px-5 py-2.5 rounded-xl">
                            Add a batch
                        </button>
                    </div>
                </div>
            );
        }
        return (
            <div className="px-4 pt-4 max-w-2xl mx-auto">
                <label htmlFor="log-batch" className="block text-xs font-bold uppercase tracking-wide text-text-secondary mb-1">
                    Logging for
                </label>
                <select
                    id="log-batch"
                    value={logBatchId}
                    onChange={e => setLogBatchId(e.target.value)}
                    className="w-full p-3 border border-border rounded-xl bg-card text-text-primary font-medium"
                >
                    <option value="">Choose a batch…</option>
                    {loggableBatches.map(b => (
                        <option key={String(b.id)} value={String(b.id)}>
                            {b.farm} · {b.name} ({sectorConfig(b.sector)?.label || b.sector})
                        </option>
                    ))}
                </select>
                {!logBatch && (
                    <p className="text-sm text-text-secondary mt-3">Choose which batch this log is for to continue.</p>
                )}
            </div>
        );
    };

    const renderLogContent = () => {
        if (logSubView === 'new') {
            return (
                <>
                    {renderBatchPicker()}
                    {renderLogScreen()}
                </>
            );
        } else {
            return (
                <div className="p-4">
                    <LogHistory onNavigate={onNavigate} />
                </div>
            );
        }
    };

    const renderAssignContent = () => {
        // TaskManagementScreen already has its own list view, so we use it for both
        // The 'new' sub-view shows with form open option, 'history' shows list only
        return <TaskManagementScreen onNavigate={onNavigate} showFormByDefault={assignSubView === 'new'} />;
    };

    // Segmented Control Component
    const SegmentedControl = ({
        activeView,
        onViewChange,
        newLabel,
        historyLabel
    }: {
        activeView: SubView;
        onViewChange: (view: SubView) => void;
        newLabel: string;
        historyLabel: string;
    }) => (
        <div className="flex bg-muted p-1 rounded-xl mx-4 mt-4">
            <button
                onClick={() => onViewChange('new')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeView === 'new'
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                    }`}
            >
                <PlusIcon className="w-4 h-4" />
                {newLabel}
            </button>
            <button
                onClick={() => onViewChange('history')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeView === 'history'
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                    }`}
            >
                <ClockIcon className="w-4 h-4" />
                {historyLabel}
            </button>
        </div>
    );

    return (
        <div className="bg-background min-h-screen flex flex-col">
            {/* Header with Back Button */}
            <header className="bg-card p-4 pt-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
                        aria-label="Back to Dashboard"
                    >
                        <ChevronLeftIcon className="w-6 h-6 text-text-secondary" />
                    </button>
                    <h1 className="text-2xl font-bold text-text-primary">Task Hub</h1>
                </div>
            </header>

            {/* Main Tab Navigation */}
            <div className="bg-card border-b border-border">
                <div className="flex max-w-md mx-auto">
                    <button
                        onClick={() => setActiveTab('log')}
                        className={`flex-1 py-4 text-center font-bold text-sm uppercase tracking-wide transition-colors relative ${activeTab === 'log'
                            ? 'text-primary'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <ClipboardListIcon className="w-5 h-5" isActive={activeTab === 'log'} />
                            <span>Log</span>
                        </div>
                        {activeTab === 'log' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full mx-4" />
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('assign')}
                        className={`flex-1 py-4 text-center font-bold text-sm uppercase tracking-wide transition-colors relative ${activeTab === 'assign'
                            ? 'text-primary'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <TaskIcon className="w-5 h-5" isActive={activeTab === 'assign'} />
                            <span>Assign</span>
                        </div>
                        {activeTab === 'assign' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full mx-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Sub-view Segmented Control */}
            {activeTab === 'log' && (
                <SegmentedControl
                    activeView={logSubView}
                    onViewChange={setLogSubView}
                    newLabel="New Log"
                    historyLabel="View History"
                />
            )}
            {activeTab === 'assign' && (
                <SegmentedControl
                    activeView={assignSubView}
                    onViewChange={setAssignSubView}
                    newLabel="New Task"
                    historyLabel="View Tasks"
                />
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="animate-fade-in h-full">
                    {activeTab === 'log' ? renderLogContent() : renderAssignContent()}
                </div>
            </div>
        </div>
    );
};

export default TaskContainerScreen;

