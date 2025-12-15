'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Locale = 'en' | 'th';

type Dictionary = {
    [key: string]: string;
};

const dictionaries: Record<Locale, Dictionary> = {
    en: {
        'app.title': 'TaskFlow',
        'column.todo': 'To Do',
        'column.in-progress': 'In Progress',
        'column.done': 'Done',
        'task.add': 'Add Task',
        'task.placeholder': 'Task title...',
        'task.priority.high': 'High',
        'task.priority.medium': 'Medium',
        'task.priority.low': 'Low',
        'button.add': 'Add',
    },
    th: {
        'app.title': 'กระดานงาน',
        'column.todo': 'สิ่งที่ต้องทำ',
        'column.in-progress': 'กำลังทำ',
        'column.done': 'เสร็จแล้ว',
        'task.add': 'เพิ่มงาน',
        'task.placeholder': 'ชื่องาน...',
        'task.priority.high': 'สูง',
        'task.priority.medium': 'กลาง',
        'task.priority.low': 'ต่ำ',
        'button.add': 'เพิ่ม',
    },
};

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>('en');

    const t = (key: string) => {
        return dictionaries[locale][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
