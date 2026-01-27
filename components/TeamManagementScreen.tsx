

import React, { useState } from 'react';
import type { Screen } from '../App';
import { UserPlusIcon, EllipsisIcon, TrashIcon, PencilIcon, ChevronLeftIcon, ClockIcon, XCircleIcon } from './icons';
import { useTeam, TeamMember, PendingInvite } from '../contexts/TeamContext';

type Role = 'Owner' | 'Manager' | 'Worker';

interface TeamManagementScreenProps {
    onNavigate: (screen: Screen) => void;
}

const TeamManagementScreen: React.FC<TeamManagementScreenProps> = ({ onNavigate }) => {
    const { teamMembers, pendingInvites, inviteMember, updateMemberRole, removeMember, cancelInvite, isLoading } = useTeam();
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [userToRemove, setUserToRemove] = useState<TeamMember | null>(null);
    const [userToEditRole, setUserToEditRole] = useState<TeamMember | null>(null);
    const [inviteToCancel, setInviteToCancel] = useState<PendingInvite | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleRemoveUser = async (memberId: string) => {
        try {
            await removeMember(memberId);
            setUserToRemove(null);
        } catch (error) {
            alert("Failed to remove member.");
        }
    }

    const handleInviteUser = async (name: string, contact: string, role: Role) => {
        if (role === 'Owner') return; // Cannot invite owner
        try {
            const result = await inviteMember(contact, role); // Assuming contact is email
            setInviteModalOpen(false);

            if (result.type === 'added') {
                setSuccessMessage(`${contact} has been added to the team!`);
            } else {
                setSuccessMessage(`Invitation sent to ${contact}! They will be added to the team when they sign up.`);
            }
            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (error: any) {
            const message = error?.message || "Failed to invite member.";
            alert(message);
        }
    }

    const handleCancelInvite = async (inviteId: string) => {
        try {
            await cancelInvite(inviteId);
            setInviteToCancel(null);
        } catch (error) {
            alert("Failed to cancel invite.");
        }
    };

    const handleSaveRoleChange = async (memberId: string, newRole: Role) => {
        if (newRole === 'Owner') return;
        try {
            await updateMemberRole(memberId, newRole);
            setUserToEditRole(null);
        } catch (error) {
            alert("Failed to update role.");
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading team...</div>;

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
                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 px-4 py-3 rounded-xl flex items-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">{successMessage}</span>
                    </div>
                )}

                <button
                    onClick={() => setInviteModalOpen(true)}
                    className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl text-lg flex items-center justify-center gap-2 hover:bg-primary-600 active:bg-primary-700 transition-colors"
                >
                    <UserPlusIcon className="w-5 h-5" />
                    NEW MEMBER
                </button>

                {/* Active Team Members */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Active Members ({teamMembers.length})</h2>
                    {teamMembers.map(member => (
                        <UserCard
                            key={member.id}
                            user={member}
                            onRemove={() => setUserToRemove(member)}
                            onChangeRole={() => setUserToEditRole(member)}
                        />
                    ))}
                    {teamMembers.length === 0 && (
                        <p className="text-center text-text-secondary py-4">No team members yet.</p>
                    )}
                </div>

                {/* Pending Invites */}
                {pendingInvites.length > 0 && (
                    <div className="space-y-3 mt-6">
                        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide flex items-center gap-2">
                            <ClockIcon className="w-4 h-4" />
                            Pending Invites ({pendingInvites.length})
                        </h2>
                        {pendingInvites.map(invite => (
                            <PendingInviteCard
                                key={invite.id}
                                invite={invite}
                                onCancel={() => setInviteToCancel(invite)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {isInviteModalOpen && <InviteMemberModal onClose={() => setInviteModalOpen(false)} onInvite={handleInviteUser} />}
            {userToRemove && <RemoveConfirmationModal user={userToRemove} onClose={() => setUserToRemove(null)} onConfirm={() => handleRemoveUser(userToRemove.id)} />}
            {userToEditRole && <ChangeRoleModal user={userToEditRole} onClose={() => setUserToEditRole(null)} onSave={handleSaveRoleChange} />}
            {inviteToCancel && <CancelInviteModal invite={inviteToCancel} onClose={() => setInviteToCancel(null)} onConfirm={() => handleCancelInvite(inviteToCancel.id)} />}
        </div>
    );
};

const UserCard: React.FC<{ user: TeamMember, onRemove: () => void, onChangeRole: () => void }> = ({ user, onRemove, onChangeRole }) => {
    const [isMenuOpen, setMenuOpen] = useState(false);

    // Assume active for now
    const status = 'Active';

    const statusRoleStyles = {
        Active: {
            Owner: "bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200",
            Manager: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
            Worker: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
        },
        Pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
    };

    const roleStyle = statusRoleStyles[status][user.role];

    return (
        <div className="bg-card rounded-2xl shadow-md p-4 flex justify-between items-center">
            <div>
                <p className="font-bold text-lg text-text-primary">{user.name}</p>
                <div className={`text-xs font-semibold px-2 py-1 rounded-full inline-block mt-1 ${roleStyle}`}>
                    {status} - {user.role}
                </div>
                <p className="text-sm text-text-secondary mt-2">{user.email}</p>
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

const PendingInviteCard: React.FC<{ invite: PendingInvite, onCancel: () => void }> = ({ invite, onCancel }) => {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-card rounded-2xl shadow-md p-4 flex justify-between items-center border-l-4 border-amber-400">
            <div>
                <p className="font-bold text-lg text-text-primary">{invite.email}</p>
                <div className="text-xs font-semibold px-2 py-1 rounded-full inline-block mt-1 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                    Pending - {invite.role}
                </div>
                <p className="text-sm text-text-secondary mt-2">Invited on {formatDate(invite.invitedAt)}</p>
            </div>
            <button
                onClick={onCancel}
                className="p-2 text-danger hover:bg-red-500/10 rounded-full"
                aria-label="Cancel invite"
            >
                <XCircleIcon className="w-6 h-6" />
            </button>
        </div>
    );
};

interface InviteMemberModalProps { onClose: () => void; onInvite: (name: string, contact: string, role: Role) => void; }
type InviteMethod = 'email' | 'phone';
const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ onClose, onInvite }) => {
    const [fullName, setFullName] = useState('');
    const [inviteMethod, setInviteMethod] = useState<InviteMethod>('email');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<Role>('Worker');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const contact = inviteMethod === 'email' ? email : phone;
        if (!contact || !role) return alert('Please fill out all required fields.');
        setIsSubmitting(true);
        try {
            await onInvite(fullName, contact, role);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-start sm:items-center justify-center p-4 sm:p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-popover rounded-2xl shadow-lg w-full max-w-md max-h-[85vh] flex flex-col mt-4 sm:mt-0" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold p-4 border-b border-border text-text-primary">Invite Team Member</h3>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">Full Name (Optional)</label>
                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter name" className="w-full p-2.5 border border-border rounded-lg bg-card text-text-primary text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">Invite via *</label>
                        <div className="flex bg-muted p-1 rounded-lg">
                            <button type="button" onClick={() => setInviteMethod('email')} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${inviteMethod === 'email' ? 'bg-card shadow text-primary' : 'text-text-secondary'}`}>Email</button>
                            <button type="button" onClick={() => setInviteMethod('phone')} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${inviteMethod === 'phone' ? 'bg-card shadow text-primary' : 'text-text-secondary'}`} disabled>Phone (Coming soon)</button>
                        </div>
                    </div>
                    {inviteMethod === 'email' && (
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className="w-full p-2.5 border border-border rounded-lg bg-card text-text-primary text-sm" required />
                    )}
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-2">Role *</label>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setRole('Manager')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${role === 'Manager' ? 'bg-primary text-white' : 'bg-muted text-text-secondary'}`}>Manager</button>
                            <button type="button" onClick={() => setRole('Worker')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${role === 'Worker' ? 'bg-primary text-white' : 'bg-muted text-text-secondary'}`}>Worker</button>
                        </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            <strong>Note:</strong> If the person already has an account, they'll be added immediately.
                            Otherwise, they'll receive an invitation and be added when they sign up.
                        </p>
                    </div>
                </form>
                {/* Sticky Footer - Always Visible */}
                <div className="p-4 border-t border-border bg-popover sticky bottom-0 z-10 flex gap-2">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-text-primary bg-danger hover:bg-red-600 font-bold text-sm" disabled={isSubmitting}>Cancel</button>
                    <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl text-white bg-primary hover:bg-primary-600 font-bold text-sm disabled:opacity-50" disabled={isSubmitting}>
                        {isSubmitting ? 'Sending...' : 'Send Invite'}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface RemoveConfirmationModalProps { user: TeamMember; onClose: () => void; onConfirm: () => void; }
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

interface CancelInviteModalProps { invite: PendingInvite; onClose: () => void; onConfirm: () => void; }
const CancelInviteModal: React.FC<CancelInviteModalProps> = ({ invite, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-popover rounded-2xl shadow-lg p-6 w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-2 text-text-primary">Cancel Invite?</h3>
            <p className="text-text-secondary text-sm mb-6">This will cancel the pending invitation to <span className="font-semibold">{invite.email}</span>.</p>
            <div className="flex justify-center gap-4">
                <button onClick={onClose} className="px-8 py-2 rounded-lg text-text-primary bg-muted hover:bg-border font-semibold">Keep</button>
                <button onClick={onConfirm} className="px-8 py-2 rounded-lg text-white bg-danger hover:bg-red-600 font-semibold">Cancel Invite</button>
            </div>
        </div>
    </div>
);

interface ChangeRoleModalProps { user: TeamMember; onClose: () => void; onSave: (memberId: string, newRole: Role) => void; }
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
