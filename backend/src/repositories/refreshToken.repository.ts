import pool from "../config/db";
import { InternalServerError } from "../models/error.model";

const insertNewRefreshToken = async (userId: string, refreshToken: string) => {
    const queryRevoke = 'UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1';
    const queryInsert = 'INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)';

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        await client.query(queryRevoke, [userId]);
        const result = await client.query(queryInsert, [userId, refreshToken]);
        await client.query('COMMIT');
        return (result.rowCount ?? 0) > 0;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        throw new InternalServerError("Bir hata oluştu.");
    } finally {
        client.release();
    }
}
const revokeAllRefreshTokensForUser = async (userId: string) => {
    const query = 'UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1';
    try {
        await pool.query(query, [userId]);
    } catch (error) {
        throw new InternalServerError("Bir hata oluştu.");
    }
}
const getRefreshTokenData = async (refreshToken: string) => {
    const query = 'SELECT token, (is_revoked OR expires_at < NOW()) AS is_expired, user_id FROM refresh_tokens WHERE token = $1';
    try {
        const result = await pool.query(query, [refreshToken]);
        if (result.rowCount === 0) return null;
        return result.rows[0] as { token: string; is_expired: boolean; user_id: string };
    }
    catch (error) {
        throw new InternalServerError("Bir hata oluştu.");
    }
}
export default {
    insertNewRefreshToken,
    getRefreshTokenData,
    revokeAllRefreshTokensForUser
}