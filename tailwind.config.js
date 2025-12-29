/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: 'var(--background-color)',
                card: 'var(--card-background)',
                'muted': 'var(--muted-background)',
                'popover': 'var(--popover-background)',
                border: 'var(--border-color)',
                'text-primary': 'var(--primary-text-color)',
                'text-secondary': 'var(--secondary-text-color)',
                primary: {
                    DEFAULT: 'var(--accent-green)',
                    '600': 'var(--accent-green-darker)',
                    '700': 'var(--accent-green-darkest)',
                },
                secondary: 'var(--text-primary)',
                accent: 'var(--accent-orange)',
                danger: 'var(--accent-red)',
            },
            keyframes: {
                slideInRight: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                fadeIn: {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                }
            },
            animation: {
                'slide-in-right': 'slideInRight 0.3s ease-out forwards',
                'fade-in': 'fadeIn 0.2s ease-in-out forwards',
            }
        }
    },
    plugins: [],
}
