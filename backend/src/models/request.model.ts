import { Request } from "express"
import { z } from "zod"
import { EditTaskSchema, NewTaskSchema } from "../validations/task.validation"
import { RegisterUserSchema, LoginUserSchema } from "../validations/auth.validation"

export interface RegisterRequest extends Request {
    body: z.infer<typeof RegisterUserSchema>
}
export interface LoginRequest extends Request {
    body: z.infer<typeof LoginUserSchema>
}
export interface AuthRequest extends Request {
    user?: {
        id: string
    }
}
export interface RefreshRequest extends Request {
    body: {
        refreshToken: string
    }
}
export interface NewTaskRequest extends AuthRequest {
  body: z.infer<typeof NewTaskSchema>;
}

export interface EditTaskRequest extends AuthRequest {
  body: Partial<z.infer<typeof EditTaskSchema>>;
  params: {
    id: string;
  };
}