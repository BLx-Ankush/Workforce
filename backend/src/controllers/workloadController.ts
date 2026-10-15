import { Request, Response } from 'express';
import { db } from '../config/database';
import { WorkloadService } from '../services/workloadService';

export class WorkloadController {
  public static async getSummary(req: Request, res: Response) {
    try {
      const summary = await WorkloadService.getWorkloadIntelligenceSummary();
      return res.json(summary);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async getWorkloadEmployees(req: Request, res: Response) {
    const { filter } = req.query; // 'overloaded' | 'underutilized' | 'available'
    const employees = await db.employees.find();
    const policies = await db.getPolicies();

    let filtered = employees;

    if (filter === 'overloaded') {
      filtered = employees.filter(e => e.workloadRiskScore >= policies.highRiskBlockingThreshold || e.utilizationRate > 100);
    } else if (filter === 'underutilized') {
      filtered = employees.filter(e => e.utilizationRate < 40 && !e.onLeave);
    } else if (filter === 'available') {
      filtered = employees.filter(e => e.availableHours >= 15 && !e.onLeave && e.workloadRiskScore < 75);
    }

    return res.json({
      count: filtered.length,
      employees: filtered
    });
  }

  public static async getPolicies(req: Request, res: Response) {
    const policies = await db.getPolicies();
    return res.json(policies);
  }

  public static async updatePolicies(req: Request, res: Response) {
    const updates = req.body;
    const policies = await db.updatePolicies(updates);

    // Audit log
    await db.auditLogs.create({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'admin',
      userName: 'Administrator',
      userRole: 'ADMIN',
      action: 'WORKLOAD_POLICIES_UPDATED',
      entity: 'POLICY',
      details: `Updated workload safety policies: blocking threshold set to ${policies.highRiskBlockingThreshold}%.`
    });

    return res.json(policies);
  }

  public static async recalculateAll(req: Request, res: Response) {
    await WorkloadService.recalculateAllWorkloads();
    return res.json({ success: true, message: 'All workforce workloads recalculated successfully.' });
  }
}
