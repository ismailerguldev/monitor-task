import { RegisterUserSchema, LoginUserSchema, InsertUserSchema } from "../validations/auth.validation";
import { z } from "zod";

export type RegisterUser = z.infer<typeof RegisterUserSchema>;
export type LoginUser = z.infer<typeof LoginUserSchema>;
export type InsertUser = z.infer<typeof InsertUserSchema>;
export interface GetMeUser {
    name: string;
    last_name: string;
    email: string;
}