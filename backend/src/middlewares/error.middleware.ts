import { AppError } from "../models/error.model"
import type { NextFunction, Request, Response } from "express";

export const errorMiddleware = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err && err instanceof AppError && err.isOperational) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    } else {
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error'
        });
    }
}
