import { UnauthorizedError } from "../models/error.model";
import type { NextFunction, Response } from "express";
import { extractTokenFromHeader, verifyToken } from "../utils/jwt.util";
import { AuthRequest } from "../models/request.model";
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;
    if (!token) throw new UnauthorizedError("Geçersiz token");
    try {
        const decoded = verifyToken(token);
        req.user = {
            id: decoded.user_id,
        }
        next()
    } catch (error) {
        throw new UnauthorizedError("Token geçersiz veya süresi dolmuş.")
    }
}