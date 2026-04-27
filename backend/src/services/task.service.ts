import { InternalServerError, NotFoundError, UnauthorizedError } from "../models/error.model";
import { EditTask, NewTask } from "../models/task.model";
import taskRepository from "../repositories/task.repository";
import { myCache } from "../utils/cache.util";

const createTask = async (taskData: NewTask) => {
    if (!taskData.user_id) throw new UnauthorizedError("Kullanıcı kimliği eksik.");
    const taskId = await taskRepository.insertNewTask(taskData);
    if (!taskId) throw new InternalServerError("Görev oluşturulurken bir hata oluştu.");
    myCache.del(`dashboard_${taskData.user_id}`); // Yeni görev eklenince ilgili kullanıcının dashboard verisini cache'den temizle
    return taskId;
}
const getTasks = async (page: number, userId?: string) => {
    if (!userId) throw new UnauthorizedError("Kullanıcı kimliği eksik.");
    const tasks = await taskRepository.getTasksByUserId(userId, page);
    return tasks;
}
const editTask = async (userId: string, taskId: string, { description, due_date, priority, status, title }: Partial<EditTask>) => {
    if (!userId) throw new UnauthorizedError("Kullanıcı kimliği eksik.");
    const newTask = await taskRepository.editTask(userId, taskId, { description, due_date, priority, status, title });
    myCache.del(`dashboard_${userId}`); // Görev düzenlendiğinde ilgili kullanıcının dashboard verisini cache'den temizle
    return newTask;
}
const softDeleteTask = async (userId?: string, taskId?: string) => {
    if (!userId) throw new UnauthorizedError("Kullanıcı kimliği eksik.");
    if (!taskId) throw new NotFoundError("Görev bulunamadı veya zaten silinmiş.");
    myCache.del(`dashboard_${userId}`);
    await taskRepository.softDeleteTask(userId, taskId);
}
export default {
    createTask,
    getTasks,
    editTask,
    softDeleteTask
}
