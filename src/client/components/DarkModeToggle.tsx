import React from 'react'
import { useTheme } from '../context/ThemeContext'

function SunIcon() {
    return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
    )
}

function MoonIcon() {
    return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    )
}

export default function DarkModeToggle() {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium shadow-lg transition-colors
                border-gray-200 bg-white text-gray-700 hover:bg-gray-50
                dark:border-rh-border dark:bg-rh-surface dark:text-rh-muted dark:hover:bg-rh-surface-2 dark:hover:text-white"
        >
            {isDark ? <SunIcon /> : <MoonIcon />}
            {isDark ? 'Light mode' : 'Dark mode'}
        </button>
    )
}
