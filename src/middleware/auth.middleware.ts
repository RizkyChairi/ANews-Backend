import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface AuthRequest extends Request {
    user?: {
        id: number;
        username: string;
        email: string;
        role: string;
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        
        console.log('Auth Header:', authHeader); 
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please provide a valid token.',
            });
        }

        const token = authHeader.split(' ')[1];
        console.log('Token:', token);
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
            id: number;
            username: string;
            email: string;
            role: string;
        };

        console.log('Decoded User:', decoded); 
        
        req.user = decoded;
        next();

    } catch (error) {
        console.error('Auth Error:', error);
        
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token. Please login again.',
            });
        }
        
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.',
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const authorize = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access forbidden. You do not have permission to access this resource.',
            });
        }

        next();
    };
};