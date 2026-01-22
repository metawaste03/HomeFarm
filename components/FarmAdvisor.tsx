// FarmAdvisor - AI-powered farming advice component
import React, { useState } from 'react';
import { Sector } from '../contexts/FarmContext';
import { queryAdvisor } from '../services/gemini';

interface FarmAdvisorProps {
    sector: Sector;
}

// Robot/AI icon component
const RobotIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
);

// Send icon
const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
);

// Copy icon
const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
);

// Check icon for accepted state
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

// Error icon
const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
);

export default function FarmAdvisor({ sector }: FarmAdvisorProps) {
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAccepted, setIsAccepted] = useState(false);
    const [copied, setCopied] = useState(false);
    const [queriesUsed, setQueriesUsed] = useState(0);

    const FREE_TIER_LIMIT = 5;
    const remainingQueries = FREE_TIER_LIMIT - queriesUsed;

    const handleSubmit = async () => {
        if (!question.trim() || isLoading) return;

        // Check free tier limit
        if (queriesUsed >= FREE_TIER_LIMIT) {
            setError('Daily query limit reached. Please try again tomorrow.');
            return;
        }

        setIsLoading(true);
        setResponse(null);
        setError(null);
        setIsAccepted(false);

        try {
            const result = await queryAdvisor({
                question: question.trim(),
                sector: sector
            });

            if (result.success && result.response) {
                setResponse(result.response);
                setQueriesUsed(prev => prev + 1);
            } else {
                setError(result.error || 'Failed to get response. Please try again.');
            }
        } catch (err) {
            console.error('Error querying advisor:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccept = () => {
        setIsAccepted(true);
        // TODO: Store accepted solution in database for future reference
    };

    const handleCopy = async () => {
        if (response) {
            await navigator.clipboard.writeText(response);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleClearResponse = () => {
        setResponse(null);
        setError(null);
        setQuestion('');
        setIsAccepted(false);
    };

    return (
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <RobotIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="font-bold text-lg text-text-primary">Farm Advisor</h2>
                    <p className="text-sm text-text-secondary">Powered by Gemini AI</p>
                </div>
            </div>

            {/* Input Area */}
            <div className="relative mb-3">
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Ask about your ${sector.toLowerCase()} farming issues...`}
                    className="w-full p-4 pr-14 bg-muted border border-border rounded-xl text-text-primary placeholder-text-secondary resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    rows={3}
                    disabled={isLoading}
                />
                <button
                    onClick={handleSubmit}
                    disabled={!question.trim() || isLoading || queriesUsed >= FREE_TIER_LIMIT}
                    className="absolute right-3 bottom-3 w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                    aria-label="Send question"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <SendIcon className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Free tier indicator */}
            <p className={`text-xs mb-4 ${remainingQueries <= 1 ? 'text-orange-500' : 'text-text-secondary'}`}>
                {remainingQueries > 0
                    ? `${remainingQueries} free ${remainingQueries === 1 ? 'query' : 'queries'} remaining today`
                    : 'Daily limit reached'}
            </p>

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 animate-fade-in">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <ErrorIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                </div>
            )}

            {/* Response Area */}
            {response && (
                <div className="mt-4 p-4 bg-muted rounded-xl border border-border animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-primary">🤖 AI Response</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopy}
                                className="p-2 rounded-lg hover:bg-card transition-colors text-text-secondary hover:text-primary"
                                aria-label="Copy response"
                            >
                                {copied ? (
                                    <CheckIcon className="w-4 h-4 text-green-500" />
                                ) : (
                                    <CopyIcon className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <p className="text-sm text-text-primary whitespace-pre-line leading-relaxed">
                        {response}
                    </p>

                    {/* Accept/New Question buttons */}
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {isAccepted ? (
                                <div className="flex items-center gap-2 text-green-500">
                                    <CheckIcon className="w-5 h-5" />
                                    <span className="text-sm font-medium">Helpful!</span>
                                </div>
                            ) : (
                                <button
                                    onClick={handleAccept}
                                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
                                >
                                    This was helpful
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleClearResponse}
                            className="text-sm text-text-secondary hover:text-primary transition-colors"
                        >
                            Ask another question
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
