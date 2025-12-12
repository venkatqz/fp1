import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/auth';
import { JWTPayload, UserRole } from '../../apicontract';

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

/**
 * Middleware to verify JWT Access Token
 * Checks Authorization header for "Bearer <token>"
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Attach user payload to request
    (req as any).user = payload;
    next();
}

/**
 * Middleware to authorize specific roles
 * Must be used AFTER authenticate middleware
 */
export function authorize(...roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user as JWTPayload;

        if (!user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!roles.includes(user.role)) {
            return res.status(403).json({
                message: `Forbidden: Requires one of roles [${roles.join(', ')}]`
            });
        }

        next();
    };
}
