'use client';

import * as React from 'react';
import { Moon, Sun, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/contexts/language-context';

export function SettingsBar() {
    const { setTheme, theme } = useTheme();
    const { locale, setLocale, t } = useLanguage();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-20" />; // Prevent hydration mismatch
    }

    return (
        <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 rounded-lg p-1 border border-slate-200 dark:border-zinc-700">
                <button
                    onClick={() => setLocale('en')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${locale === 'en'
                            ? 'bg-white dark:bg-zinc-600 text-slate-800 dark:text-zinc-100 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400'
                        }`}
                >
                    EN
                </button>
                <button
                    onClick={() => setLocale('th')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${locale === 'th'
                            ? 'bg-white dark:bg-zinc-600 text-slate-800 dark:text-zinc-100 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400'
                        }`}
                >
                    TH
                </button>
            </div>

            {/* Theme Toggle */}
            <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
                <span className="sr-only">Toggle theme</span>
                {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
        </div>
    );
}
