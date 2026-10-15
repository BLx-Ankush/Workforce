import { db } from '../config/database';
import { IEmployee, IAssignment, IWorkloadPolicy } from '../models/types';

export class WorkloadService {
  /**
   * Transparent Workload Risk Index Calculation (0 - 100):
   * - Utilization factor:
   *     <= 75%: Low risk (0 - 30)
   *     75% - 95%: Moderate risk (30 - 70)
   *     95% - 110%: High risk (70 - 89)
   *     > 110%: Critical overload (90 - 100) -> Triggers automatic assignment block
   * - Project context switching factor: +5 pts per extra simultaneous project (> 2)
   * - Leave / unavailability factor: flagged
   */
  public static calculateWorkloadRisk(
    allocatedHours: number,
    weeklyCapacity: number,
    activeAssignmentsCount: number,
    onLeave: boolean
  ): { riskScore: number; utilization: number; status: IEmployee['availabilityStatus'] } {
    const capacity = Math.max(1, weeklyCapacity);
    const utilization = Math.round((allocatedHours / capacity) * 100);

    if (onLeave) {
      return { riskScore: 100, utilization: 0, status: 'ON_LEAVE' };
    }

    let baseRisk = 0;
    if (utilization <= 50) {
      baseRisk = (utilization / 50) * 20; // 0 - 20
    } else if (utilization <= 80) {
      baseRisk = 20 + ((utilization - 50) / 30) * 35; // 20 - 55
    } else if (utilization <= 100) {
      baseRisk = 55 + ((utilization - 80) / 20) * 30; // 55 - 85
    } else {
      // Over capacity
      baseRisk = 85 + Math.min(15, ((utilization - 100) / 20) * 15); // 85 - 100
    }

    // Context switching penalty
    const extraProjects = Math.max(0, activeAssignmentsCount - 2);
    const contextPenalty = Math.min(15, extraProjects * 5);

    const totalRisk = Math.min(100, Math.round(baseRisk + contextPenalty));

    let status: IEmployee['availabilityStatus'] = 'AVAILABLE';
    if (totalRisk >= 90 || utilization >= 100) {
      status = 'OVERLOADED';
    } else if (utilization >= 60) {
      status = 'PARTIALLY_COMMITTED';
    } else {
      status = 'AVAILABLE';
    }

    return {
      riskScore: totalRisk,
      utilization,
      status
    };
  }

  /**
   * Recalculates and updates workload metrics for an employee based on live active assignments.
   */
  public static async recalculateEmployeeWorkload(employeeId: string): Promise<IEmployee | null> {
    const emp = await db.employees.findById(employeeId);
    if (!emp) return null;

    const activeAssignments = await db.assignments.find({
      employeeId,
      status: 'ACTIVE'
    });

    const allocatedHours = activeAssignments.reduce((acc, curr) => acc + (curr.weeklyHours || 0), 0);
    const availableHours = Math.max(0, emp.weeklyCapacityHours - allocatedHours);

    const { riskScore, utilization, status } = this.calculateWorkloadRisk(
      allocatedHours,
      emp.weeklyCapacityHours,
      activeAssignments.length,
      emp.onLeave
    );

    const updated = await db.employees.findByIdAndUpdate(employeeId, {
      allocatedHours,
      availableHours,
      utilizationRate: utilization,
      workloadRiskScore: riskScore,
      availabilityStatus: status,
      activeAssignmentsCount: activeAssignments.length,
      updatedAt: new Date().toISOString()
    });

    return updated;
  }

  /**
   * Recalculates workloads for all employees in the workforce.
   */
  public static async recalculateAllWorkloads(): Promise<void> {
    const employees = await db.employees.find();
    for (const emp of employees) {
      await this.recalculateEmployeeWorkload(emp.id);
    }
  }

  /**
   * Returns workforce workload distribution analytics.
   */
  public static async getWorkloadIntelligenceSummary() {
    const employees = await db.employees.find();
    const policies = await db.getPolicies();

    let overloaded = 0;
    let underutilized = 0;
    let availableCapacityEmployees = 0;
    let totalCapacityHours = 0;
    let totalAllocatedHours = 0;

    employees.forEach(emp => {
      totalCapacityHours += emp.weeklyCapacityHours;
      totalAllocatedHours += emp.allocatedHours;

      if (emp.workloadRiskScore >= policies.highRiskBlockingThreshold || emp.utilizationRate > 100) {
        overloaded++;
      } else if (emp.utilizationRate < 40 && !emp.onLeave) {
        underutilized++;
      }

      if (emp.availableHours >= 15 && !emp.onLeave && emp.workloadRiskScore < 75) {
        availableCapacityEmployees++;
      }
    });

    const avgUtilization = employees.length > 0
      ? Math.round((totalAllocatedHours / Math.max(1, totalCapacityHours)) * 100)
      : 0;

    return {
      totalEmployees: employees.length,
      overloadedCount: overloaded,
      underutilizedCount: underutilized,
      availableCapacityCount: availableCapacityEmployees,
      totalCapacityHours,
      totalAllocatedHours,
      remainingCapacityHours: Math.max(0, totalCapacityHours - totalAllocatedHours),
      averageUtilizationRate: avgUtilization,
      blockingThreshold: policies.highRiskBlockingThreshold,
    };
  }
}
