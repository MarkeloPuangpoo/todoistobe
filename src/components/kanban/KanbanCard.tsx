import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/kanban';
import { Calendar, Trash2, GripVertical } from 'lucide-react';
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
        High: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-500/20 hover:bg-rose-500/25',
        Medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20 hover:bg-amber-500/25',
        Low: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20 hover:bg-emerald-500/25',
    }[task.priority];

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={twMerge(
                'group relative flex gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-sm transition-all hover:border-foreground/20 hover:shadow-md',
                'text-card-foreground',
                isDragging && 'opacity-60 ring-2 ring-primary/20 rotate-2'
            )}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="flex-shrink-0 pt-1 text-muted-foreground/30 hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
            >
                <GripVertical size={16} />
            </div>

            <div className="flex-1 flex flex-col gap-2.5">
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
                        className="opacity-0 transition-all group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-muted p-1 rounded"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>

                <div className="space-y-1">
                    <h3 className="text-[13px] font-medium leading-tight text-card-foreground">
                        {task.title}
                    </h3>
                    {task.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {task.description}
                        </p>
                    )}
                </div>

                {task.dueDate && (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mt-0.5">
                        <Calendar size={12} />
                        <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
