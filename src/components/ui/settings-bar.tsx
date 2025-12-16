'use client';

import * as React from 'react';
import { Moon, Sun, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/contexts/language-context';

export function SettingsBar() {
    const { setTheme, resolvedTheme } = useTheme();
    const { locale, setLocale } = useLanguage();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-20" />; // Prevent hydration mismatch
    }

    const toggleTheme = () => {
        if (resolvedTheme === 'dark') {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    };

    return (
        <div className="flex items-center gap-3 bg-background/80 backdrop-blur-md px-2 py-1.5 rounded-full border border-border/60 shadow-sm">
            {/* Language Toggle */}
            <div className="flex items-center bg-slate-100/50 dark:bg-zinc-900/50 rounded-full p-0.5 border border-slate-200/50 dark:border-zinc-700/50">
                <button
                    onClick={() => setLocale('en')}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${locale === 'en'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    EN
                </button>
                <button
                    onClick={() => setLocale('th')}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${locale === 'th'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    TH
                </button>
            </div>

            <div className="w-px h-4 bg-border" />

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
                <span className="sr-only">Toggle theme</span>
                {resolvedTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
        </div>
    );
}
