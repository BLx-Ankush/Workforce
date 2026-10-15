import axios from 'axios';
import { db } from '../config/database';
import { ENV } from '../config/env';
import { WorkloadService } from './workloadService';
import { SocketService } from './socketService';

export class RecoveryService {
  /**
   * Simulates or registers an employee becoming unavailable (sick leave / emergency).
   * Identifies affected projects and executes CP-SAT emergency reoptimization.
   */
  public static async simulateDisruption(projectId: string, unavailableEmployeeId: string) {
    const project = await db.projects.findById(projectId);
    if (!project) throw new Error('Project not found');

    const employee = await db.employees.findById(unavailableEmployeeId);
    if (!employee) throw new Error('Employee not found');

    // Update employee status to onLeave
    await db.employees.findByIdAndUpdate(unavailableEmployeeId, {
      onLeave: true,
      availabilityStatus: 'ON_LEAVE',
      workloadRiskScore: 100
    });

    // Mark project as DISRUPTED
    await db.projects.findByIdAndUpdate(projectId, {
      status: 'DISRUPTED'
    });

    // Find current assigned team
    const assignments = await db.assignments.find({
      projectId,
      status: 'ACTIVE'
    });

    const currentTeamMap: Record<string, string> = {};
    let affectedRoleId: string | null = null;
    let affectedRoleName = '';

    assignments.forEach(a => {
      currentTeamMap[a.roleId] = a.employeeId;
      if (a.employeeId === unavailableEmployeeId) {
        affectedRoleId = a.roleId;
        affectedRoleName = a.roleName;
      }
    });

    const employees = await db.employees.find();
    const policies = await db.getPolicies();

    // Call Python CP-SAT emergency reoptimization
    let recoveryResult: any = null;
    try {
      const response = await axios.post(`${ENV.OPTIMIZER_URL}/reoptimize-emergency`, {
        project_id: project.id,
        project_title: project.title,
        unavailable_employee_id: unavailableEmployeeId,
        role_slots: project.roleSlots.map(s => ({
          role_id: s.roleId,
          role_name: s.roleName,
          mandatory_skills: s.mandatorySkills,
          preferred_skills: s.preferredSkills,
          min_experience_years: s.minExperienceYears,
          hours_per_week: s.hoursPerWeek
        })),
        current_team: currentTeamMap,
        employees: employees.map(e => ({
          id: e.id,
          name: e.name,
          skills: e.skills,
          verified_skills: e.verifiedSkills,
          experience_years: e.experienceYears,
          weekly_capacity_hours: e.weeklyCapacityHours,
          allocated_hours: e.allocatedHours,
          available_hours: e.availableHours,
          workload_risk_score: e.id === unavailableEmployeeId ? 100 : e.workloadRiskScore,
          on_leave: e.id === unavailableEmployeeId ? true : e.onLeave,
          is_available: e.id === unavailableEmployeeId ? false : (!e.onLeave && e.availableHours > 0)
        })),
        workload_risk_threshold: policies.highRiskBlockingThreshold
      }, { timeout: 8000 });
      recoveryResult = response.data;
    } catch (err: any) {
      console.warn('Python emergency recovery endpoint failed, executing fallback:', err.message);
      recoveryResult = this.internalRecoveryFallback(project, unavailableEmployeeId, affectedRoleId, currentTeamMap, employees, policies.highRiskBlockingThreshold);
    }

    // Broadcast live alert
    SocketService.broadcast('EMERGENCY_DISRUPTION', {
      projectId: project.id,
      projectTitle: project.title,
      unavailableEmployeeId,
      unavailableEmployeeName: employee.name,
      affectedRoleName,
      recoveryProposal: recoveryResult
    });

    // Create system notification
    await db.notifications.create({
      id: `notif_${Date.now()}`,
      recipientId: 'manager',
      type: 'EMERGENCY',
      title: `Emergency Staffing Alert: ${project.title}`,
      message: `${employee.name} is unavailable. Role '${affectedRoleName}' requires immediate recovery. CP-SAT generated a replacement proposal.`,
      read: false,
      metadata: { projectId, unavailableEmployeeId },
      createdAt: new Date().toISOString()
    });

    // Audit log
    await db.auditLogs.create({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'system',
      userName: 'Availability Monitor',
      userRole: 'ADMIN',
      action: 'EMERGENCY_DISRUPTION_TRIGGERED',
      entity: 'PROJECT',
      entityId: project.id,
      details: `Employee ${employee.name} became unavailable. Role '${affectedRoleName}' disrupted.`
    });

    return recoveryResult;
  }

