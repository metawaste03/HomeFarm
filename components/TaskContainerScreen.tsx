
import React, { useState } from 'react';
import type { Screen } from '../App';
import DailyLogScreen from './DailyLogScreen';
import TaskManagementScreen from './TaskManagementScreen';
import BroilerLogScreen from './BroilerLogScreen';
import FishLogScreen from './FishLogScreen';
import LogHistory from './LogHistory';
import type { Farm } from './FarmManagementScreen';
import type { Batch, Sector } from './BatchManagementScreen';
import { ClipboardListIcon, TaskIcon, PlusIcon, ClockIcon } from './icons';

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

    const renderLogScreen = () => {
        switch (activeSector) {
            case 'Broiler':
                return <BroilerLogScreen onNavigate={onNavigate} farm={farm} batch={batch} />;
            case 'Fish':
                return <FishLogScreen onNavigate={onNavigate} farm={farm} batch={batch} />;
            case 'Layer':
            default:
                return <DailyLogScreen onNavigate={onNavigate} farm={farm} batch={batch} activeSector={activeSector} />;
        }
    };

    const renderLogContent = () => {
        if (logSubView === 'new') {
            return renderLogScreen();
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
            {/* Header */}
            <header className="bg-card p-4 pt-6 shadow-sm">
                <h1 className="text-2xl font-bold text-center text-text-primary">Task Hub</h1>
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

