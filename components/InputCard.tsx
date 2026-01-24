
import React, { ReactNode } from 'react';
import { MinusIcon, PlusIcon } from './icons';

interface InputCardProps {
    icon: ReactNode;
    label: string;
    value: number;
    onValueChange: (value: number) => void;
    onIncrement: () => void;
    onDecrement: () => void;
    children?: ReactNode;
    incrementColorClass?: string;
}

const InputCard: React.FC<InputCardProps> = ({
    icon,
    label,
    value,
    onValueChange,
    onIncrement,
    onDecrement,
    children,
    incrementColorClass = 'bg-primary'
}) => {

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const num = parseInt(e.target.value, 10);
        if (!isNaN(num)) {
            onValueChange(num);
        } else if (e.target.value === '') {
            onValueChange(0);
        }
    };

    return (
        <div className="bg-card rounded-2xl shadow-md p-5">
            <div className="flex items-center gap-3 mb-4">
                {icon}
                <h3 className="text-lg font-semibold text-text-primary">{label}</h3>
            </div>
            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={onDecrement}
                    className="bg-muted rounded-full p-3 text-text-secondary hover:bg-border active:bg-slate-400 transition-colors transform active:scale-90"
                    aria-label={`Decrease ${label}`}
                >
                    <MinusIcon className="w-8 h-8" />
                </button>
                <input
                    type="number"
                    value={value.toString()}
                    onChange={handleInputChange}
                    className="text-6xl font-bold text-center bg-transparent w-full focus:outline-none text-text-primary"
                    pattern="[0-9]*"
                />
                <button
                    onClick={onIncrement}
                    className={`${incrementColorClass} rounded-full p-3 text-white hover:opacity-90 active:scale-90 transition-all transform`}
                    aria-label={`Increase ${label}`}
                >
                    <PlusIcon className="w-8 h-8" />
                </button>
            </div>
            {children}
        </div>
    );
};

interface SubInputProps {
    label: string;
    value: number;
    onValueChange: (value: number) => void;
}

export const SubInput: React.FC<SubInputProps> = ({ label, value, onValueChange }) => {
    const increment = () => onValueChange(value + 1);
    const decrement = () => onValueChange(Math.max(0, value - 1));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const num = parseInt(e.target.value, 10);
        if (!isNaN(num)) {
            onValueChange(num);
        } else if (e.target.value === '') {
            onValueChange(0);
        }
    };

    return (
        <div className="flex items-center justify-between bg-muted p-2 rounded-lg">
            <span className="text-text-secondary font-medium w-1/3">{label}</span>
            <div className="flex items-center gap-1">
                <button onClick={decrement} className="p-1 rounded-md text-text-secondary hover:bg-border">
                    <MinusIcon className="w-4 h-4" />
                </button>
                <input
                    type="number"
                    value={value.toString()}
                    onChange={handleInputChange}
                    className="w-12 text-center font-semibold bg-transparent text-text-primary"
                />
                <button onClick={increment} className="p-1 rounded-md text-text-secondary hover:bg-border">
                    <PlusIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};


export default InputCard;