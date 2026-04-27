import dotenv from "dotenv";
import { Pool } from "pg";
dotenv.config();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})
pool.on('connect', () => {
    console.log('PostgreSQL Veritabanına başarıyla bağlanıldı! 🚀');
});

pool.on('error', (err) => {
    console.error('Veritabanı bağlantı hatası:', err);
    process.exit(-1);
});
export default pool;