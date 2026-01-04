import React, { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
    value: number;
    duration?: number;
    formatFn?: (n: number) => string;
    className?: string;
}

/**
 * Animated number component that counts up from 0 to target value
 */
const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
    value,
    duration = 1000,
    formatFn = (n) => n.toLocaleString('en-US'),
    className = '',
}) => {
    const [displayValue, setDisplayValue] = useState(0);
    const startTimeRef = useRef<number | null>(null);
    const frameRef = useRef<number>();
    const previousValueRef = useRef(0);

    useEffect(() => {
        const startValue = previousValueRef.current;
        const endValue = value;

        // If no change, don't animate
        if (startValue === endValue) return;

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }

            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic for smoother animation
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(startValue + (endValue - startValue) * easedProgress);

            setDisplayValue(currentValue);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                previousValueRef.current = endValue;
                startTimeRef.current = null;
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [value, duration]);

    return <span className={className}>{formatFn(displayValue)}</span>;
};

export default AnimatedNumber;