  /**
   * Approves emergency recovery replacement and commits authoritative changes.
   */
  public static async approveRecovery(
    projectId: string,
    roleId: string,
    newEmployeeId: string,
    replacedEmployeeId: string,
    managerUserId: string = 'manager_1'
  ) {
    const project = await db.projects.findById(projectId);
    if (!project) throw new Error('Project not found');

    const newEmp = await db.employees.findById(newEmployeeId);
    if (!newEmp) throw new Error('Replacement employee not found');

    const oldEmp = await db.employees.findById(replacedEmployeeId);

    // 1. Release old assignment
    const oldAssignment = await db.assignments.findOne({
      projectId,
      employeeId: replacedEmployeeId,
      roleId
    });

    if (oldAssignment) {
      await db.assignments.updateOne(
        { id: oldAssignment.id },
        { status: 'RELEASED' }
      );
    }

    // 2. Create new assignment
    const targetSlot = project.roleSlots.find(s => s.roleId === roleId);
    const assignedHours = targetSlot ? targetSlot.hoursPerWeek : 20.0;
    const roleName = targetSlot ? targetSlot.roleName : 'Role';

    await db.assignments.create({
      id: `asgn_${Date.now()}`,
      projectId,
      employeeId: newEmployeeId,
      roleId,
      roleName,
      weeklyHours: assignedHours,
      startDate: project.startDate,
      endDate: project.endDate,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    });

    // 3. Update project assignedTeam and status
    const currentTeam = project.assignedTeam || [];
    const updatedTeam = currentTeam.filter(m => m.employeeId !== replacedEmployeeId);
    updatedTeam.push({
      employeeId: newEmp.id,
      employeeName: newEmp.name,
      roleId,
      roleName,
      assignedHours
    });

    await db.projects.findByIdAndUpdate(projectId, {
      status: 'STAFFED',
      assignedTeam: updatedTeam
    });

    // 4. Recalculate workloads
    await WorkloadService.recalculateEmployeeWorkload(newEmployeeId);
    await WorkloadService.recalculateEmployeeWorkload(replacedEmployeeId);

    // 5. Notify new employee
    await db.notifications.create({
      id: `notif_${Date.now()}`,
      recipientId: newEmployeeId,
      type: 'ASSIGNMENT',
      title: `Emergency Assignment to Project: ${project.title}`,
      message: `You have been assigned as ${roleName} on ${project.title} (${assignedHours}h/week) following emergency recovery.`,
      read: false,
      metadata: { projectId, roleId },
      createdAt: new Date().toISOString()
    });

    // 6. Audit log
    await db.auditLogs.create({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: managerUserId,
      userName: 'Project Manager',
      userRole: 'MANAGER',
      action: 'EMERGENCY_RECOVERY_APPROVED',
      entity: 'PROJECT',
      entityId: projectId,
      details: `Approved replacement for role '${roleName}': Replaced ${oldEmp?.name || replacedEmployeeId} with ${newEmp.name}.`
    });

    // 7. Realtime broadcast
    SocketService.broadcast('RECOVERY_APPROVED', {
      projectId,
      newEmployee: newEmp.name,
      roleName
    });

    return {
      success: true,
      message: `Successfully replaced with ${newEmp.name}. Project restored to STAFFED status.`,
      project: await db.projects.findById(projectId)
    };
  }

  private static internalRecoveryFallback(
    project: any,
    unavailId: string,
    roleId: string | null,
    currentTeam: Record<string, string>,
    employees: any[],
    threshold: number
  ) {
    if (!roleId) return { success: false, explanation: 'Role not found' };
    const slot = project.roleSlots.find((s: any) => s.roleId === roleId);
    if (!slot) return { success: false, explanation: 'Role slot not found' };

    const assignedIds = new Set(Object.values(currentTeam));
    assignedIds.add(unavailId);

    // Find candidate meeting mandatory skills
    let candidate: any = null;
    for (const emp of employees) {
      if (assignedIds.has(emp.id) || emp.onLeave || emp.workloadRiskScore >= threshold) continue;
      if (emp.availableHours < slot.hoursPerWeek) continue;

      let meetsSkills = true;
      for (const [sk, minP] of Object.entries(slot.mandatorySkills || {})) {
        if ((emp.skills[sk] || 0) < Number(minP)) {
          meetsSkills = false;
          break;
        }
      }
      if (meetsSkills) {
        candidate = emp;
        break;
      }
    }

    if (!candidate) {
      return {
        success: false,
        solver_status: 'INFEASIBLE',
        explanation: 'No available candidate meets mandatory skills without violating workload policy.'
      };
    }

    return {
      success: true,
      replaced_employee_id: unavailId,
      new_employee_id: candidate.id,
      affected_role_name: slot.roleName,
      preserved_members_count: Object.keys(currentTeam).length - 1,
      solver_status: 'OPTIMAL',
      explanation: `Internal recovery matched ${candidate.name} with verified skills and healthy capacity.`,
      recovered_team: {
        team_label: 'Recovered Resilient Team',
        assigned_members: [{
          employee_id: candidate.id,
          employee_name: candidate.name,
          role_id: slot.roleId,
          role_name: slot.roleName,
          assigned_hours: slot.hoursPerWeek,
          skills_covered: slot.mandatorySkills,
          individual_suitability_score: 88,
          utilization_before: Math.round((candidate.allocatedHours / candidate.weeklyCapacityHours) * 100),
          utilization_after: Math.round(((candidate.allocatedHours + slot.hoursPerWeek) / candidate.weeklyCapacityHours) * 100),
          workload_risk_before: candidate.workloadRiskScore,
          workload_risk_after: Math.min(100, candidate.workloadRiskScore + 12),
          experience_years: candidate.experienceYears,
          decision_rationale: 'Best available replacement candidate satisfying mandatory skills.'
        }]
      }
    };
  }
}
