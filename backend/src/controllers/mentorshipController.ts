import { Request, Response } from 'express';
import { db } from '../config/database';
import { MentorshipService } from '../services/mentorshipService';

export class MentorshipController {
  public static async getSkillGaps(req: Request, res: Response) {
    try {
      const gaps = await MentorshipService.analyzeWorkforceSkillGaps();
      return res.json(gaps);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async getMentorshipPairings(req: Request, res: Response) {
    const mentorships = await db.mentorships.find();
    return res.json(mentorships);
  }

  public static async getMentorshipRecommendations(req: Request, res: Response) {
    const { skill } = req.query;
    if (!skill) return res.status(400).json({ error: 'skill query parameter required' });

    try {
      const recommendation = await MentorshipService.recommendMentorship(String(skill));
      return res.json(recommendation);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async createMentorship(req: Request, res: Response) {
    const { mentorId, menteeId, targetSkill, weeklyHours } = req.body;
    if (!mentorId || !menteeId || !targetSkill) {
      return res.status(400).json({ error: 'mentorId, menteeId, and targetSkill are required' });
    }

    try {
      const created = await MentorshipService.createMentorship(
        mentorId,
        menteeId,
        targetSkill,
        weeklyHours || 4
      );
      return res.status(201).json(created);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async updateMilestone(req: Request, res: Response) {
    const { mentorshipId, milestoneId } = req.params;
    const { completed } = req.body;

    const mentorship = await db.mentorships.findById(mentorshipId);
    if (!mentorship) return res.status(404).json({ error: 'Mentorship not found' });

    const ms = mentorship.milestones.find(m => m.id === milestoneId);
    if (ms) {
      ms.completed = completed;
    }

    const updated = await db.mentorships.findByIdAndUpdate(mentorshipId, {
      milestones: mentorship.milestones
    });

    return res.json(updated);
  }
}
