import authService from "../services/auth.service"
import { AuthRequest, LoginRequest, RefreshRequest, RegisterRequest } from "../models/request.model"
import { Response, Request } from "express"
import { ValidationError } from "../models/error.model"
export const register = async (req: RegisterRequest, res: Response) => {
    const { name, last_name, email, password } = req.body
    await authService.register({ name, last_name, email, password })
    res.status(200).json({
        success: true,
        message: "Yeni kullanıcı başarıyla oluşturuldu."
    })
}
export const login = async (req: LoginRequest, res: Response) => {
    const { email, password, rememberMe } = req.body
    const tokens = await authService.login({ email, password, rememberMe })
    // 1. Access Token Cookie (Kısa ömürlü)
    res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true, // JavaScript ile okunamaz! (XSS Koruması)
        secure: process.env.NODE_ENV === 'production', // Sadece HTTPS'te çalışır (Canlıda true olmalı)
        sameSite: 'strict', // CSRF Koruması
        maxAge: 24 * 60 * 60 * 1000 // 1 Gün (Milisaniye cinsinden)
    });

    // 2. Refresh Token Cookie (Uzun ömürlü)
    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 24 * 60 * 60 * 1000 // 15 Gün
    });
    res.status(200).json({
        success: true,
        message: "Giriş başarılı.",
    })
}
export const refreshAccessToken = async (req: RefreshRequest, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    const tokens = await authService.renewTokens(refreshToken);
    res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 Gün
    });
    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 24 * 60 * 60 * 1000 // 15 Gün
    });
    res.status(200).json({
        success: true,
        message: "Token başarıyla yenilendi.",
    });
}
export const logout = async (req: AuthRequest, res: Response) => {
    await authService.logout(req.user?.id);

    // Çıkışta cookie'deki tokenları sil
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    res.status(200).json({
        success: true,
        message: "Çıkış başarılı."
    });
}
export const getMe = async (req: AuthRequest, res: Response) => {
    const user = await authService.getMe(req.user?.id);
    res.status(200).json({
        success: true,
        data: user
    })
}
export const updateProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { name, last_name } = req.body;

    const updatedUser = await authService.updateProfile(userId!, name, last_name);

    res.status(200).json({
        success: true,
        message: "Profil başarıyla güncellendi.",
        data: updatedUser
    });
}
export const changePassword = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(currentPassword, newPassword, userId);
    res.status(200).json({
        success: true,
        message: "Şifre başarıyla değiştirildi."
    });
}
export const changeEmail = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { newEmail, password } = req.body;
    const updatedUser = await authService.changeEmail(newEmail, password, userId);
    res.status(200).json({
        success: true,
        message: "E-posta başarıyla değiştirildi.",
        data: updatedUser
    });
}