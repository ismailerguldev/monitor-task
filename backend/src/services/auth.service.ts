import { ConflictError, InternalServerError, NotFoundError, UnauthorizedError, ValidationError } from "../models/error.model";
import { InsertUser, LoginUser, RegisterUser } from "../models/user.model"
import authRepository from "../repositories/auth.repository"
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.util";
import { generateRefreshToken } from "../utils/refreshToken.util";
import refresh_tokenRepository from "../repositories/refreshToken.repository";
const register = async ({ email, last_name, name, password }: RegisterUser) => {
    const isExist = await authRepository.findExistingUser(email);
    if (isExist) throw new ConflictError("Bu kullanıcı zaten kayıtlı.");
    const password_hash = await bcrypt.hash(password, 10);
    const newUserData: InsertUser = {
        email: email,
        last_name: last_name,
        name: name,
        password_hash: password_hash
    }
    const isSuccess = await authRepository.insertNewUser(newUserData)
    if (!isSuccess) throw new InternalServerError("Bir hata oluştu.");
}
const login = async ({ email, password }: LoginUser) => {
    const userData = await authRepository.getUserWithEmailForLogin(email);
    if (!userData) throw new ValidationError("E-posta veya şifre hatalı.");
    const isPasswordValid = await bcrypt.compare(password, userData.password_hash);
    if (!isPasswordValid) throw new ValidationError("E-posta veya şifre hatalı.");
    const accessToken = generateToken(userData.id);
    const refreshToken = generateRefreshToken();
    await refresh_tokenRepository.insertNewRefreshToken(userData.id, refreshToken);
    return { accessToken, refreshToken };
}
const renewTokens = async (refreshToken: string) => {
    const tokenData = await refresh_tokenRepository.getRefreshTokenData(refreshToken);
    if (!tokenData || tokenData.is_expired) {
        throw new UnauthorizedError("Geçersiz veya süresi dolmuş refresh token.");
    }
    const newAccessToken = generateToken(tokenData.user_id);
    const newRefreshToken = generateRefreshToken();
    await refresh_tokenRepository.insertNewRefreshToken(tokenData.user_id, newRefreshToken);
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    };
}
const logout = async (userId?: string) => {
    if (!userId) return true;
    await refresh_tokenRepository.revokeAllRefreshTokensForUser(userId);
    return true;
}
const updateProfile = async (userId: string, name?: string, lastName?: string) => {
    return await authRepository.updateProfile(userId, name, lastName);
}
// auth.service.ts
const changePassword = async (currentPw: string, newPw: string, userId?: string,) => {
    if (!userId) throw new UnauthorizedError("Kullanıcı kimliği doğrulanamadı.");
    const userPasswordHash = await authRepository.getUserPasswordById(userId);

    const isMatch = await bcrypt.compare(currentPw, userPasswordHash ?? '');
    if (!isMatch) throw new ConflictError("Mevcut şifreniz hatalı.");

    const hashedNewPw = await bcrypt.hash(newPw, 10);
    await authRepository.updatePassword(userId, hashedNewPw);
};

const changeEmail = async (newEmail: string, password: string, userId?: string,) => {
    if (!userId) throw new UnauthorizedError("Kullanıcı kimliği doğrulanamadı.");
    const userPasswordHash = await authRepository.getUserPasswordById(userId);
    // 1. Şifre doğrula
    const isMatch = await bcrypt.compare(password, userPasswordHash ?? '');
    if (!isMatch) throw new ConflictError("Mevcut şifreniz hatalı.");
    // 2. Yeni e-posta kullanımda mı kontrol et
    const existingUser = await authRepository.findExistingUser(newEmail);
    if (existingUser) throw new InternalServerError("Bir hata meydana geldi. Lütfen tekrar deneyin.");

    return await authRepository.updateEmail(userId, newEmail);
};
const getMe = async (userId?: string) => {
    if (!userId) throw new UnauthorizedError("Kullanıcı kimliği doğrulanamadı.");
    const user = await authRepository.getUserForProfile(userId);
    if (!user) throw new NotFoundError("Kullanıcı bulunamadı.");
    return user;
}
export default {
    register,
    login,
    renewTokens,
    logout,
    updateProfile,
    changeEmail,
    changePassword,
    getMe
}