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

    const allCompleted = mentorship.milestones.every(m => m.completed);
    const newStatus = allCompleted ? 'COMPLETED' : 'ACTIVE';

    const updated = await db.mentorships.findByIdAndUpdate(mentorshipId, {
      milestones: mentorship.milestones,
      status: newStatus
    });

    if (allCompleted) {
      const mentee = await db.employees.findById(mentorship.menteeId);
      if (mentee) {
        const curSkills = { ...mentee.skills };
        const oldProf = curSkills[mentorship.targetSkill] || 2;
        const newProf = Math.min(5, oldProf + 1);
        curSkills[mentorship.targetSkill] = newProf;

        const badges = mentee.verifiedBadges || [];
        const badgeTitle = `Practical Certificate: ${mentorship.targetSkill} Mastery`;
        if (!badges.some(b => b.badgeName === badgeTitle)) {
          badges.push({
            badgeName: badgeTitle,
            skill: mentorship.targetSkill,
            issuedDate: new Date().toISOString().split('T')[0],
            evidenceSource: `Supervised Mentorship Track with ${mentorship.mentorName}`
          });
        }

        await db.employees.findByIdAndUpdate(mentee.id, {
          skills: curSkills,
          verifiedBadges: badges
        });

        await db.notifications.create({
          id: `notif_${Date.now()}`,
          recipientId: mentee.id,
          type: 'MENTORSHIP',
          title: `Mentorship Track Completed: ${mentorship.targetSkill}!`,
          message: `Congratulations! You completed all practical deliverables under ${mentorship.mentorName}. Your ${mentorship.targetSkill} proficiency increased to ${newProf}/5 and a practical certificate has been added to your verified portfolio.`,
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    return res.json(updated);
  }
}
