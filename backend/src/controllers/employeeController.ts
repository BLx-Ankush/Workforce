import { Request, Response } from 'express';
import { db } from '../config/database';
import { WorkloadService } from '../services/workloadService';
import { GitHubService } from '../services/githubService';

export class EmployeeController {
  public static async getEmployees(req: Request, res: Response) {
    const { department, skill, status, search, minExp, maxRisk } = req.query;

    let employees = await db.employees.find();

    if (department) {
      employees = employees.filter(e => e.departmentId === department);
    }

    if (skill) {
      const skLower = String(skill).toLowerCase();
      employees = employees.filter(e =>
        Object.keys(e.skills || {}).some(k => k.toLowerCase() === skLower)
      );
    }

    if (status) {
      employees = employees.filter(e => e.availabilityStatus === status);
    }

    if (maxRisk) {
      const limit = parseFloat(String(maxRisk));
      employees = employees.filter(e => e.workloadRiskScore <= limit);
    }

    if (minExp) {
      const exp = parseFloat(String(minExp));
      employees = employees.filter(e => e.experienceYears >= exp);
    }

    if (search) {
      const q = String(search).toLowerCase();
      employees = employees.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        Object.keys(e.skills || {}).some(k => k.toLowerCase().includes(q))
      );
    }

    return res.json({
      count: employees.length,
      employees
    });
  }

  public static async getEmployeeById(req: Request, res: Response) {
    const { id } = req.params;
    const employee = await db.employees.findById(id);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Retrieve active assignments
    const assignments = await db.assignments.find({
      employeeId: id,
      status: 'ACTIVE'
    });

    // Retrieve verified evidence
    const evidences = await db.skillEvidence.find({
      employeeId: id
    });

    // Retrieve mentorships
    const mentorships = await db.mentorships.find(
      m => m.menteeId === id || m.mentorId === id
    );

    return res.json({
      employee,
      activeAssignments: assignments,
      skillEvidences: evidences,
      mentorships
    });
  }

  public static async createEmployee(req: Request, res: Response) {
    const data = req.body;
    if (!data.name || !data.email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const employeeId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newEmp = await db.employees.create({
      id: `emp_${Date.now()}`,
      employeeId,
      name: data.name,
      email: data.email,
      departmentId: data.departmentId || 'dept_eng',
      jobRole: data.jobRole || 'Software Engineer',
      title: data.title || 'Software Engineer',
      skills: data.skills || {},
      verifiedSkills: data.verifiedSkills || [],
      experienceYears: data.experienceYears || 2.0,
      weeklyCapacityHours: data.weeklyCapacityHours || 40.0,
      allocatedHours: 0,
      availableHours: data.weeklyCapacityHours || 40.0,
      utilizationRate: 0,
      workloadRiskScore: 10,
      availabilityStatus: 'AVAILABLE',
      onLeave: false,
      githubConnected: false,
      verifiedBadges: [],
      activeAssignmentsCount: 0,
      mentorCapacityHours: 4
    });

    return res.status(201).json(newEmp);
  }

  public static async updateEmployee(req: Request, res: Response) {
    const { id } = req.params;
    const updates = req.body;

    const existing = await db.employees.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const updated = await db.employees.findByIdAndUpdate(id, updates);
    await WorkloadService.recalculateEmployeeWorkload(id);

    return res.json(updated);
  }

  public static async updateAvailability(req: Request, res: Response) {
    const { id } = req.params;
    const { onLeave, weeklyCapacityHours } = req.body;

    const existing = await db.employees.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const updates: any = {};
    if (onLeave !== undefined) updates.onLeave = onLeave;
    if (weeklyCapacityHours !== undefined) updates.weeklyCapacityHours = weeklyCapacityHours;

    await db.employees.findByIdAndUpdate(id, updates);
    const refreshed = await WorkloadService.recalculateEmployeeWorkload(id);

    return res.json(refreshed);
  }

  public static async syncGitHub(req: Request, res: Response) {
    const { id } = req.params;
    const { username } = req.body;

    try {
      if (username) {
        await GitHubService.connectGitHub(id, username);
      }
      const result = await GitHubService.syncContributions(id, true);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
