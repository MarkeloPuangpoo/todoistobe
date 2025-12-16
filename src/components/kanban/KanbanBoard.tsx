'use client';

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { Priority, Task } from '@/types/kanban';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { Share2, Download, CloudDownload, LogOut, Loader2 } from 'lucide-react';
import { ShareImportModal } from './ShareImportModal';
import { useKanbanData } from '@/hooks/useKanbanData';
import { useAuth } from '@/contexts/auth-context';

export function KanbanBoard() {
    const { user, signOut } = useAuth();
    const { tasks, columns, addTask, updateTask, deleteTask, setTasks, loading } = useKanbanData();

    // UI Local State
    const [mounted, setMounted] = useState(false);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareModalMode, setShareModalMode] = useState<'share' | 'import'>('share');

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleShareClick = () => {
        setShareModalMode('share');
        setIsShareModalOpen(true);
    };

    const handleImportClick = () => {
        setShareModalMode('import');
        setIsShareModalOpen(true);
    };

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === 'Task') {
            setActiveTask(event.active.data.current.task);
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === 'Task';
        const isOverTask = over.data.current?.type === 'Task';
        const isOverColumn = over.data.current?.type === 'Column';

        if (!isActiveTask) return;

        // Dropping a Task over another Task
        if (isActiveTask && isOverTask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);

                if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
                    const newTasks = [...tasks];
                    const newColumnId = tasks[overIndex].columnId;
                    newTasks[activeIndex] = {
                        ...newTasks[activeIndex],
                        columnId: newColumnId
                    };
                    // We just update local state for smoothness, but we don't persist yet until drag end
                    // Actually, if we change columns during drag over, we might want to trigger `updateTask` only at end.
                    // But `setTasks` here updates the UI immediately.
                    return arrayMove(newTasks, activeIndex, overIndex);
                }

                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

        // Dropping a Task over a Column
        if (isActiveTask && isOverColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const activeTask = tasks[activeIndex];
                if (activeTask.columnId !== overId) {
                    const newTasks = [...tasks];
                    newTasks[activeIndex] = { ...activeTask, columnId: String(overId) };
                    return arrayMove(newTasks, activeIndex, newTasks.length - 1);
                }
                return tasks;
            });
        }
    };

    const onDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const startTask = tasks.find(t => t.id === activeId);
        // Note: `tasks` here might be stale if we used `setTasks` in DragOver?
        // Actually, dnd-kit recommends updating state in DragOver.
        // So `tasks` state is already updated with new positions/columns visually.

        // We need to persist the change.
        // Identify the task's new column.
        // Since we updated `tasks` state in `onDragOver`, we can just look up the task in the *current* state 
        // but `onDragEnd` closes over the initial state if not careful? 
        // No, it should be fine. But finding the task in `tasks` (from hook) will return the *latest* render's tasks?

        // Better: rely on `event.active.data.current` maybe? existing patterns usually persist here.

        // Let's find the task in the *latest* tasks array (which we have from the hook render).
        const currentTask = tasks.find(t => t.id === activeId);
        if (currentTask) {
            // Persist the column change.
            // We use `updateTask` to send to Supabase.
            // Note: `updateTask` also does optimistic update, which might be redundant if we already did it in DragOver.
            // But `updateTask` is "safe".
            // Crucially: DragOver only updated the *local memory* array via `setTasks`.
            // Data hook re-render? Yes.

            // If the column changed, persist it.
            // For now, we are not persisting "position" index to DB, so just columnId.
            updateTask(String(activeId), { columnId: currentTask.columnId });
        }
    };

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full w-full">
            {/* Toolbar */}
            <div className="flex items-center justify-end px-8 pt-4 pb-0 gap-2">
                {user && (
                    <div className="flex items-center mr-auto text-xs text-slate-500 font-medium px-2">
                        <span>{user.email}</span>
                    </div>
                )}

                <button
                    onClick={handleShareClick}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md text-xs font-medium transition-colors dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
                    title="Share Board"
                >
                    <Share2 size={14} />
                    <span>Share</span>
                </button>
                <button
                    onClick={handleImportClick}
                    className="glass-button flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-xs font-medium transition-colors border border-border"
                    title="Import Board"
                >
                    <CloudDownload size={14} />
                    <span>Import</span>
                </button>

                <button
                    onClick={() => signOut()}
                    className="glass-button flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md text-xs font-medium transition-colors border border-destructive/20"
                    title="Sign Out"
                >
                    <LogOut size={14} />
                    <span>Logout</span>
                </button>
            </div>

            <div className="flex h-full w-full gap-4 overflow-x-auto p-4 md:p-8 pt-6">
                <DndContext
                    id="kanban-board"
                    sensors={sensors}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDragEnd={onDragEnd}
                >
                    <div className="flex gap-4 min-h-0 h-full">
                        {columns.map((col) => (
                            <KanbanColumn
                                key={col.id}
                                column={col}
                                tasks={tasks.filter((t) => t.columnId === col.id)}
                                onAddTask={addTask}
                                onDeleteTask={deleteTask}
                            />
                        ))}
                    </div>

                    {mounted && createPortal(
                        <DragOverlay>
                            {activeTask && <KanbanCard task={activeTask} onDelete={() => { }} />}
                        </DragOverlay>,
                        document.body
                    )}
                </DndContext>
            </div>

            <ShareImportModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                initialMode={shareModalMode}
                tasks={tasks}
                columns={columns}
                onImportSuccess={() => { }} // TODO: Handle import to Supabase?
            />
        </div>
    );
}
