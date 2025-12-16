'use client';

import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { SettingsBar } from '@/components/ui/settings-bar';
import { useLanguage } from '@/contexts/language-context';

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="flex h-screen w-full flex-col bg-background overflow-hidden transition-colors">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6 transition-colors z-50 relative">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-indigo-600 bg-gradient-to-br from-indigo-500 to-violet-600" />
          <h1 className="text-lg font-bold text-foreground">{t('app.title')}</h1>
        </div>
        <div className="flex items-center gap-4">
          <SettingsBar />
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
    </main>
  );
}
