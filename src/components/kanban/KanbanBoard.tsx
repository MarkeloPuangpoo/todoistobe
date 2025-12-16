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
import { Column, Priority, Task } from '@/types/kanban';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { Share2, Download, CloudDownload } from 'lucide-react';
import { shareBoardData, getSharedData } from '@/app/actions/share';
import { ShareImportModal } from './ShareImportModal';

const defaultColumns: Column[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
];

const defaultTasks: Task[] = [
    {
        id: '1',
        columnId: 'todo',
        title: 'Research UI patterns',
        description: 'Look into Linear and Raycast designs.',
        priority: 'High',
        dueDate: new Date().toISOString(),
    },
    {
        id: '2',
        columnId: 'todo',
        title: 'Setup repository',
        priority: 'Medium',
        dueDate: new Date().toISOString(),
    },
    {
        id: '3',
        columnId: 'in-progress',
        title: 'Implement drag and drop',
        priority: 'High',
    },
];

export function KanbanBoard() {
    // Lazy initialize from localStorage to avoid hydration mismatch while supporting persistence
    const [mounted, setMounted] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // We start with defaults for SSR match, then useEffect loads real data
    const [columns, setColumns] = useState<Column[]>(defaultColumns);
    const [tasks, setTasks] = useState<Task[]>(defaultTasks);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    // NEW: Modal State
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareModalMode, setShareModalMode] = useState<'share' | 'import'>('share');

    // Initial load from localStorage
    useEffect(() => {
        setMounted(true);
        // Only load if localStorage has data, otherwise keep defaults
        const savedTasks = localStorage.getItem('kanban-tasks');
        const savedColumns = localStorage.getItem('kanban-columns');

        if (savedTasks) {
            try {
                setTasks(JSON.parse(savedTasks));
            } catch (e) {
                console.error('Failed to parse tasks', e);
            }
        }

        if (savedColumns) {
            try {
                setColumns(JSON.parse(savedColumns));
            } catch (e) {
                console.error('Failed to parse columns', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever state changes
    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem('kanban-tasks', JSON.stringify(tasks));
        localStorage.setItem('kanban-columns', JSON.stringify(columns));
    }, [tasks, columns, isLoaded]);

    const handleShareClick = () => {
        setShareModalMode('share');
        setIsShareModalOpen(true);
    };

    const handleImportClick = () => {
        setShareModalMode('import');
        setIsShareModalOpen(true);
    };

    const handleImportSuccess = (data: { tasks: Task[]; columns?: Column[] }) => {
        setTasks(data.tasks);
        if (data.columns) {
            setColumns(data.columns);
        }
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
                    // Fix: Changing column
                    const newTasks = [...tasks];
                    newTasks[activeIndex] = {
                        ...newTasks[activeIndex],
                        columnId: tasks[overIndex].columnId
                    };
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
                    // Move to the end of the column if dropping on the column itself
                    return arrayMove(newTasks, activeIndex, newTasks.length - 1);
                }
                return tasks;
            });
        }
    };

    const onDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);
    };

    const handleAddTask = (columnId: string, title: string, priority: Priority) => {
        const newTask: Task = {
            id: Math.random().toString(36).substr(2, 9),
            columnId,
            title,
            priority,
            dueDate: new Date().toISOString(),
        };
        setTasks([...tasks, newTask]);
    };

    const handleDeleteTask = (id: string) => {
        setTasks(tasks.filter((t) => t.id !== id));
    };

    return (
        <div className="flex flex-col h-full w-full">
            {/* Toolbar */}
            <div className="flex items-center justify-end px-8 pt-4 pb-0 gap-2">
                <button
                    onClick={handleShareClick}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md text-xs font-medium transition-colors dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                    title="Share Board"
                >
                    <Share2 size={14} />
                    <span>Share</span>
                </button>
                <button
                    onClick={handleImportClick}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-md text-xs font-medium transition-colors dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    title="Import Board"
                >
                    <CloudDownload size={14} />
                    <span>Import</span>
                </button>
            </div>

            <div className="flex h-full w-full gap-4 overflow-x-auto p-4 md:p-8 pt-2">
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
                                onAddTask={handleAddTask}
                                onDeleteTask={handleDeleteTask}
                            />
                        ))}
                    </div>

                    {/* Portal for the dragged overlay task to ensure it's on top */}
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
                onImportSuccess={handleImportSuccess}
            />
        </div>
    );
}
