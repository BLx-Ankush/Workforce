import { Request, Response } from 'express';
import { db } from '../config/database';
import { OptimizerService } from '../services/optimizerService';
import { RecoveryService } from '../services/recoveryService';
import { WorkloadService } from '../services/workloadService';
import { SocketService } from '../services/socketService';
import { AuthRequest } from '../middleware/auth';

export class ProjectController {
  public static async getProjects(req: Request, res: Response) {
    const { status, department } = req.query;
    let projects = await db.projects.find();

    if (status) {
      projects = projects.filter(p => p.status === status);
    }
    if (department) {
      projects = projects.filter(p => p.departmentId === department);
    }

    return res.json({
      count: projects.length,
      projects
    });
  }

  public static async getProjectById(req: Request, res: Response) {
    const { id } = req.params;
    const project = await db.projects.findById(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Retrieve active assignments
    const assignments = await db.assignments.find({
      projectId: id,
      status: 'ACTIVE'
    });

    // Retrieve latest recommendation if any
    const recommendations = await db.recommendations.find({ projectId: id });
    const latestRecommendation = recommendations.length > 0 ? recommendations[recommendations.length - 1] : null;

    return res.json({
      project,
      activeAssignments: assignments,
      latestRecommendation
    });
  }

  public static async createProject(req: Request, res: Response) {
    const {
      title, description, departmentId, priority,
      startDate, endDate, durationWeeks, roleSlots
    } = req.body;

    if (!title || !roleSlots || roleSlots.length === 0) {
      return res.status(400).json({ error: 'Title and at least one role slot are required' });
    }

    const projectId = `proj_${Date.now()}`;
    const newProject = await db.projects.create({
      id: projectId,
      title,
      description: description || '',
      departmentId: departmentId || 'dept_eng',
      priority: priority || 'Medium',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + (durationWeeks || 4) * 7 * 86400000).toISOString().split('T')[0],
      durationWeeks: durationWeeks || 4,
      teamSize: roleSlots.length,
      roleSlots,
      status: 'PLANNING',
      assignedTeam: [],
      createdAt: new Date().toISOString()
    });

    // Audit log
    await db.auditLogs.create({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'manager',
      userName: 'Project Manager',
      userRole: 'MANAGER',
      action: 'PROJECT_CREATED',
      entity: 'PROJECT',
      entityId: projectId,
      details: `Created project '${title}' with ${roleSlots.length} required role slot(s).`
    });

    return res.status(201).json(newProject);
  }

  public static async optimizeProject(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const result = await OptimizerService.optimizeProject(id);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async validateTeam(req: Request, res: Response) {
    const { id } = req.params;
    const { assignmentsMap } = req.body; // { roleId: employeeId }

    if (!assignmentsMap) {
      return res.status(400).json({ error: 'assignmentsMap is required' });
    }

    try {
      const validation = await OptimizerService.validateProposedTeam(id, assignmentsMap);
      return res.json(validation);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async approveTeam(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { assignedMembers } = req.body; // array of { roleId, employeeId, assignedHours }

    const project = await db.projects.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (!assignedMembers || assignedMembers.length === 0) {
      return res.status(400).json({ error: 'assignedMembers array is required' });
    }

    // 1. Double-booking check
    const empIds = assignedMembers.map((m: any) => m.employeeId);
    const uniqueIds = new Set(empIds);
    if (uniqueIds.size !== empIds.length) {
      return res.status(400).json({ error: 'Duplicate employee assignment detected in proposal.' });
    }

    // 2. Clear any existing active assignments for this project to prevent collisions
    const existing = await db.assignments.find({ projectId: id, status: 'ACTIVE' });
    for (const old of existing) {
      await db.assignments.updateOne({ id: old.id }, { status: 'RELEASED' });
    }

    // 3. Persist authoritative assignments
    const finalAssignedTeam: any[] = [];

    for (const item of assignedMembers) {
      const emp = await db.employees.findById(item.employeeId);
      const slot = project.roleSlots.find(s => s.roleId === item.roleId);
      const roleName = slot ? slot.roleName : 'Specialist';
      const hours = item.assignedHours || (slot ? slot.hoursPerWeek : 20.0);

      await db.assignments.create({
        id: `asgn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        projectId: id,
        employeeId: item.employeeId,
        roleId: item.roleId,
        roleName,
        weeklyHours: hours,
        startDate: project.startDate,
        endDate: project.endDate,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      });

      finalAssignedTeam.push({
        employeeId: item.employeeId,
        employeeName: emp ? emp.name : 'Employee',
        roleId: item.roleId,
        roleName,
        assignedHours: hours
      });

      // Recalculate employee workload immediately
      await WorkloadService.recalculateEmployeeWorkload(item.employeeId);

      // Create notification for employee
      await db.notifications.create({
        id: `notif_${Date.now()}_${item.employeeId}`,
        recipientId: item.employeeId,
        type: 'ASSIGNMENT',
        title: `Assigned to Project: ${project.title}`,
        message: `You have been officially assigned as ${roleName} (${hours}h/week) on project '${project.title}'.`,
        read: false,
        metadata: { projectId: id, roleId: item.roleId },
        createdAt: new Date().toISOString()
      });
    }

    // 4. Update project status to STAFFED
    const updatedProject = await db.projects.findByIdAndUpdate(id, {
      status: 'STAFFED',
      assignedTeam: finalAssignedTeam
    });

    // 5. Audit Log
    const managerName = req.user?.name || 'Project Manager';
    await db.auditLogs.create({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: req.user?.id || 'manager',
      userName: managerName,
      userRole: 'MANAGER',
      action: 'TEAM_APPROVED',
      entity: 'PROJECT',
      entityId: id,
      details: `Manager approved team of ${finalAssignedTeam.length} members for '${project.title}'. Assignments committed.`
    });

    // 6. Broadcast socket update
    SocketService.broadcast('ASSIGNMENT_APPROVED', {
      projectId: id,
      projectTitle: project.title,
      assignedTeam: finalAssignedTeam
    });

    return res.json({
      success: true,
      message: 'Team successfully approved and assignments committed to authoritative records.',
      project: updatedProject
    });
  }

  public static async simulateDisruption(req: Request, res: Response) {
    const { id } = req.params;
    const { unavailableEmployeeId } = req.body;

    if (!unavailableEmployeeId) {
      return res.status(400).json({ error: 'unavailableEmployeeId is required' });
    }

    try {
      const result = await RecoveryService.simulateDisruption(id, unavailableEmployeeId);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async approveRecovery(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { roleId, newEmployeeId, replacedEmployeeId } = req.body;

    if (!roleId || !newEmployeeId || !replacedEmployeeId) {
      return res.status(400).json({ error: 'roleId, newEmployeeId, and replacedEmployeeId are required' });
    }

    try {
      const result = await RecoveryService.approveRecovery(
        id,
        roleId,
        newEmployeeId,
        replacedEmployeeId,
        req.user?.id
      );
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
