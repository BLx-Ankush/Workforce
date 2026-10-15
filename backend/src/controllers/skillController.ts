import { Request, Response } from 'express';
import { db } from '../config/database';

export class SkillController {
  public static async getSkills(req: Request, res: Response) {
    const skills = await db.skills.find();
    const employees = await db.employees.find();

    // Enrich with verified count
    const enriched = skills.map(s => {
      const verifiedHolders = employees.filter(e => e.verifiedSkills?.includes(s.name));
      const totalHolders = employees.filter(e => (e.skills[s.name] || 0) > 0);

      return {
        ...s,
        totalHoldersCount: totalHolders.length,
        verifiedHoldersCount: verifiedHolders.length
      };
    });

    return res.json({
      count: enriched.length,
      skills: enriched
    });
  }

  public static async createSkill(req: Request, res: Response) {
    const { name, category, aliases, description } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const cleanAliases = Array.isArray(aliases) ? aliases : (aliases ? [aliases] : []);

    const newSkill = await db.skills.create({
      id: `skill_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name,
      category,
      aliases: cleanAliases,
      description: description || ''
    });

    return res.status(201).json(newSkill);
  }

  public static async updateSkill(req: Request, res: Response) {
    const { id } = req.params;
    const updates = req.body;
    const updated = await db.skills.findByIdAndUpdate(id, updates);
    if (!updated) return res.status(404).json({ error: 'Skill not found' });
    return res.json(updated);
  }
}
