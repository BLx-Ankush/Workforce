import { describe, it, expect, beforeAll } from 'vitest';
import { WorkloadService } from '../src/services/workloadService';
import { db } from '../src/config/database';
import { seedDatabase } from '../src/scripts/seed';

describe('Workforce Intelligence Backend Engine', () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  it('calculates fatigue-aware workload risk correctly', () => {
    // Normal healthy load
    const normal = WorkloadService.calculateWorkloadRisk(15, 40, 1, false);
    expect(normal.utilization).toBe(38);
    expect(normal.riskScore).toBeLessThan(45);
    expect(normal.status).toBe('AVAILABLE');

    // Overloaded employee
    const overloaded = WorkloadService.calculateWorkloadRisk(42, 40, 3, false);
    expect(overloaded.utilization).toBe(105);
    expect(overloaded.riskScore).toBeGreaterThanOrEqual(90);
    expect(overloaded.status).toBe('OVERLOADED');

    // On leave
    const onLeave = WorkloadService.calculateWorkloadRisk(0, 40, 0, true);
    expect(onLeave.status).toBe('ON_LEAVE');
    expect(onLeave.riskScore).toBe(100);
  });

  it('identifies workforce capacity statistics from seeded database', async () => {
    const summary = await WorkloadService.getWorkloadIntelligenceSummary();
    expect(summary.totalEmployees).toBe(100);
    expect(summary.overloadedCount).toBeGreaterThan(0);
    expect(summary.underutilizedCount).toBeGreaterThan(0);
    expect(summary.availableCapacityCount).toBeGreaterThan(0);
    expect(summary.blockingThreshold).toBe(90.0);
  });

  it('verifies seeded key personas', async () => {
    const rahul = await db.employees.findById('emp_rahul');
    expect(rahul).not.toBeNull();
    expect(rahul?.skills['AWS']).toBe(4);
    expect(rahul?.verifiedSkills).toContain('AWS');

    const arjun = await db.employees.findById('emp_arjun');
    expect(arjun).not.toBeNull();
    expect(arjun?.workloadRiskScore).toBeGreaterThanOrEqual(90); // Overloaded
  });
});
