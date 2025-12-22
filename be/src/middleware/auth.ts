import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/auth';
import { JWTPayload, UserRole } from '../apicontract';
import prisma from '../lib/prisma';

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}


export async function authenticate(req: Request, res: Response, next: NextFunction) {
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

    try {
        // Validate token against the database
        const user = await prisma.users.findUnique({
            where: { id: payload.userId },
            select: { access_token: true }
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (user.access_token !== token) {
            return res.status(401).json({ message: 'Token invalid or revoked' });
        }

        // Attach user payload to request
        (req as any).user = payload;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export function authorize(allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user as JWTPayload;

        if (!user) {
            return res.status(401).json({ status: false, statusCode: 401, message: 'User not authenticated' });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({
                status: false,
                statusCode: 403,
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
            });
        }

        next();
    };
}

