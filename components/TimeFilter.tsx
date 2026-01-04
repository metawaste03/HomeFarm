import React from 'react';

interface TimeFilterProps {
    selected: 'daily' | 'weekly' | 'monthly';
    onChange: (filter: 'daily' | 'weekly' | 'monthly') => void;
}

const TimeFilter: React.FC<TimeFilterProps> = ({ selected, onChange }) => {
    const options: { value: 'daily' | 'weekly' | 'monthly'; label: string }[] = [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
    ];

    return (
        <div className="inline-flex bg-muted rounded-full p-1">
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${selected === option.value
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

export default TimeFilter;
