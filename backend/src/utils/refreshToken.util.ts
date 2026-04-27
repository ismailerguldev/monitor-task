import crypto from 'crypto';

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(32).toString('base64url');
};