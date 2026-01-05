

import React, { useState } from 'react';
// Fix: Use `import type` for type-only imports to prevent circular dependency issues.
import type { Screen } from '../App';
import { UserPlusIcon, EllipsisIcon, TrashIcon, PencilIcon, ChevronLeftIcon } from './icons';

type Role = 'Owner' | 'Manager' | 'Worker';
type Status = 'Active' | 'Pending';

type User = {
    id: number;
    name: string;
    contact: string;
    role: Role;
    status: Status;
};

interface TeamManagementScreenProps {
    onNavigate: (screen: Screen) => void;
}

const TeamManagementScreen: React.FC<TeamManagementScreenProps> = ({ onNavigate }) => {
    const [team, setTeam] = useState<User[]>([]);
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [userToRemove, setUserToRemove] = useState<User | null>(null);
    const [userToEditRole, setUserToEditRole] = useState<User | null>(null);

    const handleRemoveUser = (userId: number) => {
        setTeam(prev => prev.filter(user => user.id !== userId));
        setUserToRemove(null);
    }

    const handleInviteUser = (name: string, contact: string, role: Role) => {
        const newUser: User = { id: Date.now(), name, contact, role, status: 'Pending' };
        setTeam(prev => [...prev, newUser]);
        setInviteModalOpen(false);
    }

    const handleSaveRoleChange = (userId: number, newRole: Role) => {
        setTeam(prevTeam => prevTeam.map(user => user.id === userId ? { ...user, role: newRole } : user));
        setUserToEditRole(null);
    };

    return (
        <div className="bg-background min-h-screen">
            <header className="bg-card p-4 pt-6 shadow-md sticky top-0 z-10 flex items-center justify-between">
                <button onClick={() => onNavigate('settings')} className="p-2 -ml-2 text-text-secondary hover:text-primary" aria-label="Go back to settings">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 text-center">
                    <h1 className="text-xl font-bold text-text-primary">Team Management</h1>
                    <p className="text-text-secondary text-xs mt-1">Invite and manage access for your farm staff.</p>
                </div>
                <div className="w-6"></div>
            </header>

            <div className="p-4 space-y-4">
                <button
                    onClick={() => setInviteModalOpen(true)}
                    className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl text-lg flex items-center justify-center gap-2 hover:bg-primary-600 active:bg-primary-700 transition-colors"
                >
                    <UserPlusIcon className="w-5 h-5" />
                    + NEW MEMBER
                </button>

                <div className="space-y-3">
                    {team.map(user => (
                        <UserCard
                            key={user.id}
                            user={user}
                            onRemove={() => setUserToRemove(user)}
                            onChangeRole={() => setUserToEditRole(user)}
                        />
                    ))}
                </div>
            </div>

            {isInviteModalOpen && <InviteMemberModal onClose={() => setInviteModalOpen(false)} onInvite={handleInviteUser} />}
            {userToRemove && <RemoveConfirmationModal user={userToRemove} onClose={() => setUserToRemove(null)} onConfirm={() => handleRemoveUser(userToRemove.id)} />}
            {userToEditRole && <ChangeRoleModal user={userToEditRole} onClose={() => setUserToEditRole(null)} onSave={handleSaveRoleChange} />}
        </div>
    );
};

