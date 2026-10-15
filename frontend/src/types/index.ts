export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeRef?: string;
  avatar?: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  departmentId: string;
  jobRole: string;
  title: string;
  skills: Record<string, number>;
  verifiedSkills: string[];
  experienceYears: number;
  weeklyCapacityHours: number;
  allocatedHours: number;
  availableHours: number;
  utilizationRate: number;
  workloadRiskScore: number;
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
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headCount: number;
  budgetAnnual?: number;
  description: string;
  averageUtilization?: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  aliases: string[];
  description: string;
  totalHoldersCount?: number;
  verifiedHoldersCount?: number;
}

export interface ProjectRoleSlot {
  roleId: string;
  roleName: string;
  mandatorySkills: Record<string, number>;
  preferredSkills: Record<string, number>;
  minExperienceYears: number;
  hoursPerWeek: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  startDate: string;
  endDate: string;
  durationWeeks: number;
  teamSize: number;
  roleSlots: ProjectRoleSlot[];
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

export interface AssignedMember {
  employee_id: string;
  employee_name: string;
  role_id: string;
  role_name: string;
  assigned_hours: number;
  skills_covered: Record<string, number>;
  verified_skills_used: string[];
  individual_suitability_score: number;
  utilization_before: number;
  utilization_after: number;
  workload_risk_before: number;
  workload_risk_after: number;
  experience_years: number;
  decision_rationale: string;
}

export interface TeamSolution {
  team_label: string;
  team_type: string;
  assigned_members: AssignedMember[];
  total_score: number;
  mandatory_skills_satisfied: boolean;
  preferred_skills_coverage: number;
  missing_preferred_skills: string[];
  solver_status: string;
  objective_value: number;
  explanation: string;
}

export interface RejectedCandidate {
  employee_id: string;
  employee_name: string;
  role_name: string;
  reason_code: string;
  explanation: string;
  suitability_score: number;
}

export interface InfeasibilityReason {
  role_id: string;
  role_name: string;
  constraint_type: string;
  description: string;
  suggested_action: string;
}

export interface OptimizationResponse {
  success: boolean;
  project_id: string;
  project_title: string;
  solver_status: string;
  solver_time_ms: number;
  primary_team?: TeamSolution;
  backup_teams: TeamSolution[];
  infeasibility_reasons: InfeasibilityReason[];
  rejected_candidates: RejectedCandidate[];
  human_explanation: string;
}

export interface SkillEvidence {
  id: string;
  employeeId: string;
  employeeName: string;
  skillName: string;
  source: string;
  repositoryName: string;
  commitHash?: string;
  linesChanged?: number;
  evidenceSnippet: string;
  detectedProficiency: number;
  reviewStatus: 'DETECTED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'MORE_EVIDENCE_REQUESTED';
  reviewerId?: string;
  reviewerNotes?: string;
  badgeAwarded: boolean;
  createdAt?: string;
}

export interface Mentorship {
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

export interface Meeting {
  id: string;
  projectId?: string;
  projectTitle?: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  meetUrl: string;
  isDemoMeeting: boolean;
  organizerName: string;
  attendees: {
    employeeId: string;
    name: string;
    email: string;
  }[];
  status: string;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata?: any;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  details: string;
}

export interface WorkloadSummary {
  totalEmployees: number;
  overloadedCount: number;
  underutilizedCount: number;
  availableCapacityCount: number;
  totalCapacityHours: number;
  totalAllocatedHours: number;
  remainingCapacityHours: number;
  averageUtilizationRate: number;
  blockingThreshold: number;
}
