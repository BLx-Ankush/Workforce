import { Request, Response } from 'express';
import { db } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export class NotificationController {
  public static async getNotifications(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const employeeRef = req.user?.employeeRef;
    const role = req.user?.role;

    let notifs = await db.notifications.find();

    if (role === 'MANAGER') {
      notifs = notifs.filter(n => n.recipientId === 'manager' || n.recipientId === userId);
    } else if (role === 'ADMIN') {
      // Admins can see all or admin-targeted
      notifs = notifs.filter(n => n.recipientId === 'admin' || n.recipientId === 'manager' || n.recipientId === userId);
    } else {
      // Employee
      notifs = notifs.filter(n => n.recipientId === employeeRef || n.recipientId === userId);
    }

    // Sort descending by date
    notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({
      count: notifs.length,
      notifications: notifs
    });
  }

  public static async markRead(req: Request, res: Response) {
    const { id } = req.params;
    await db.notifications.updateOne({ id }, { read: true });
    return res.json({ success: true });
  }

  public static async markAllRead(req: AuthRequest, res: Response) {
    const notifs = await db.notifications.find();
    for (const n of notifs) {
      await db.notifications.updateOne({ id: n.id }, { read: true });
    }
    return res.json({ success: true });
  }
}

export class AuditController {
  public static async getAuditLogs(req: Request, res: Response) {
    const { entity, action, limit } = req.query;
    let logs = await db.auditLogs.find();

    if (entity) {
      logs = logs.filter(l => l.entity === entity);
    }
    if (action) {
      logs = logs.filter(l => l.action === action);
    }

    // Sort newest first
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const maxLogs = limit ? parseInt(String(limit), 10) : 50;

    return res.json({
      count: logs.length,
      logs: logs.slice(0, maxLogs)
    });
  }
}
