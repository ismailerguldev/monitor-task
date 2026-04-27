import { UnauthorizedError } from "../models/error.model";
import { getDashboardAnalytics } from "../repositories/analytics.repository";
import { myCache } from "../utils/cache.util";

const getAnalytics = async (userId?: string) => {
    if (!userId) {
        throw new UnauthorizedError("Kullanıcı kimliği doğrulanamadı."); // Burayı kendi AppError yapınla değiştirebilirsin
    }

    // Her kullanıcıya özel bir anahtar (Key) oluşturuyoruz
    const cacheKey = `dashboard_${userId}`;

    // 1. Adım: RAM'de (Cache) bu kullanıcıya ait veri var mı?
    const cachedData = myCache.get(cacheKey);
    if (cachedData) {
        console.log(`⚡ Cache HIT: ${userId} kullanıcısının verisi RAM'den anında çekildi!`);
        return cachedData;
    }

    // 2. Adım: Cache'de yoksa (Cache Miss), veritabanına gidip o ağır SQL'i çalıştır
    console.log(`🐢 Cache MISS: ${userId} kullanıcısının verisi veritabanından hesaplanıyor...`);
    const data = await getDashboardAnalytics(userId);

    // 3. Adım: Bir dahaki sefere veritabanı yorulmasın diye veriyi RAM'e (Cache) kaydet
    myCache.set(cacheKey, data);

    return data;
}

export default { getAnalytics };