import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/kanban';
import { Calendar, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLanguage } from '@/contexts/language-context';

interface KanbanCardProps {
    task: Task;
    onDelete: (id: string) => void;
}

export function KanbanCard({ task, onDelete }: KanbanCardProps) {
    const { t } = useLanguage();
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        },
        transition: {
            duration: 150, // Faster transition for snappier feel
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const priorityStyles = {
        High: 'bg-orange-50 text-orange-700 border-orange-100/50 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-500/20',
        Medium: 'bg-yellow-50 text-yellow-700 border-yellow-100/50 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-500/20',
        Low: 'bg-emerald-50 text-emerald-700 border-emerald-100/50 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-500/20',
    }[task.priority];

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={twMerge(
                'group relative flex flex-col gap-2.5 rounded-lg border border-slate-200/60 bg-white p-3.5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:cursor-grabbing',
                'dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700 dark:shadow-none',
                isDragging && 'opacity-60 ring-2 ring-indigo-500/20 rotate-2 dark:ring-indigo-400/20'
            )}
        >
            <div className="flex items-start justify-between">
                <span
                    className={clsx(
                        'rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border',
                        priorityStyles
                    )}
                >
                    {t(`task.priority.${task.priority.toLowerCase()}`)}
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task.id);
                    }}
                    className="opacity-0 transition-all group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-slate-50 p-1 rounded dark:text-zinc-600 dark:hover:text-red-400 dark:hover:bg-zinc-800"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <div className="space-y-1">
                <h3 className="text-[13px] font-medium leading-tight text-slate-700 dark:text-zinc-200">
                    {task.title}
                </h3>
                {task.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed dark:text-zinc-500">
                        {task.description}
                    </p>
                )}
            </div>

            {task.dueDate && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mt-0.5 dark:text-zinc-600">
                    <Calendar size={12} />
                    <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
            )}
        </div>
    );
}
