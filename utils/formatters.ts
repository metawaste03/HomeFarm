/**
 * Utility functions for formatting and animations
 */

/**
 * Format a number with thousand separators (e.g., 10000 → "10,000")
 */
export const formatNumber = (value: number): string => {
    if (isNaN(value)) return '0';
    return value.toLocaleString('en-US');
};

/**
 * Format currency with Naira symbol and thousand separators
 */
export const formatCurrency = (value: number): string => {
    if (isNaN(value)) return '₦0';
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
    }).format(value);
};

/**
 * Format currency with decimals for smaller amounts
 */
export const formatCurrencyWithDecimals = (value: number): string => {
    if (isNaN(value)) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

/**
 * Format percentage with one decimal
 */
export const formatPercent = (value: number): string => {
    if (isNaN(value)) return '0%';
    return `${value.toFixed(1)}%`;
};
