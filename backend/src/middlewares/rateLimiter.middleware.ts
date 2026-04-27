import rateLimit from 'express-rate-limit';

// 1. Genel API Sınırı (Tüm endpointler için hafif bir sınır)
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // 15 dakikada her IP için maksimum 100 istek
    message: {
        success: false,
        message: "Çok fazla istek attınız. Lütfen 15 dakika sonra tekrar deneyin."
    },
    standardHeaders: true, 
    legacyHeaders: false, 
});

// 2. Auth Sınırı (Login/Register için çok daha sert bir sınır)
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 Saat
    max: 10, // 1 Saatte maksimum 10 hatalı şifre/login denemesi
    message: {
        success: false,
        message: "Çok fazla giriş denemesi yaptınız. Güvenliğiniz için hesabınız 1 saat kilitlendi."
    }
});