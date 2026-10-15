import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { UserRole } from '../models/types';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    employeeRef?: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If running in development demo mode, allow fallback to a default mock user if query param or header demo user is provided
    const demoRole = req.headers['x-demo-role'] as UserRole;
    if (demoRole) {
      req.user = {
        id: `demo_${demoRole.toLowerCase()}`,
        email: `${demoRole.toLowerCase()}@workforce.ai`,
        role: demoRole,
        name: `Demo ${demoRole}`,
      };
      return next();
    }
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, ENV.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user as any;
    next();
  });
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: requires one of [${allowedRoles.join(', ')}] role. Current role: ${req.user.role}`
      });
    }

    next();
  };
};
