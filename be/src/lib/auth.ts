import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../../apicontract';

// In production, these should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_456';
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

/**
 * Hash a plain text password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    // 10 salt rounds is standard
    return bcrypt.hash(password, 10);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Generate a short-lived access token
 */
export function generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

/**
 * Generate a long-lived refresh token
 */
export function generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

/**
 * Verify an access token and return the payload if valid
 */
export function verifyAccessToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
        return null;
    }
}

/**
 * Verify a refresh token and return the payload if valid
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
    } catch (error) {
        return null;
    }
}
