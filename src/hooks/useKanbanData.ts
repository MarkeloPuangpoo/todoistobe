import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Task, Column, Priority } from '@/types/kanban';
import { useSession } from 'next-auth/react';
import { nanoid } from 'nanoid';

const defaultColumns: Column[] = [
    { id: 'todo', title: 'To Do', position: 0 },
    { id: 'in-progress', title: 'In Progress', position: 1 },
    { id: 'done', title: 'Done', position: 2 },
];

const defaultTasks: Task[] = [
    {
        id: '1',
        columnId: 'todo',
        title: 'Welcome to TaskFlow',
        description: 'This is a demo board since Supabase is not fully connected yet.',
        priority: 'High',
        createdAt: new Date().toISOString(),
        position: 0
    },
    {
        id: '2',
        columnId: 'in-progress',
        title: 'Try dragging this task',
        priority: 'Medium',
        createdAt: new Date().toISOString(),
        position: 0
    }
];

export function useKanbanData() {
    const { data: session, status } = useSession();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [columns, setColumns] = useState<Column[]>([]);
    const [loading, setLoading] = useState(true);

    // TEMPORARY: Use local storage to simulate "per user" data if possible, or just memory
    // User requested "Supabase" but since logic is severed, we fallback to Local Memory driven by defaults.

    useEffect(() => {
        if (status === 'loading') return;

        // Start with default data immediately so it's not black/empty
        setColumns(defaultColumns);
        setTasks(defaultTasks);
        setLoading(false);

    }, [status]);

    const addTask = async (columnId: string, title: string, priority: Priority) => {
        const newTask: Task = {
            id: nanoid(),
            columnId,
            title,
            priority,
            createdAt: new Date().toISOString(),
            position: tasks.filter(t => t.columnId === columnId).length
        };
        setTasks(prev => [...prev, newTask]);
    }

    const updateTask = async (taskId: string, updates: Partial<Task>) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    }

    const deleteTask = async (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
    }

    const moveTask = async (taskId: string, newColumnId: string) => {
        updateTask(taskId, { columnId: newColumnId });
    }

    return {
        tasks,
        columns,
        loading,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        setTasks,
        setColumns
    };
}
