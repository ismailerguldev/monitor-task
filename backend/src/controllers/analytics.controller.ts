import { AuthRequest } from "../models/request.model";
import analyticsService from "../services/analytics.service";
import { Response } from "express";
export const getAnalytics = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const data = await analyticsService.getAnalytics(userId);
    res.status(200).json({
        success: true,
        data
    });
}