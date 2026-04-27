import { AuthRequest, EditTaskRequest, NewTaskRequest } from "../models/request.model";
import { NewTask } from "../models/task.model";
import taskService from "../services/task.service";
import { Response } from "express";
export const createTask = async (req: NewTaskRequest, res: Response) => {
    const { title, description, status, priority, due_date } = req.body;
    const user_id = req.user?.id;
    const taskData: NewTask = {
        user_id: user_id!,
        title,
        description,
        status,
        priority,
        due_date: due_date
    }
    const taskId = await taskService.createTask(taskData);
    res.status(201).json({
        success: true,
        message: "Görev başarıyla oluşturuldu.",
        data: { id: taskId }
    });
}
export const getTasks = async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const tasks = await taskService.getTasks(page, req.user?.id);
    res.status(200).json({
        success: true,
        message: "Görevler başarıyla getirildi.",
        data: tasks
    });
}
export const editTask = async (req: EditTaskRequest, res: Response) => {
    const taskId = req.params.id;
    const { title, description, status, priority, due_date } = req.body;
    const userId = req.user?.id;
    const newTask = await taskService.editTask(userId!, taskId, { title, description, status, priority, due_date });
    res.status(200).json({
        success: true,
        message: "Görev başarıyla güncellendi.",
        data: newTask
    });
}
export const softDeleteTask = async (req: AuthRequest, res: Response) => {
    const taskId = req.params.id as string | undefined;
    const userId = req.user?.id;
    await taskService.softDeleteTask(userId, taskId);
    res.status(200).json({
        success: true,
        message: "Görev başarıyla silindi."
    });
}