export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  employeeRef?: string;
  avatar?: string;
  createdAt?: string;
}

export interface IEmployee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  departmentId: string;
  jobRole: string;
  title: string;
  skills: Record<string, number>; // skillName -> proficiency 1-5
  verifiedSkills: string[];
  experienceYears: number;
  weeklyCapacityHours: number;
  allocatedHours: number;
  availableHours: number;
  utilizationRate: number; // percentage (0 - 100)
  workloadRiskScore: number; // 0 - 100
  availabilityStatus: 'AVAILABLE' | 'PARTIALLY_COMMITTED' | 'OVERLOADED' | 'ON_LEAVE';
  onLeave: boolean;
  githubUsername?: string;
  githubConnected: boolean;
  githubAvatar?: string;
  portfolioSummary?: string;
  verifiedBadges: {
    badgeName: string;
    skill: string;
    issuedDate: string;
    evidenceSource: string;
  }[];
  activeAssignmentsCount: number;
  mentorCapacityHours: number;
  updatedAt?: string;
}

export interface IDepartment {
  id: string;
  name: string;
  code: string;
  managerId?: string;
  headCount: number;
  budgetAnnual?: number;
  description: string;
}

export interface ISkill {
  id: string;
  name: string;
  category: string;
  aliases: string[];
  description: string;
  verifiedCount?: number;
}

export interface IProjectRoleSlot {
  roleId: string;
  roleName: string;
  mandatorySkills: Record<string, number>;
  preferredSkills: Record<string, number>;
  minExperienceYears: number;
  hoursPerWeek: number;
}

export interface IProject {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  startDate: string;
  endDate: string;
  durationWeeks: number;
  teamSize: number;
  roleSlots: IProjectRoleSlot[];
  status: 'PLANNING' | 'OPTIMIZED' | 'STAFFED' | 'DISRUPTED' | 'COMPLETED';
  assignedTeam?: {
    employeeId: string;
    employeeName: string;
    roleId: string;
    roleName: string;
    assignedHours: number;
  }[];
  createdAt?: string;
}

export interface IAssignment {
  id: string;
  projectId: string;
  employeeId: string;
  roleId: string;
  roleName: string;
  weeklyHours: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'PROVISIONAL' | 'RELEASED';
  createdAt?: string;
}

export interface IRecommendation {
  id: string;
  projectId: string;
  timestamp: string;
  primaryTeam: any;
  backupTeams: any[];
  solverStatus: string;
  solverTimeMs: number;
  infeasibilityReasons: any[];
  rejectedCandidates: any[];
  explanation: string;
}

export interface ISkillEvidence {
  id: string;
  employeeId: string;
  employeeName: string;
  skillName: string;
  source: 'GITHUB_COMMIT' | 'GITHUB_PR' | 'PROJECT_DELIVERABLE' | 'PEER_REVIEW';
  repositoryName: string;
  commitHash?: string;
  linesChanged?: number;
  evidenceSnippet: string;
  detectedProficiency: number;
  reviewStatus: 'DETECTED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
  reviewerId?: string;
  reviewerNotes?: string;
  badgeAwarded: boolean;
  createdAt?: string;
  verifiedAt?: string;
}

export interface IMentorship {
  id: string;
  mentorId: string;
  mentorName: string;
  menteeId: string;
  menteeName: string;
  targetSkill: string;
  weeklyHours: number;
  milestones: {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    dueDate: string;
  }[];
  status: 'PROPOSED' | 'ACTIVE' | 'COMPLETED';
  startDate: string;
  notes?: string;
}

export interface IMeeting {
  id: string;
  projectId?: string;
  projectTitle?: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  meetUrl: string;
  isDemoMeeting: boolean;
  organizerId: string;
  organizerName: string;
  attendees: {
    employeeId: string;
    name: string;
    email: string;
  }[];
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface INotification {
  id: string;
  recipientId: string; // employeeId or userId
  type: 'ASSIGNMENT' | 'EMERGENCY' | 'VERIFICATION' | 'MENTORSHIP' | 'MEETING';
  title: string;
  message: string;
  read: boolean;
  metadata?: any;
  createdAt: string;
}

export interface IAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  ipAddress?: string;
}

export interface IWorkloadPolicy {
  maxUtilizationThreshold: number; // e.g. 100%
  highRiskBlockingThreshold: number; // e.g. 90/100
  consecutiveOverloadLimitWeeks: number; // e.g. 3
  allowManagerExceptions: boolean;
  requireAuditJustification: boolean;
}
