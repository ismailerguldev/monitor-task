import pool from "../config/db";
import { InternalServerError } from "../models/error.model";
import { GetMeUser, InsertUser, RegisterUser } from "../models/user.model";

const findExistingUser = async (email: string) => {
    const query = 'SELECT 1 FROM users WHERE email = $1';
    try {
        const result = await pool.query(query, [email]);
        return (result.rowCount ?? 0) > 0;
    } catch (error) {
        throw new InternalServerError("Bir hata oluştu.")
    }
}
const getUserPasswordById = async (userId: string) => {
    const query = 'SELECT password_hash FROM users WHERE id = $1';
    try {
        const result = await pool.query(query, [userId]);
        return result.rows[0]?.password_hash as string | undefined;
    } catch (error) {
        throw new InternalServerError("Bir hata oluştu.")
    }
}
const getUserWithEmailForLogin = async (email: string) => {
    const query = 'SELECT password_hash, id FROM users WHERE email = $1'
    try {
        const result = await pool.query(query, [email]);
        return result.rows[0] as { password_hash: string; id: string } | null | undefined
    } catch (error) {
        console.error(error)
        throw new InternalServerError("Bir hata oluştu")
    }
}
const insertNewUser = async ({ name, last_name, email, password_hash }: InsertUser) => {
    const query = 'INSERT INTO users (name, last_name, email, password_hash) VALUES($1,$2,$3,$4)';
    try {
        const result = await pool.query(query, [name, last_name, email, password_hash])
        return (result.rowCount ?? 0) > 0
    } catch (error) {
        throw new InternalServerError("Bir hata oluştu.")
    }
}
const updateProfile = async (userId: string, name?: string, lastName?: string) => {
    const query = `
        UPDATE users 
        SET 
            name = COALESCE($1, name), 
            last_name = COALESCE($2, last_name)
        WHERE id = $3 
        RETURNING id, name, last_name, email, created_at;
    `;

    const result = await pool.query(query, [name, lastName, userId]);
    return result.rows[0];
}
const updatePassword = async (userId: string, hashedPw: string) => {
    const query = "UPDATE users SET password_hash = $1 WHERE id = $2"
    try {
        const result = await pool.query(query, [hashedPw, userId]);
        return (result.rowCount ?? 0) > 0
    } catch (error) {
        throw new InternalServerError("Bir hata oluştu.")
    }
};
const updateEmail = async (userId: string, newEmail: string) => {
    const query = "UPDATE users SET email = $1 WHERE id = $2 RETURNING id, email"
    try {
        const result = await pool.query(query, [newEmail, userId]);
        return result.rows[0];
    } catch (error) {
        throw new InternalServerError("Bir hata oluştu.")
    }
};
const getUserForProfile = async (userId: string) => {
    const query = 'SELECT name, last_name, email FROM users WHERE id = $1';
    try {
        const result = await pool.query(query, [userId]);
        return result.rows[0] as GetMeUser | null | undefined;
    } catch (error) {
        throw new InternalServerError("Bir hata oluştu.")
    }
}
export default {
    findExistingUser,
    insertNewUser,
    getUserWithEmailForLogin,
    updateProfile,
    updatePassword,
    updateEmail,
    getUserPasswordById,
    getUserForProfile
}