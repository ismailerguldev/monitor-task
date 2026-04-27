import pool from "../config/db";
import { AppError, InternalServerError, NotFoundError } from "../models/error.model";
import { EditTask, NewTask, Task } from "../models/task.model";

const insertNewTask = async (taskData: NewTask) => {
    const query = "INSERT INTO tasks (user_id, title, description, status, priority, due_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id";
    try {
        const result = await pool.query(query, [
            taskData.user_id,
            taskData.title,
            taskData.description,
            taskData.status,
            taskData.priority,
            taskData.due_date
        ]);
        return result.rows[0]?.id as string | null | undefined;
    } catch (error) {
        console.error("Error inserting new task:", error);
        throw new InternalServerError("Bir hata oluştu.")
    }
}
const getTasksByUserId = async (user_id: string, page: number) => {
    const query = "SELECT id, title, description, status, priority, due_date, created_at, completed_at FROM tasks WHERE user_id = $1 AND is_deleted = FALSE ORDER BY created_at DESC LIMIT 10 OFFSET $2;";
    const result = await pool.query(query, [user_id, (page - 1) * 10]);
    return result.rows as Task[];
}
const editTask = async (userId: string, taskId: string, { description, due_date, priority, status, title }: Partial<EditTask>) => {
    const query = `
        UPDATE tasks 
        SET 
            title = COALESCE($1, title), 
            description = COALESCE($2, description), 
            status = COALESCE($3, status), 
            priority = COALESCE($4, priority), 
            due_date = COALESCE($5, due_date),
            completed_at = CASE 
                WHEN $3 = 'COMPLETED' THEN NOW()
                WHEN $3 IN ('PENDING', 'IN_PROGRESS') THEN NULL
                ELSE completed_at
            END
        WHERE id = $6 AND user_id = $7 AND is_deleted = FALSE
        RETURNING id, title, description, status, priority, due_date, created_at, completed_at
    `;
    try {
        const result = await pool.query(query, [
            title,
            description,
            status,
            priority,
            due_date,
            taskId,
            userId
        ]);
        if (result.rowCount === 0) {
            throw new NotFoundError("Görev bulunamadı veya bu görevi düzenleme yetkiniz yok.");
        }
        return result.rows[0] as Task;
    }
    catch (error) {
        if (error instanceof AppError) throw error;
        console.error("Error editing task:", error);
        throw new InternalServerError("Görev güncellenirken beklenmeyen bir hata oluştu.");
    }
}
const softDeleteTask = async (userId: string, taskId: string) => {
    const query = `
        UPDATE tasks 
        SET is_deleted = TRUE, delete_remains = NOW() + INTERVAL '3 days' 
        WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE
    `;

    const result = await pool.query(query, [taskId, userId]);
    if (result.rowCount === 0) {
        throw new NotFoundError("Görev bulunamadı veya zaten silinmiş.");
    }
    return true;
}
const hardDeleteExpiredTasks = async () => {
    const query = "DELETE FROM tasks WHERE is_deleted = TRUE AND delete_remains < NOW() RETURNING id";
    try {
        const result = await pool.query(query);
        if (result.rowCount && result.rowCount > 0) {
            console.log(`🧹 Çöp Toplayıcı Çalıştı: ${result.rowCount} adet süresi dolmuş görev kalıcı olarak silindi.`);
        }
    } catch (error) {
        console.error("Cron Job Hatası (Süresi Dolan Görevleri Silme):", error);
    }
}
export default {
    insertNewTask,
    getTasksByUserId,
    editTask,
    softDeleteTask,
    hardDeleteExpiredTasks
}
