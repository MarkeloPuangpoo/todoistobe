'use client';

import React, { useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    MouseSensor,
    TouchSensor,
    UniqueIdentifier,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { Column, Priority, Task } from '@/types/kanban';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';

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
    const [columns] = useState<Column[]>(defaultColumns);
    const [tasks, setTasks] = useState<Task[]>(defaultTasks);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

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
                    return arrayMove(newTasks, activeIndex, newTasks.length - 1); // This logic might need refinement for arbitrary position but works for simple switch
                }
                return tasks;
            });
        }
    };

    const onDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);

        // Final reorder validation could happen here if needed, but onDragOver handles visual updates
        // For arrays already moved in onDragOver, we just need to settle
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

    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="flex h-full w-full gap-4 overflow-x-auto p-4 md:p-8">
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
    );
}
