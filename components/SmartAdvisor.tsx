import React, { useState } from 'react';
import { LightbulbIcon, ChevronDownIcon } from './icons';
import { Sector } from '../contexts/FarmContext';

interface SmartAdvisorProps {
    sector: Sector;
}

interface Tip {
    id: string;
    title: string;
    content: string;
    category: 'feeding' | 'health' | 'management' | 'market';
}

const tipsByCategory: Record<string, string> = {
    feeding: '🍽️ Feeding',
    health: '💊 Health',
    management: '📋 Management',
    market: '💰 Market',
};

const expertTips: Record<Sector, Tip[]> = {
    Layer: [
        { id: '1', title: 'Optimal Lighting', content: 'Layers need 16 hours of light daily for maximum egg production. Use timer-controlled lighting.', category: 'management' },
        { id: '2', title: 'Calcium Matters', content: 'Feed oyster shells or limestone separately. Strong shells = fewer cracked eggs.', category: 'feeding' },
        { id: '3', title: 'Peak Production', content: 'Layers peak at 26-30 weeks. Plan feed upgrades and marketing around this window.', category: 'market' },
        { id: '4', title: 'Water Quality', content: 'Clean waterers daily. Dirty water reduces feed intake by 30% and increases disease risk.', category: 'health' },
    ],
    Broiler: [
        { id: '1', title: 'Temperature Control', content: 'Week 1: 32-35°C, reduce by 3°C weekly until 21°C. Cold birds huddle, hot birds pant.', category: 'management' },
        { id: '2', title: 'Feed Conversion', content: 'Target FCR of 1.6-1.8. Weigh birds weekly. A 3kg bird at 6 weeks is profitable.', category: 'feeding' },
        { id: '3', title: 'Best Selling Window', content: 'Sell between 6-8 weeks. After 8 weeks, FCR worsens and profit drops.', category: 'market' },
        { id: '4', title: 'Litter Management', content: 'Keep litter dry (25% moisture). Wet litter = ammonia = respiratory disease.', category: 'health' },
    ],
    Fish: [
        { id: '1', title: 'Stocking Density', content: 'For catfish: 50-100 fish/m³. Overcrowding stunts growth and increases disease.', category: 'management' },
        { id: '2', title: 'Feeding Schedule', content: 'Feed 3-5% of body weight daily. Feed early morning and late afternoon for best results.', category: 'feeding' },
        { id: '3', title: 'Water Quality', content: 'Check ammonia weekly. Above 0.5ppm is dangerous. Partial water changes help.', category: 'health' },
        { id: '4', title: 'Market Timing', content: 'Best prices during festive seasons. Plan stocking 4-6 months before Xmas/Easter.', category: 'market' },
    ],
};

const SmartAdvisor: React.FC<SmartAdvisorProps> = ({ sector }) => {
    const [expandedTip, setExpandedTip] = useState<string | null>(null);
    const tips = expertTips[sector];

    return (
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <LightbulbIcon className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-text-primary">Smart Advisor</h3>
                    <p className="text-sm text-text-secondary">Expert tips for {sector.toLowerCase()} farming</p>
                </div>
            </div>

            <div className="space-y-3">
                {tips.map((tip) => (
                    <div
                        key={tip.id}
                        className="border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
                    >
                        <button
                            onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
                            className="w-full flex items-center justify-between p-4 text-left"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-sm">{tipsByCategory[tip.category]}</span>
                                <span className="font-medium text-text-primary">{tip.title}</span>
                            </div>
                            <ChevronDownIcon
                                className={`w-5 h-5 text-text-secondary transition-transform ${expandedTip === tip.id ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                        {expandedTip === tip.id && (
                            <div className="px-4 pb-4 text-sm text-text-secondary bg-muted/50">
                                {tip.content}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-lime-50 to-green-50 dark:from-lime-900/20 dark:to-green-900/20 rounded-xl border border-lime-200 dark:border-lime-800">
                <p className="text-sm text-lime-700 dark:text-lime-400 font-medium">
                    🌱 Community tips coming soon! Share your farming wisdom and learn from others.
                </p>
            </div>
        </div>
    );
};

export default SmartAdvisor;
