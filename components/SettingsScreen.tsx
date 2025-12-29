
import React, { useState } from 'react';
import { Screen, Theme } from '../App';
import { HomeIcon, UsersIcon, ChevronRightIcon, BatchIcon, StethoscopeIcon } from './icons';

// A generic icon for appearance would be good here
const AppearanceIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
);


interface SettingsScreenProps {
    onNavigate: (screen: Screen) => void;
    onLogout: () => void;
    currentTheme: Theme;
    onThemeChange: (theme: Theme) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate, onLogout, currentTheme, onThemeChange }) => {
    const [isThemeModalOpen, setThemeModalOpen] = useState(false);

    return (
        <div className="bg-background min-h-screen">
            <header className="bg-card p-4 pt-6 shadow-md sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-center text-text-primary">Settings</h1>
            </header>
            
            <div className="p-4 space-y-4">
                <p className="px-2 text-sm text-text-secondary font-semibold">FARM CONFIGURATION</p>
                <div className="bg-card rounded-2xl shadow-md overflow-hidden">
                    <SettingsMenuItem
                        icon={<HomeIcon className="w-6 h-6 text-primary" />}
                        label="My Farms"
                        description="Add, edit, or remove your farm locations."
                        onClick={() => onNavigate('farms')}
                    />
                    <SettingsMenuItem
                        icon={<UsersIcon className="w-6 h-6 text-primary" />}
                        label="Team Management"
                        description="Invite staff and manage user roles."
                        onClick={() => onNavigate('team')}
                    />
                    <SettingsMenuItem
                        icon={<BatchIcon className="w-6 h-6 text-primary" />}
                        label="Batch Management"
                        description="Manage your active and completed batches."
                        onClick={() => onNavigate('batches')}
                    />
                    <SettingsMenuItem
                        icon={<StethoscopeIcon className="w-6 h-6 text-primary" />}
                        label="Health Schedules"
                        description="Create custom medication and vaccination plans."
                        onClick={() => onNavigate('health_schedules')}
                    />
                </div>

                <p className="px-2 text-sm text-text-secondary font-semibold mt-6">APPLICATION</p>
                 <div className="bg-card rounded-2xl shadow-md overflow-hidden">
                    <SettingsMenuItem
                        icon={<AppearanceIcon className="w-6 h-6 text-primary" />}
                        label="Appearance"
                        description={`Current: ${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}`}
                        onClick={() => setThemeModalOpen(true)}
                    />
                    <SettingsMenuItem
                        label="Notifications"
                        description="Set your alert preferences."
                        onClick={() => {}}
                    />
                </div>
                
                <p className="px-2 text-sm text-text-secondary font-semibold mt-6">ACCOUNT</p>
                <div className="bg-card rounded-2xl shadow-md overflow-hidden">
                    <SettingsMenuItem
                        label="Profile"
                        description="Manage your personal information."
                        onClick={() => {}}
                    />
                     <SettingsMenuItem
                        label="Subscription"
                        description="Manage your billing and plan."
                        onClick={() => {}}
                    />
                </div>
                
                <div className="text-center pt-8">
                    <button onClick={onLogout} className="text-danger font-semibold hover:underline">
                        Log Out
                    </button>
                </div>
            </div>
            {isThemeModalOpen && <ThemeSelectionModal currentTheme={currentTheme} onThemeChange={onThemeChange} onClose={() => setThemeModalOpen(false)} />}
        </div>
    );
};

interface SettingsMenuItemProps {
    icon?: React.ReactNode;
    label: string;
    description: string;
    onClick: () => void;
}

const SettingsMenuItem: React.FC<SettingsMenuItemProps> = ({ icon, label, description, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between text-left p-4 border-b border-border last:border-b-0 hover:bg-muted transition-colors">
        <div className="flex items-center gap-4">
            {icon && <div className="bg-primary/10 p-2 rounded-lg">{icon}</div>}
            <div>
                <p className="font-bold text-text-primary">{label}</p>
                <p className="text-sm text-text-secondary">{description}</p>
            </div>
        </div>
        <ChevronRightIcon className="w-5 h-5 text-text-secondary" />
    </button>
);

interface ThemeSelectionModalProps {
    currentTheme: Theme;
    onThemeChange: (theme: Theme) => void;
    onClose: () => void;
}

const ThemeSelectionModal: React.FC<ThemeSelectionModalProps> = ({ currentTheme, onThemeChange, onClose }) => {
    
    const handleSelect = (theme: Theme) => {
        onThemeChange(theme);
        onClose();
    };

    const ThemeOption: React.FC<{ theme: Theme, label: string, description: string }> = ({ theme, label, description }) => (
        <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${currentTheme === theme ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
            <input type="radio" name="theme" value={theme} checked={currentTheme === theme} onChange={() => handleSelect(theme)} className="mt-1 mr-3 h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 dark:bg-gray-700"/>
            <div>
                <p className={`font-bold ${currentTheme === theme ? 'text-primary' : 'text-text-primary'}`}>{label}</p>
                <p className="text-sm text-text-secondary">{description}</p>
            </div>
        </label>
    );

    return (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-popover rounded-2xl shadow-lg p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4 text-text-primary">Select Theme</h3>
                 <div className="space-y-3">
                    <ThemeOption theme="light" label="Light" description="The standard light interface." />
                    <ThemeOption theme="dark" label="Dark" description="A darker interface, easier on the eyes at night." />
                    <ThemeOption theme="system" label="System" description="Automatically uses your device's theme setting." />
                </div>
            </div>
        </div>
    );
}

export default SettingsScreen;
