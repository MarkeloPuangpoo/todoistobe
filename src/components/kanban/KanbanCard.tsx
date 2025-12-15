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
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const priorityColor = {
        High: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900',
        Medium: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-900',
        Low: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900',
    }[task.priority];

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={twMerge(
                'group relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:cursor-grabbing dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600',
                isDragging && 'opacity-50 ring-2 ring-slate-400 ring-offset-2 dark:ring-zinc-600'
            )}
        >
            <div className="flex items-start justify-between">
                <span
                    className={clsx(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium border',
                        priorityColor
                    )}
                >
                    {t(`task.priority.${task.priority.toLowerCase()}`)}
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent drag start when clicking delete
                        onDelete(task.id);
                    }}
                    className="opacity-0 transition-opacity group-hover:opacity-100 text-slate-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-zinc-100">{task.title}</h3>
                {task.description && (
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 dark:text-zinc-400">
                        {task.description}
                    </p>
                )}
            </div>

            {task.dueDate && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 dark:text-zinc-500">
                    <Calendar size={14} />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
            )}
        </div>
    );
}
