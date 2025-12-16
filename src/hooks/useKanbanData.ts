import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Task, Column, Priority } from '@/types/kanban';

// ไม่ใช้ next-auth แล้ว ใช้ Supabase Auth โดยตรงเพื่อให้เข้ากับ RLS
// import { useSession } from 'next-auth/react'; 

export function useKanbanData() {
    const supabase = createClient();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [columns, setColumns] = useState<Column[]>([]);
    const [loading, setLoading] = useState(true);
    const [boardId, setBoardId] = useState<string | null>(null);

    useEffect(() => {
        const fetchBoardData = async () => {
            setLoading(true);

            // 1. เช็ค User ปัจจุบัน
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // 2. หา Board ของ User คนนี้ (ถ้าไม่มีให้สร้างใหม่)
            let currentBoardId = null;
            const { data: boards } = await supabase.from('boards').select('id').eq('user_id', user.id).limit(1);

            if (boards && boards.length > 0) {
                currentBoardId = boards[0].id;
            } else {
                // สร้าง Board ใหม่ถ้ายังไม่มี
                const { data: newBoard, error: createError } = await supabase
                    .from('boards')
                    .insert([{ user_id: user.id, title: 'My Board' }])
                    .select()
                    .single();

                if (newBoard) {
                    currentBoardId = newBoard.id;
                    // สร้าง Columns เริ่มต้น
                    const defaultCols = [
                        { board_id: newBoard.id, user_id: user.id, title: 'To Do', position: 0 },
                        { board_id: newBoard.id, user_id: user.id, title: 'In Progress', position: 1 },
                        { board_id: newBoard.id, user_id: user.id, title: 'Done', position: 2 }
                    ];
                    await supabase.from('columns').insert(defaultCols);
                }
            }

            setBoardId(currentBoardId);

            if (currentBoardId) {
                // 3. ดึง Columns
                const { data: fetchedColumns } = await supabase
                    .from('columns')
                    .select('*')
                    .eq('board_id', currentBoardId)
                    .order('position');

                if (fetchedColumns) setColumns(fetchedColumns);

                // 4. ดึง Tasks
                const { data: fetchedTasks } = await supabase
                    .from('tasks')
                    .select('*')
                    .eq('board_id', currentBoardId)
                    .order('position');

                // แปลง field จาก snake_case (DB) เป็น camelCase (Frontend)
                if (fetchedTasks) {
                    const formattedTasks: Task[] = fetchedTasks.map(t => ({
                        id: t.id,
                        columnId: t.column_id,
                        title: t.title,
                        description: t.description,
                        priority: t.priority as Priority,
                        createdAt: t.created_at,
                        position: t.position
                    }));
                    setTasks(formattedTasks);
                }
            }
            setLoading(false);
        };

        fetchBoardData();
    }, []);

    const addTask = async (columnId: string, title: string, priority: Priority) => {
        if (!boardId) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const newPosition = tasks.filter(t => t.columnId === columnId).length;

        const newTaskPayload = {
            board_id: boardId,
            column_id: columnId,
            user_id: user.id,
            title,
            priority,
            position: newPosition,
            description: ''
        };

        // ส่งเข้า DB
        const { data, error } = await supabase.from('tasks').insert([newTaskPayload]).select().single();

        if (error) {
            console.error("Error adding task:", error);
            return;
        }

        if (data) {
            // อัปเดตหน้าจอ
            const newTask: Task = {
                id: data.id,
                columnId: data.column_id,
                title: data.title,
                priority: data.priority as Priority,
                createdAt: data.created_at,
                position: data.position,
                description: data.description
            };
            setTasks(prev => [...prev, newTask]);
        }
    }

    const updateTask = async (taskId: string, updates: Partial<Task>) => {
        // Optimistic update (อัปเดตหน้าจอก่อน)
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));

        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.priority) dbUpdates.priority = updates.priority;
        if (updates.columnId) dbUpdates.column_id = updates.columnId;
        if (updates.description) dbUpdates.description = updates.description;
        if (typeof updates.position === 'number') dbUpdates.position = updates.position;

        const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', taskId);
        if (error) console.error("Error updating task:", error);
    }

    const deleteTask = async (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        if (error) console.error("Error deleting task:", error);
    }

    const moveTask = async (taskId: string, newColumnId: string) => {
        const newPosition = tasks.filter(t => t.columnId === newColumnId).length;
        updateTask(taskId, { columnId: newColumnId, position: newPosition });
    }

    const importBoardData = async (importedData: { tasks: Task[], columns: Column[] }) => {
        if (!boardId) return;
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            // 1. ลบข้อมูลเก่าทั้งหมดใน Board นี้
            await supabase.from('tasks').delete().eq('board_id', boardId);
            await supabase.from('columns').delete().eq('board_id', boardId);

            // 2. สร้าง Map เพื่อจับคู่ ID เก่า -> ID ใหม่ (สำหรับ Column)
            const columnIdMap = new Map<string, string>();

            // 3. Insert Columns ใหม่ทีละอัน เพื่อเอา ID ใหม่มาใช้
            // (ต้องเรียงตาม position เพื่อความสวยงาม)
            const sortedColumns = importedData.columns.sort((a, b) => (a.position || 0) - (b.position || 0));

            for (const col of sortedColumns) {
                const { data: newCol } = await supabase
                    .from('columns')
                    .insert({
                        board_id: boardId,
                        user_id: user.id,
                        title: col.title,
                        position: col.position
                    })
                    .select()
                    .single();

                if (newCol) {
                    columnIdMap.set(col.id, newCol.id);
                }
            }

            // 4. เตรียมข้อมูล Tasks ใหม่ โดยเปลี่ยน column_id ให้ตรงกับที่สร้างใหม่
            const newTasksPayload = importedData.tasks.map(t => {
                const newColumnId = columnIdMap.get(t.columnId);
                if (!newColumnId) return null; // ข้ามถ้าหา column ไม่เจอ (กันเหนียว)

                return {
                    board_id: boardId,
                    user_id: user.id,
                    column_id: newColumnId,
                    title: t.title,
                    description: t.description || '',
                    priority: t.priority,
                    position: t.position
                };
            }).filter(t => t !== null);

            // 5. Insert Tasks
            if (newTasksPayload.length > 0) {
                await supabase.from('tasks').insert(newTasksPayload);
            }

            // 6. โหลดข้อมูลใหม่ขึ้นมาแสดงผล
            await fetchBoardData();

        } catch (error) {
            console.error('Import failed:', error);
            // อาจจะเพิ่ม logic แจ้งเตือน error
        } finally {
            setLoading(false);
        }
    };

    return {
        tasks,
        columns,
        loading,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        setTasks,
        setColumns,
        importBoardData
    };
}
