
import React, { useState } from 'react';
import type { Screen } from '../App';
import DailyLogScreen from './DailyLogScreen';
import TaskManagementScreen from './TaskManagementScreen';
import BroilerLogScreen from './BroilerLogScreen';
import FishLogScreen from './FishLogScreen';
import type { Farm } from './FarmManagementScreen';
import type { Batch, Sector } from './BatchManagementScreen';
import { ClipboardListIcon, TaskIcon } from './icons';

interface TaskContainerScreenProps {
    onNavigate: (screen: Screen) => void;
    farm: Farm | null;
    batch: Batch | null;
    activeSector: Sector;
}

type Tab = 'log' | 'assign';

const TaskContainerScreen: React.FC<TaskContainerScreenProps> = ({ onNavigate, farm, batch, activeSector }) => {
    const [activeTab, setActiveTab] = useState<Tab>('assign'); // Default to Assign (Tasks) or Log? User Note 1 says "Log and Assign(previously the Task form)".

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

    return (
        <div className="bg-background min-h-screen flex flex-col">
            {/* Top Tab Navigation */}
            <div className="bg-card border-b border-border sticky top-0 z-20">
                <div className="flex max-w-md mx-auto">
                    <button
                        onClick={() => setActiveTab('assign')}
                        className={`flex-1 py-4 text-center font-bold text-sm uppercase tracking-wide transition-colors relative ${activeTab === 'assign'
                            ? 'text-primary'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <TaskIcon className="w-5 h-5" isActive={activeTab === 'assign'} />
                            <span>Tasks / Assign</span>
                        </div>
                        {activeTab === 'assign' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full mx-4" />
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('log')}
                        className={`flex-1 py-4 text-center font-bold text-sm uppercase tracking-wide transition-colors relative ${activeTab === 'log'
                            ? 'text-primary'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <ClipboardListIcon className="w-5 h-5" isActive={activeTab === 'log'} />
                            <span>Daily Log</span>
                        </div>
                        {activeTab === 'log' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full mx-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="animate-fade-in h-full">
                    {activeTab === 'assign' ? (
                        <TaskManagementScreen onNavigate={onNavigate} />
                    ) : (
                        renderLogScreen()
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskContainerScreen;
