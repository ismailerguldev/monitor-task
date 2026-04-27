import { 
  NewTaskSchema, 
  EditTaskSchema, 
  TaskSchema,
  TaskStatusSchema,
  TaskPrioritySchema 
} from "../validations/task.validation";
import { z } from "zod";

export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
export type NewTask = z.infer<typeof NewTaskSchema>;
export type EditTask = z.infer<typeof EditTaskSchema>;
export type Task = z.infer<typeof TaskSchema>;