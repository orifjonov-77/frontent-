import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (!saved || !localStorage.getItem('theme_v2')) {
            localStorage.setItem('theme_v2', '1');
            return 'light';
        }
        return saved;
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        // Add transition class for smooth switch
        document.documentElement.classList.add('theme-transitioning');
        // Small delay so transition kicks in before the change
        requestAnimationFrame(() => {
            setTheme(t => t === 'dark' ? 'light' : 'dark');
            // Remove class after transition completes
            setTimeout(() => {
                document.documentElement.classList.remove('theme-transitioning');
            }, 500);
        });
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
