import { z } from "zod";

// Auth model validations
export const RegisterUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  last_name: z.string().min(1, "Last name is required").max(100, "Last name is too long"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password is too long"),
});
export const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  last_name: z.string().min(1, "Last name is required").max(100).optional(),
}).strict();

export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters long"),
});

export const UpdateEmailSchema = z.object({
  newEmail: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required to change email"),
});

export const LoginUserSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

export const InsertUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  last_name: z.string().min(1, "Last name is required").max(100, "Last name is too long"),
  email: z.email("Invalid email address"),
  password_hash: z.string().min(1, "Password hash is required"),
});

// Export types
export type RegisterUser = z.infer<typeof RegisterUserSchema>;
export type LoginUser = z.infer<typeof LoginUserSchema>;
export type InsertUser = z.infer<typeof InsertUserSchema>;
