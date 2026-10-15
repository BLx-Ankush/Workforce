import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { ENV } from '../config/env';
import { AuthRequest } from '../middleware/auth';
import { IUser, UserRole } from '../models/types';

export class AuthController {
  public static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = bcrypt.compareSync(password, user.passwordHash);
    if (!valid && password !== 'demo123') { // Allow quick demo password
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, employeeRef: user.employeeRef },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeRef: user.employeeRef,
        avatar: user.avatar
      }
    });
  }

  public static async quickDemoLogin(req: Request, res: Response) {
    const { role } = req.body as { role: UserRole };
    const validRoles: UserRole[] = ['ADMIN', 'MANAGER', 'EMPLOYEE'];

    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Valid role is required (ADMIN, MANAGER, EMPLOYEE)' });
    }

    const user = await db.users.findOne({ role });
    if (!user) {
      return res.status(404).json({ error: `Demo user for role ${role} not found. Please seed the database.` });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, employeeRef: user.employeeRef },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeRef: user.employeeRef,
        avatar: user.avatar
      }
    });
  }

  public static async getMe(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await db.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let employeeData = null;
    if (user.employeeRef) {
      employeeData = await db.employees.findById(user.employeeRef);
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeRef: user.employeeRef,
        avatar: user.avatar
      },
      employee: employeeData
    });
  }
}
