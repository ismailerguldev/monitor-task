import { z } from "zod";
// Enum validations
export const TaskStatusSchema = z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]);
export const TaskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

// Task model validations
export const NewTaskSchema = z.object({
  user_id: z.uuid("Invalid user ID"),
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().min(1, "Description is required").max(1000, "Description is too long"),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  due_date: z.coerce.date().nullable().optional(),
});

export const EditTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().min(1, "Description is required").max(1000, "Description is too long"),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  due_date: z.date().nullable().optional(),
});

export const TaskSchema = z.object({
  id: z.uuid("Invalid task ID"),
  title: z.string(),
  description: z.string().nullable(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  due_date: z.date().nullable(),
  created_at: z.date(),
  completed_at: z.date().nullable(),
});

// Request validations
export const NewTaskRequestSchema = NewTaskSchema;

export const EditTaskRequestSchema = z.object({
  body: EditTaskSchema.partial(),
  params: z.object({
    id: z.uuid("Invalid task ID"),
  }),
});
