import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db';

interface AuthUser {
  id: number;
  email: string;
  role: 'admin' | 'user';
}

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication token required' });
    return;
  }

  try {
    const user = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as AuthUser;

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
    return;
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  next();
}; 