const UserCard: React.FC<{ user: User, onRemove: () => void, onChangeRole: () => void }> = ({ user, onRemove, onChangeRole }) => {
    const [isMenuOpen, setMenuOpen] = useState(false);

    const statusRoleStyles = {
        Active: {
            Owner: "bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200",
            Manager: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
            Worker: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
        },
        Pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
    };

    const roleStyle = user.status === 'Pending' ? statusRoleStyles.Pending : statusRoleStyles.Active[user.role];

    return (
        <div className="bg-card rounded-2xl shadow-md p-4 flex justify-between items-center">
            <div>
                <p className="font-bold text-lg text-text-primary">{user.name}</p>
                <div className={`text-xs font-semibold px-2 py-1 rounded-full inline-block mt-1 ${roleStyle}`}>
                    {user.status} - {user.role}
                </div>
                <p className="text-sm text-text-secondary mt-2">{user.contact}</p>
            </div>
            {user.role !== 'Owner' && (
                <div className="relative">
                    <button onClick={() => setMenuOpen(!isMenuOpen)} className="p-2 text-text-secondary hover:bg-muted rounded-full" aria-label="Team member options menu">
                        <EllipsisIcon className="w-6 h-6" />
                    </button>
                    {isMenuOpen && (
                        <div
                            className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg z-20 border border-border"
                            onMouseLeave={() => setMenuOpen(false)}
                        >
                            <button className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-muted flex items-center gap-2" onClick={() => { onChangeRole(); setMenuOpen(false); }}>
                                <PencilIcon className="w-4 h-4" /> Change Role
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-500/10 flex items-center gap-2" onClick={() => { onRemove(); setMenuOpen(false); }}>
                                <TrashIcon className="w-4 h-4" /> Remove from Farm
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface InviteMemberModalProps { onClose: () => void; onInvite: (name: string, contact: string, role: Role) => void; }
type InviteMethod = 'email' | 'phone';
const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ onClose, onInvite }) => {
    const [fullName, setFullName] = useState('');
    const [inviteMethod, setInviteMethod] = useState<InviteMethod>('email');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<Role>('Worker');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const contact = inviteMethod === 'email' ? email : phone;
        if (!fullName || !contact || !role) return alert('Please fill out all required fields.');
        onInvite(fullName, contact, role);
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
            <div className="bg-popover rounded-t-2xl sm:rounded-2xl shadow-lg p-4 sm:p-5 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-3 text-text-primary">Invite Team Member</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">Full Name *</label>
                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter name" className="w-full p-2.5 border border-border rounded-lg bg-card text-text-primary text-sm" required />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">Invite via *</label>
                        <div className="flex bg-muted p-1 rounded-lg">
                            <button type="button" onClick={() => setInviteMethod('email')} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${inviteMethod === 'email' ? 'bg-card shadow text-primary' : 'text-text-secondary'}`}>Email</button>
                            <button type="button" onClick={() => setInviteMethod('phone')} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${inviteMethod === 'phone' ? 'bg-card shadow text-primary' : 'text-text-secondary'}`}>Phone</button>
                        </div>
                    </div>
                    {inviteMethod === 'email' ? (
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className="w-full p-2.5 border border-border rounded-lg bg-card text-text-primary text-sm" required />
                    ) : (
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 801 234 5678" className="w-full p-2.5 border border-border rounded-lg bg-card text-text-primary text-sm" required />
                    )}
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-2">Role *</label>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setRole('Manager')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${role === 'Manager' ? 'bg-primary text-white' : 'bg-muted text-text-secondary'}`}>Manager</button>
                            <button type="button" onClick={() => setRole('Worker')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${role === 'Worker' ? 'bg-primary text-white' : 'bg-muted text-text-secondary'}`}>Worker</button>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-text-primary bg-muted hover:bg-border font-semibold text-sm">Cancel</button>
                        <button type="submit" className="flex-1 py-2.5 rounded-xl text-white bg-primary hover:bg-primary-600 font-semibold text-sm">Send Invite</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface RemoveConfirmationModalProps { user: User; onClose: () => void; onConfirm: () => void; }
const RemoveConfirmationModal: React.FC<RemoveConfirmationModalProps> = ({ user, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-popover rounded-2xl shadow-lg p-6 w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-2 text-text-primary">Are you sure?</h3>
            <p className="text-text-secondary text-sm mb-6">This will revoke access for <span className="font-semibold">{user.name}</span>. They will no longer be able to log in.</p>
            <div className="flex justify-center gap-4">
                <button onClick={onClose} className="px-8 py-2 rounded-lg text-text-primary bg-muted hover:bg-border font-semibold">Cancel</button>
                <button onClick={onConfirm} className="px-8 py-2 rounded-lg text-white bg-danger hover:bg-red-600 font-semibold">REMOVE</button>
            </div>
        </div>
    </div>
);

interface ChangeRoleModalProps { user: User; onClose: () => void; onSave: (userId: number, newRole: Role) => void; }
const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({ user, onClose, onSave }) => {
    const [selectedRole, setSelectedRole] = useState<Role>(user.role);

    const handleSubmit = () => {
        onSave(user.id, selectedRole);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-popover rounded-2xl shadow-lg p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-2 text-text-primary">Change Role for {user.name}</h3>
                <div className="space-y-3 my-4">
                    <label className={`block p-3 border-2 rounded-xl cursor-pointer ${selectedRole === 'Manager' ? 'border-primary bg-green-50' : 'border-border'}`}>
                        <input type="radio" value="Manager" checked={selectedRole === 'Manager'} onChange={() => setSelectedRole('Manager')} className="mr-2" />
                        Farm Manager
                    </label>
                    <label className={`block p-3 border-2 rounded-xl cursor-pointer ${selectedRole === 'Worker' ? 'border-primary bg-green-50' : 'border-border'}`}>
                        <input type="radio" value="Worker" checked={selectedRole === 'Worker'} onChange={() => setSelectedRole('Worker')} className="mr-2" />
                        Farm Worker
                    </label>
                </div>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-text-primary bg-muted hover:bg-border font-semibold">Cancel</button>
                    <button onClick={handleSubmit} className="px-6 py-2 rounded-lg text-white bg-primary hover:bg-primary-600 font-semibold">Save</button>
                </div>
            </div>
        </div>
    );
};

export default TeamManagementScreen;
