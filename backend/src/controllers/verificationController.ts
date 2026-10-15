import { Request, Response } from 'express';
import { db } from '../config/database';
import { GitHubService } from '../services/githubService';
import { AuthRequest } from '../middleware/auth';

export class VerificationController {
  public static async getVerificationQueue(req: Request, res: Response) {
    const { status } = req.query;
    let items = await db.skillEvidence.find();

    if (status) {
      items = items.filter(i => i.reviewStatus === status);
    }

    return res.json({
      count: items.length,
      items
    });
  }

  public static async reviewEvidence(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { decision, reviewerNotes } = req.body; // 'VERIFIED' | 'REJECTED' | 'REQUEST_MORE_EVIDENCE'
    const validDecisions = ['VERIFIED', 'REJECTED', 'REQUEST_MORE_EVIDENCE'];

    if (!decision || !validDecisions.includes(decision)) {
      return res.status(400).json({ error: `decision must be one of: ${validDecisions.join(', ')}` });
    }

    const reviewerId = req.user?.id || 'admin_1';

    try {
      const result = await GitHubService.reviewEvidence(
        id,
        decision,
        reviewerId,
        reviewerNotes || 'Reviewed and verified against repository contributions.'
      );
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async getBadges(req: Request, res: Response) {
    const employees = await db.employees.find();
    const badges: any[] = [];

    employees.forEach(e => {
      (e.verifiedBadges || []).forEach(b => {
        badges.push({
          ...b,
          employeeId: e.id,
          employeeName: e.name,
          employeeAvatar: e.githubAvatar
        });
      });
    });

    return res.json({
      count: badges.length,
      badges
    });
  }
}
