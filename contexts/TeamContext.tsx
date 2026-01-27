
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { farmMembersService, invitesService } from '../services/database';
import { useFarm } from './FarmContext';
import { useAuth } from './AuthContext';

export type TeamMember = {
    id: string; // farm_member id
    userId: string;
    name: string;
    email: string;
    role: 'Owner' | 'Manager' | 'Worker';
    joinedAt: string;
};

export type PendingInvite = {
    id: string;
    email: string;
    role: 'Manager' | 'Worker';
    invitedAt: string;
    invitedByName: string;
};

interface TeamContextType {
    teamMembers: TeamMember[];
    pendingInvites: PendingInvite[];
    isLoading: boolean;
    inviteMember: (email: string, role: 'Manager' | 'Worker') => Promise<{ type: 'added' | 'invited' }>;
    updateMemberRole: (memberId: string, newRole: 'Manager' | 'Worker') => Promise<void>;
    removeMember: (memberId: string) => Promise<void>;
    cancelInvite: (inviteId: string) => Promise<void>;
    refreshTeam: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { farms } = useFarm();
    const { user } = useAuth();
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // For simplicity, we assume we are managing the First Farm in the list
    // In a multi-farm app, we would need a 'currentFarm' context or selector
    const currentFarm = farms[0];

    const refreshTeam = async () => {
        if (!currentFarm) {
            setTeamMembers([]);
            setPendingInvites([]);
            setIsLoading(false);
            return;
        }

        try {
            // Load team members
            const membersData = await farmMembersService.list(String(currentFarm.id));
            const formattedMembers: TeamMember[] = membersData.map((item: any) => ({
                id: item.id,
                userId: item.user_id,
                name: item.user?.full_name || item.user?.email || 'Unknown',
                email: item.user?.email || '',
                role: item.role,
                joinedAt: item.joined_at
            }));
            setTeamMembers(formattedMembers);

            // Load pending invites
            try {
                const invitesData = await invitesService.listForFarm(String(currentFarm.id));
                const formattedInvites: PendingInvite[] = (invitesData || []).map((item: any) => ({
                    id: item.id,
                    email: item.email,
                    role: item.role,
                    invitedAt: item.invited_at,
                    invitedByName: item.inviter?.full_name || item.inviter?.email || 'Unknown'
                }));
                setPendingInvites(formattedInvites);
            } catch (inviteErr) {
                // invites table might not exist yet if migration hasn't been run
                console.log("Could not load invites (table may not exist yet):", inviteErr);
                setPendingInvites([]);
            }
        } catch (error) {
            console.error("Error loading team:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshTeam();
    }, [currentFarm?.id]);

    const inviteMember = async (email: string, role: 'Manager' | 'Worker'): Promise<{ type: 'added' | 'invited' }> => {
        if (!currentFarm || !user) throw new Error("No farm or user context");
        try {
            const result = await farmMembersService.invite(email, String(currentFarm.id), role, user.id);
            await refreshTeam();
            return { type: result.type as 'added' | 'invited' };
        } catch (error) {
            console.error("Invite failed:", error);
            throw error;
        }
    };

    const updateMemberRole = async (memberId: string, newRole: 'Manager' | 'Worker') => {
        try {
            await farmMembersService.updateRole(memberId, newRole);
            setTeamMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
        } catch (error) {
            console.error("Update role failed:", error);
            throw error;
        }
    };

    const removeMember = async (memberId: string) => {
        try {
            await farmMembersService.remove(memberId);
            setTeamMembers(prev => prev.filter(m => m.id !== memberId));
        } catch (error) {
            console.error("Remove member failed:", error);
            throw error;
        }
    };

    const cancelInvite = async (inviteId: string) => {
        try {
            await invitesService.cancel(inviteId);
            setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
        } catch (error) {
            console.error("Cancel invite failed:", error);
            throw error;
        }
    };

    return (
        <TeamContext.Provider value={{
            teamMembers,
            pendingInvites,
            isLoading,
            inviteMember,
            updateMemberRole,
            removeMember,
            cancelInvite,
            refreshTeam
        }}>
            {children}
        </TeamContext.Provider>
    );
};

export const useTeam = () => {
    const context = useContext(TeamContext);
    if (!context) throw new Error("useTeam must be used within a TeamProvider");
    return context;
};
