import jwt from 'jsonwebtoken';
import { InternalServerError, UnauthorizedError } from '../models/error.model';

interface JWTPayload {
  user_id: string;
  iat?: number;
  exp?: number;
}

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new InternalServerError('JWT_SECRET environment variable is not set');
  }

  const expiresIn = '15m'; // 15 dakika

  const payload: JWTPayload = {
    user_id: userId,
  };

  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new InternalServerError('JWT_SECRET environment variable is not set');
  }

  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};