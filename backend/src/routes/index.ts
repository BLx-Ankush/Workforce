import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { EmployeeController } from '../controllers/employeeController';
import { DepartmentController } from '../controllers/departmentController';
import { SkillController } from '../controllers/skillController';
import { ProjectController } from '../controllers/projectController';
import { WorkloadController } from '../controllers/workloadController';
import { VerificationController } from '../controllers/verificationController';
import { MentorshipController } from '../controllers/mentorshipController';
import { MeetingController } from '../controllers/meetingController';
import { NotificationController, AuditController } from '../controllers/notificationController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// ==================== AUTHENTICATION ====================
router.post('/auth/login', AuthController.login);
router.post('/auth/quick-demo', AuthController.quickDemoLogin);
router.get('/auth/me', authenticateToken, AuthController.getMe);

// ==================== WORKFORCE & EMPLOYEES ====================
router.get('/employees', authenticateToken, EmployeeController.getEmployees);
router.get('/employees/:id', authenticateToken, EmployeeController.getEmployeeById);
router.post('/employees', authenticateToken, requireRole(['ADMIN', 'MANAGER']), EmployeeController.createEmployee);
router.patch('/employees/:id', authenticateToken, EmployeeController.updateEmployee);
router.patch('/employees/:id/availability', authenticateToken, EmployeeController.updateAvailability);
router.post('/employees/:id/sync-github', authenticateToken, EmployeeController.syncGitHub);

// ==================== DEPARTMENTS ====================
router.get('/departments', authenticateToken, DepartmentController.getDepartments);
router.post('/departments', authenticateToken, requireRole(['ADMIN']), DepartmentController.createDepartment);
router.patch('/departments/:id', authenticateToken, requireRole(['ADMIN']), DepartmentController.updateDepartment);

// ==================== SKILLS TAXONOMY ====================
router.get('/skills', authenticateToken, SkillController.getSkills);
router.post('/skills', authenticateToken, requireRole(['ADMIN']), SkillController.createSkill);
router.patch('/skills/:id', authenticateToken, requireRole(['ADMIN']), SkillController.updateSkill);

// ==================== PROJECTS & OPTIMIZATION ====================
router.get('/projects', authenticateToken, ProjectController.getProjects);
router.get('/projects/:id', authenticateToken, ProjectController.getProjectById);
router.post('/projects', authenticateToken, requireRole(['MANAGER', 'ADMIN']), ProjectController.createProject);
router.post('/projects/:id/optimize', authenticateToken, requireRole(['MANAGER', 'ADMIN']), ProjectController.optimizeProject);
router.post('/projects/:id/validate-team', authenticateToken, requireRole(['MANAGER', 'ADMIN']), ProjectController.validateTeam);
router.post('/projects/:id/approve-team', authenticateToken, requireRole(['MANAGER', 'ADMIN']), ProjectController.approveTeam);
router.post('/projects/:id/simulate-disruption', authenticateToken, requireRole(['MANAGER', 'ADMIN']), ProjectController.simulateDisruption);
router.post('/projects/:id/approve-recovery', authenticateToken, requireRole(['MANAGER', 'ADMIN']), ProjectController.approveRecovery);

// ==================== WORKLOAD INTELLIGENCE ====================
router.get('/workload/summary', authenticateToken, WorkloadController.getSummary);
router.get('/workload/employees', authenticateToken, WorkloadController.getWorkloadEmployees);
router.get('/workload/policies', authenticateToken, WorkloadController.getPolicies);
router.patch('/workload/policies', authenticateToken, requireRole(['ADMIN']), WorkloadController.updatePolicies);
router.post('/workload/recalculate', authenticateToken, WorkloadController.recalculateAll);

// ==================== GITHUB VERIFICATION ====================
router.get('/verification/queue', authenticateToken, VerificationController.getVerificationQueue);
router.post('/verification/:id/review', authenticateToken, requireRole(['ADMIN']), VerificationController.reviewEvidence);
router.get('/verification/badges', authenticateToken, VerificationController.getBadges);

// ==================== MENTORSHIP & UPSKILLING ====================
router.get('/mentorship/gaps', authenticateToken, MentorshipController.getSkillGaps);
router.get('/mentorship/pairings', authenticateToken, MentorshipController.getMentorshipPairings);
router.get('/mentorship/recommendations', authenticateToken, MentorshipController.getMentorshipRecommendations);
router.post('/mentorship', authenticateToken, MentorshipController.createMentorship);
router.patch('/mentorship/:mentorshipId/milestones/:milestoneId', authenticateToken, MentorshipController.updateMilestone);

// ==================== MEETINGS & COLLABORATION ====================
router.get('/meetings', authenticateToken, MeetingController.getMeetings);
router.post('/meetings', authenticateToken, MeetingController.createMeeting);

// ==================== NOTIFICATIONS ====================
router.get('/notifications', authenticateToken, NotificationController.getNotifications);
router.patch('/notifications/:id/read', authenticateToken, NotificationController.markRead);
router.post('/notifications/mark-all-read', authenticateToken, NotificationController.markAllRead);

// ==================== AUDIT LOGS ====================
router.get('/audit-logs', authenticateToken, requireRole(['ADMIN', 'MANAGER']), AuditController.getAuditLogs);

export default router;
