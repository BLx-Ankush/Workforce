import { Request, Response } from 'express';
import { db } from '../config/database';
import { SocketService } from '../services/socketService';
import { AuthRequest } from '../middleware/auth';
import { IMeeting } from '../models/types';

export class MeetingController {
  public static async getMeetings(req: Request, res: Response) {
    const { projectId, employeeId } = req.query;
    let meetings = await db.meetings.find();

    if (projectId) {
      meetings = meetings.filter(m => m.projectId === projectId);
    }
    if (employeeId) {
      meetings = meetings.filter(m => m.attendees.some(a => a.employeeId === employeeId));
    }

    return res.json({
      count: meetings.length,
      meetings
    });
  }

  public static async createMeeting(req: AuthRequest, res: Response) {
    const { projectId, title, scheduledAt, durationMinutes, attendeeIds } = req.body;

    if (!title || !scheduledAt) {
      return res.status(400).json({ error: 'Title and scheduledAt are required' });
    }

    let projectTitle = '';
    if (projectId) {
      const proj = await db.projects.findById(projectId);
      if (proj) projectTitle = proj.title;
    }

    const employees = await db.employees.find();
    const attendees = (attendeeIds || []).map((id: string) => {
      const emp = employees.find(e => e.id === id);
      return {
        employeeId: id,
        name: emp?.name || 'Team Member',
        email: emp?.email || 'member@workforce.ai'
      };
    });

    // Generate meeting URL (Google Meet format / Demo WebRTC room)
    const roomId = Math.random().toString(36).substring(2, 5) + '-' +
                   Math.random().toString(36).substring(2, 6) + '-' +
                   Math.random().toString(36).substring(2, 5);
    const meetUrl = `https://meet.google.com/${roomId}`;

    const newMeeting: IMeeting = {
      id: `meet_${Date.now()}`,
      projectId,
      projectTitle,
      title,
      scheduledAt,
      durationMinutes: durationMinutes || 45,
      meetUrl,
      isDemoMeeting: true,
      organizerId: req.user?.id || 'manager_1',
      organizerName: req.user?.name || 'Project Manager',
      attendees,
      status: 'SCHEDULED'
    };

    await db.meetings.create(newMeeting);

    // Notify all attendees
    for (const attendee of attendees) {
      await db.notifications.create({
        id: `notif_${Date.now()}_${attendee.employeeId}`,
        recipientId: attendee.employeeId,
        type: 'MEETING',
        title: `Project Meeting: ${title}`,
        message: `Scheduled for ${new Date(scheduledAt).toLocaleString()}. Click to join Google Meet room.`,
        read: false,
        metadata: { meetUrl, meetingId: newMeeting.id },
        createdAt: new Date().toISOString()
      });
    }

    SocketService.broadcast('MEETING_SCHEDULED', {
      meeting: newMeeting
    });

    return res.status(201).json(newMeeting);
  }
}
