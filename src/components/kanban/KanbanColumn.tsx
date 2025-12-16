import React, { useState } from 'react';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column, Priority, Task } from '@/types/kanban';
import { KanbanCard } from './KanbanCard';
import { Plus, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface KanbanColumnProps {
    column: Column;
    tasks: Task[];
    onAddTask: (columnId: string, title: string, priority: Priority) => void;
    onDeleteTask: (id: string) => void;
}

export function KanbanColumn({ column, tasks, onAddTask, onDeleteTask }: KanbanColumnProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<Priority>('Medium');

    const { setNodeRef } = useSortable({
        id: column.id,
        data: {
            type: 'Column',
            column,
        },
        disabled: true, // Disable dragging columns for simplicity requested for now, or enable if wanted. User asked for cards moving.
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        onAddTask(column.id, newTaskTitle, newTaskPriority);
        setNewTaskTitle('');
        setIsAdding(false);
    };

    return (
        <div
            ref={setNodeRef}
            className="flex flex-col h-full w-[350px] min-w-[350px] rounded-2xl bg-secondary/50 border border-border/50 shadow-sm"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-foreground/70">
                        {column.title}
                    </h2>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {tasks.length}
                    </span>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="text-muted-foreground/70 hover:text-foreground transition-colors"
                >
                    <Plus size={18} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 pt-0">
                <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-3 mt-2">
                        {tasks.map((task) => (
                            <KanbanCard key={task.id} task={task} onDelete={onDeleteTask} />
                        ))}
                    </div>
                </SortableContext>

                {/* Add Task Indicator/Form */}
                {isAdding ? (
                    <form onSubmit={handleSubmit} className="mt-3 rounded-xl bg-card p-3 border border-border shadow-sm animate-in fade-in duration-200">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Task title..."
                            className="w-full text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none bg-transparent"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                        />
                        <div className="mt-3 flex items-center justify-between">
                            <select
                                value={newTaskPriority}
                                onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                                className="text-xs bg-muted border-none rounded px-2 py-1 text-muted-foreground outline-none cursor-pointer"
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="p-1 text-muted-foreground hover:text-foreground"
                                >
                                    <X size={16} />
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-md font-medium hover:bg-primary/90"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="mt-3 w-full rounded-xl border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground hover:bg-secondary/50"
                    >
                        + Add Task
                    </button>
                )}
            </div>
        </div>
    );
}
