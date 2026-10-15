import { apiClient } from './client';
import {
  User, Employee, Department, Skill, Project,
  OptimizationResponse, SkillEvidence, Mentorship,
  Meeting, AppNotification, AuditLog, WorkloadSummary, UserRole
} from '../types';

export const api = {
  // Auth
  quickDemoLogin: async (role: UserRole) => {
    const res = await apiClient.post('/auth/quick-demo', { role });
    return res.data as { token: string; user: User };
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data as { user: User; employee?: Employee };
  },

  // Employees & Workforce
  getEmployees: async (params?: Record<string, any>) => {
    const res = await apiClient.get('/employees', { params });
    return res.data as { count: number; employees: Employee[] };
  },
  getEmployeeById: async (id: string) => {
    const res = await apiClient.get(`/employees/${id}`);
    return res.data as {
      employee: Employee;
      activeAssignments: any[];
      skillEvidences: SkillEvidence[];
      mentorships: Mentorship[];
    };
  },
  updateAvailability: async (id: string, onLeave: boolean, capacity?: number) => {
    const res = await apiClient.patch(`/employees/${id}/availability`, {
      onLeave,
      weeklyCapacityHours: capacity
    });
    return res.data as Employee;
  },
  syncGitHub: async (id: string, username?: string) => {
    const res = await apiClient.post(`/employees/${id}/sync-github`, { username });
    return res.data;
  },

  // Departments & Skills
  getDepartments: async () => {
    const res = await apiClient.get('/departments');
    return res.data as { count: number; departments: Department[] };
  },
  getSkills: async () => {
    const res = await apiClient.get('/skills');
    return res.data as { count: number; skills: Skill[] };
  },

  // Projects & Optimization
  getProjects: async (params?: Record<string, any>) => {
    const res = await apiClient.get('/projects', { params });
    return res.data as { count: number; projects: Project[] };
  },
  getProjectById: async (id: string) => {
    const res = await apiClient.get(`/projects/${id}`);
    return res.data as {
      project: Project;
      activeAssignments: any[];
      latestRecommendation?: any;
    };
  },
  createProject: async (payload: Partial<Project>) => {
    const res = await apiClient.post('/projects', payload);
    return res.data as Project;
  },
  optimizeProject: async (projectId: string) => {
    const res = await apiClient.post(`/projects/${projectId}/optimize`);
    return res.data as OptimizationResponse;
  },
  approveTeam: async (projectId: string, assignedMembers: any[], allowBypass?: boolean) => {
    const res = await apiClient.post(`/projects/${projectId}/approve-team`, { assignedMembers, allowBypass });
    return res.data;
  },
  simulateDisruption: async (projectId: string, unavailableEmployeeId: string) => {
    const res = await apiClient.post(`/projects/${projectId}/simulate-disruption`, {
      unavailableEmployeeId
    });
    return res.data;
  },
  approveRecovery: async (projectId: string, roleId: string, newEmployeeId: string, replacedEmployeeId: string) => {
    const res = await apiClient.post(`/projects/${projectId}/approve-recovery`, {
      roleId,
      newEmployeeId,
      replacedEmployeeId
    });
    return res.data;
  },

  // Workload
  getWorkloadSummary: async () => {
    const res = await apiClient.get('/workload/summary');
    return res.data as WorkloadSummary;
  },
  getWorkloadEmployees: async (filter?: string) => {
    const res = await apiClient.get('/workload/employees', { params: { filter } });
    return res.data as { count: number; employees: Employee[] };
  },
  getWorkloadPolicies: async () => {
    const res = await apiClient.get('/workload/policies');
    return res.data;
  },
  updateWorkloadPolicies: async (policies: any) => {
    const res = await apiClient.patch('/workload/policies', policies);
    return res.data;
  },

  // Verification
  getVerificationQueue: async (status?: string) => {
    const res = await apiClient.get('/verification/queue', { params: { status } });
    return res.data as { count: number; items: SkillEvidence[] };
  },
  reviewEvidence: async (id: string, decision: 'VERIFIED' | 'REJECTED' | 'REQUEST_MORE_EVIDENCE', reviewerNotes?: string) => {
    const res = await apiClient.post(`/verification/${id}/review`, { decision, reviewerNotes });
    return res.data;
  },
  getBadges: async () => {
    const res = await apiClient.get('/verification/badges');
    return res.data as { count: number; badges: any[] };
  },

  // Mentorship
  getSkillGaps: async () => {
    const res = await apiClient.get('/mentorship/gaps');
    return res.data as any[];
  },
  getMentorshipPairings: async () => {
    const res = await apiClient.get('/mentorship/pairings');
    return res.data as Mentorship[];
  },
  getMentorshipRecommendations: async (skill: string) => {
    const res = await apiClient.get('/mentorship/recommendations', { params: { skill } });
    return res.data;
  },
  createMentorship: async (payload: { mentorId: string; menteeId: string; targetSkill: string; weeklyHours?: number }) => {
    const res = await apiClient.post('/mentorship', payload);
    return res.data as Mentorship;
  },
  updateMilestone: async (mentorshipId: string, milestoneId: string, completed: boolean) => {
    const res = await apiClient.patch(`/mentorship/${mentorshipId}/milestones/${milestoneId}`, { completed });
    return res.data;
  },

  // Meetings
  getMeetings: async (params?: Record<string, any>) => {
    const res = await apiClient.get('/meetings', { params });
    return res.data as { count: number; meetings: Meeting[] };
  },
  createMeeting: async (payload: any) => {
    const res = await apiClient.post('/meetings', payload);
    return res.data as Meeting;
  },

  // Notifications
  getNotifications: async () => {
    const res = await apiClient.get('/notifications');
    return res.data as { count: number; notifications: AppNotification[] };
  },
  markNotificationRead: async (id: string) => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  },

  // Audit Logs
  getAuditLogs: async (params?: Record<string, any>) => {
    const res = await apiClient.get('/audit-logs', { params });
    return res.data as { count: number; logs: AuditLog[] };
  }
};
