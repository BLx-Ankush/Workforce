import { Request, Response } from 'express';
import { db } from '../config/database';

export class DepartmentController {
  public static async getDepartments(req: Request, res: Response) {
    const departments = await db.departments.find();
    const employees = await db.employees.find();

    // Enrich with live headcounts and average utilization
    const enriched = departments.map(d => {
      const deptEmployees = employees.filter(e => e.departmentId === d.id);
      const totalUtil = deptEmployees.reduce((sum, e) => sum + (e.utilizationRate || 0), 0);
      const avgUtil = deptEmployees.length > 0 ? Math.round(totalUtil / deptEmployees.length) : 0;

      return {
        ...d,
        headCount: deptEmployees.length,
        averageUtilization: avgUtil
      };
    });

    return res.json({
      count: enriched.length,
      departments: enriched
    });
  }

  public static async createDepartment(req: Request, res: Response) {
    const { name, code, description, budgetAnnual } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    const dept = await db.departments.create({
      id: `dept_${code.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name,
      code: code.toUpperCase(),
      description: description || '',
      headCount: 0,
      budgetAnnual: budgetAnnual || 500000
    });

    return res.status(201).json(dept);
  }

  public static async updateDepartment(req: Request, res: Response) {
    const { id } = req.params;
    const updates = req.body;
    const updated = await db.departments.findByIdAndUpdate(id, updates);
    if (!updated) return res.status(404).json({ error: 'Department not found' });
    return res.json(updated);
  }
}
