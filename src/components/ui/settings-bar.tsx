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
        <div className="flex items-center gap-3 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md px-2 py-1.5 rounded-full border border-slate-200/60 dark:border-zinc-700/60 shadow-sm">
            {/* Language Toggle */}
            <div className="flex items-center bg-slate-100/50 dark:bg-zinc-900/50 rounded-full p-0.5 border border-slate-200/50 dark:border-zinc-700/50">
                <button
                    onClick={() => setLocale('en')}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${locale === 'en'
                        ? 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-100 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-zinc-500 hover:dark:text-zinc-300'
                        }`}
                >
                    EN
                </button>
                <button
                    onClick={() => setLocale('th')}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${locale === 'th'
                        ? 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-100 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-zinc-500 hover:dark:text-zinc-300'
                        }`}
                >
                    TH
                </button>
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-zinc-700" />

            {/* Theme Toggle */}
            <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 transition-colors"
            >
                <span className="sr-only">Toggle theme</span>
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
        </div>
    );
}
