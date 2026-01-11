
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { farmMembersService } from '../services/database';
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

interface TeamContextType {
    teamMembers: TeamMember[];
    isLoading: boolean;
    inviteMember: (email: string, role: 'Manager' | 'Worker') => Promise<void>;
    updateMemberRole: (memberId: string, newRole: 'Manager' | 'Worker') => Promise<void>;
    removeMember: (memberId: string) => Promise<void>;
    refreshTeam: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { farms } = useFarm();
    const { user } = useAuth();
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // For simplicity, we assume we are managing the First Farm in the list
    // In a multi-farm app, we would need a 'currentFarm' context or selector
    const currentFarm = farms[0];

    const refreshTeam = async () => {
        if (!currentFarm) {
            setTeamMembers([]);
            setIsLoading(false);
            return;
        }

        try {
            const data = await farmMembersService.list(String(currentFarm.id));
            const formatted: TeamMember[] = data.map((item: any) => ({
                id: item.id,
                userId: item.user_id,
                name: item.user?.full_name || item.user?.email || 'Unknown',
                email: item.user?.email || '',
                role: item.role,
                joinedAt: item.joined_at
            }));
            setTeamMembers(formatted);
        } catch (error) {
            console.error("Error loading team:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshTeam();
    }, [currentFarm?.id]);

    const inviteMember = async (email: string, role: 'Manager' | 'Worker') => {
        if (!currentFarm) return;
        try {
            await farmMembersService.invite(email, String(currentFarm.id), role);
            await refreshTeam();
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

    return (
        <TeamContext.Provider value={{ teamMembers, isLoading, inviteMember, updateMemberRole, removeMember, refreshTeam }}>
            {children}
        </TeamContext.Provider>
    );
};

export const useTeam = () => {
    const context = useContext(TeamContext);
    if (!context) throw new Error("useTeam must be used within a TeamProvider");
    return context;
};
