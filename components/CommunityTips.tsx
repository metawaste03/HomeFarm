
import React, { useState, useEffect } from 'react';
import { LightbulbIcon, ChevronUpIcon, ChevronDownIcon, PlusIcon, CheckCircleIcon } from './icons';
import { Sector } from '../contexts/FarmContext';
import { tipsService } from '../services/database';
import { useAuth } from '../contexts/AuthContext';
import type { Tables } from '../types/database';

interface CommunityTipsProps {
    sector: Sector;
}

const CommunityTips: React.FC<CommunityTipsProps> = ({ sector }) => {
    const { user } = useAuth();
    const [tips, setTips] = useState<Tables<'tips'>[]>([]);
    const [userVotes, setUserVotes] = useState<Record<string, number>>({}); // tipId -> voteType
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // New Tip State
    const [newTipContent, setNewTipContent] = useState('');
    const [newTipType, setNewTipType] = useState<'Do' | 'Don\'t'>('Do');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadTips();
    }, [sector]);

    const loadTips = async () => {
        setIsLoading(true);
        try {
            const [fetchedTips, fetchedVotes] = await Promise.all([
                tipsService.list(sector),
                user ? tipsService.getUserVotes(user.id) : Promise.resolve([])
            ]);

            setTips(fetchedTips);

            const voteMap: Record<string, number> = {};
            fetchedVotes.forEach(v => {
                voteMap[v.tip_id] = v.vote_type;
            });
            setUserVotes(voteMap);
        } catch (error) {
            console.error('Error loading tips:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVote = async (tipId: string, type: 1 | -1) => {
        if (!user) return alert("Please sign in to vote.");

        // Optimistic Update
        const currentVote = userVotes[tipId] || 0;
        if (currentVote === type) return; // Already voted this way

        const newVote = type;
        const previousVote = currentVote;

        // Update local state immediately
        setUserVotes(prev => ({ ...prev, [tipId]: newVote }));
        setTips(prev => prev.map(t => {
            if (t.id === tipId) {
                // Adjust count: remove old vote (if any), add new vote
                // Logic: 
                // If switching from 0 to 1: +1
                // If switching from -1 to 1: +2
                const diff = newVote - previousVote;
                return { ...t, votes: (t.votes || 0) + diff };
            }
            return t;
        }));

        try {
            await tipsService.vote(tipId, user.id, newVote);
        } catch (error) {
            console.error("Vote failed:", error);
            // Revert on failure (omitted for brevity, but good practice)
            loadTips();
        }
    };

    const handleAddTip = async () => {
        if (!newTipContent.trim() || !user) return;
        setIsSaving(true);
        try {
            await tipsService.create({
                sector,
                type: newTipType,
                content: newTipContent.trim(),
                user_id: user.id
            });
            setNewTipContent('');
            setIsAdding(false);
            loadTips(); // Reload to see new tip
        } catch (error) {
            console.error("Error adding tip:", error);
            alert("Failed to post tip.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 shadow-sm border border-indigo-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                        <LightbulbIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-100">Community Tips</h3>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Verified advice from fellow farmers</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                    <PlusIcon className="w-4 h-4" />
                    Add Tip
                </button>
            </div>

            {isAdding && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm mb-4 animate-fade-in border border-indigo-100 dark:border-slate-600">
                    <div className="flex gap-2 mb-3">
                        <button
                            onClick={() => setNewTipType('Do')}
                            className={`flex-1 py-1 px-3 rounded-lg text-sm font-bold transition-colors ${newTipType === 'Do' ? 'bg-green-100 text-green-700' : 'bg-muted text-text-secondary'}`}
                        >
                            Do
                        </button>
                        <button
                            onClick={() => setNewTipType('Don\'t')}
                            className={`flex-1 py-1 px-3 rounded-lg text-sm font-bold transition-colors ${newTipType === 'Don\'t' ? 'bg-red-100 text-red-700' : 'bg-muted text-text-secondary'}`}
                        >
                            Don't
                        </button>
                    </div>
                    <textarea
                        value={newTipContent}
                        onChange={(e) => setNewTipContent(e.target.value)}
                        placeholder={`Share a key ${newTipType} for ${sector} farming...`}
                        className="w-full text-sm p-3 border border-border rounded-lg bg-background text-text-primary mb-3 focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsAdding(false)} className="text-xs font-bold text-text-secondary px-3 py-2">Cancel</button>
                        <button
                            onClick={handleAddTip}
                            disabled={isSaving || !newTipContent.trim()}
                            className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isSaving ? 'Posting...' : 'Post Tip'}
                        </button>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-8 text-indigo-400">Loading tips...</div>
            ) : tips.length === 0 ? (
                <div className="text-center py-8 text-indigo-400 italic text-sm">
                    Be the first to share a tip for {sector} farming!
                </div>
            ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {tips.map(tip => (
                        <div key={tip.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-indigo-50 dark:border-slate-700 flex gap-4">
                            {/* Vote Column */}
                            <div className="flex flex-col items-center gap-1">
                                <button
                                    onClick={() => handleVote(tip.id, 1)}
                                    aria-label="Upvote tip"
                                    className={`p-1 rounded hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors ${userVotes[tip.id] === 1 ? 'text-indigo-600' : 'text-text-secondary'}`}
                                >
                                    <ChevronUpIcon className="w-5 h-5" />
                                </button>
                                <span className={`text-sm font-bold ${userVotes[tip.id] !== 0 ? 'text-indigo-600' : 'text-text-secondary'}`}>
                                    {tip.votes || 0}
                                </span>
                                <button
                                    onClick={() => handleVote(tip.id, -1)}
                                    aria-label="Downvote tip"
                                    className={`p-1 rounded hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors ${userVotes[tip.id] === -1 ? 'text-red-500' : 'text-text-secondary'}`}
                                >
                                    <ChevronDownIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-1 ${tip.type === 'Do'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {tip.type}
                                </span>
                                <p className="text-sm text-text-primary leading-relaxed">
                                    {tip.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommunityTips;
