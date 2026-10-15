import bcrypt from 'bcryptjs';
import { db } from '../config/database';
import { WorkloadService } from '../services/workloadService';
import {
  IUser, IEmployee, IDepartment, ISkill,
  IProject, IAssignment, ISkillEvidence, IMentorship, IMeeting
} from '../models/types';

export async function seedDatabase() {
  console.log('🌱 Starting comprehensive workforce intelligence database seeding...');

  // 1. Clear existing data
  await db.users.clear();
  await db.employees.clear();
  await db.departments.clear();
  await db.skills.clear();
  await db.projects.clear();
  await db.assignments.clear();
  await db.recommendations.clear();
  await db.skillEvidence.clear();
  await db.mentorships.clear();
  await db.meetings.clear();
  await db.notifications.clear();
  await db.auditLogs.clear();

  // 2. Departments (6 departments)
  const departments: IDepartment[] = [
    {
      id: 'dept_cloud',
      name: 'Cloud & Infrastructure Engineering',
      code: 'CLOUD',
      headCount: 22,
      budgetAnnual: 1200000,
      description: 'Architects and manages multi-cloud AWS, Azure, and Kubernetes infrastructures.'
    },
    {
      id: 'dept_data',
      name: 'Data & Artificial Intelligence',
      code: 'DATA_AI',
      headCount: 20,
      budgetAnnual: 1400000,
      description: 'Builds enterprise data lakes, analytics pipelines, and generative AI models.'
    },
    {
      id: 'dept_app',
      name: 'Enterprise Software & Web',
      code: 'WEB_APP',
      headCount: 24,
      budgetAnnual: 1100000,
      description: 'Develops client-facing web portals, scalable microservices, and React apps.'
    },
    {
      id: 'dept_sec',
      name: 'Cybersecurity & Compliance',
      code: 'SECURITY',
      headCount: 12,
      budgetAnnual: 900000,
      description: 'Zero-trust networks, automated vulnerability audits, and identity access management.'
    },
    {
      id: 'dept_devops',
      name: 'Platform Engineering & DevOps',
      code: 'DEVOPS',
      headCount: 12,
      budgetAnnual: 850000,
      description: 'Continuous delivery pipelines, container orchestrations, and telemetry.'
    },
    {
      id: 'dept_qa',
      name: 'Quality & Reliability Engineering',
      code: 'QA_SRE',
      headCount: 10,
      budgetAnnual: 750000,
      description: 'Automated test frameworks, performance stress tests, and SRE monitoring.'
    }
  ];
  await db.departments.insertMany(departments);

  // 3. Technical Skills Taxonomy (18 normalized skills)
  const skillsList: ISkill[] = [
    { id: 'skill_python', name: 'Python', category: 'Backend & Data', aliases: ['py', 'python3'], description: 'High-level programming for backend, automation, and machine learning.' },
    { id: 'skill_aws', name: 'AWS', category: 'Cloud Infrastructure', aliases: ['amazon web services', 'ec2', 's3'], description: 'Amazon Web Services cloud hosting, Lambda, and IAM.' },
    { id: 'skill_data_analytics', name: 'Data Analytics', category: 'Data & AI', aliases: ['analytics', 'bi', 'data science'], description: 'Data modeling, ETL, business intelligence, and insights.' },
    { id: 'skill_react', name: 'React', category: 'Frontend', aliases: ['reactjs', 'react.js'], description: 'Modern reactive component UI library.' },
    { id: 'skill_nodejs', name: 'Node.js', category: 'Backend & Data', aliases: ['node', 'express'], description: 'Asynchronous event-driven JavaScript runtime.' },
    { id: 'skill_sql', name: 'SQL', category: 'Database', aliases: ['postgres', 'postgresql', 'mysql'], description: 'Relational database schema design and complex querying.' },
    { id: 'skill_ml', name: 'Machine Learning', category: 'Data & AI', aliases: ['ml', 'deep learning', 'pytorch'], description: 'Statistical modeling, neural networks, and scikit-learn.' },
    { id: 'skill_docker', name: 'Docker', category: 'DevOps', aliases: ['containers', 'dockerfile'], description: 'Containerization and reproducible microservices runtime.' },
    { id: 'skill_k8s', name: 'Kubernetes', category: 'DevOps', aliases: ['k8s', 'helm'], description: 'Container orchestration and automated cluster scaling.' },
    { id: 'skill_typescript', name: 'TypeScript', category: 'Frontend', aliases: ['ts'], description: 'Typed JavaScript for enterprise scale software.' },
    { id: 'skill_fastapi', name: 'FastAPI', category: 'Backend & Data', aliases: ['fast-api'], description: 'High-performance Python web framework with type hints.' },
    { id: 'skill_devops', name: 'DevOps', category: 'DevOps', aliases: ['ci/cd', 'github actions'], description: 'Continuous integration, delivery pipelines, and infrastructure as code.' },
    { id: 'skill_cyber', name: 'Cybersecurity', category: 'Security', aliases: ['infosec', 'penetration testing'], description: 'Vulnerability assessment, cryptography, and zero-trust security.' },
    { id: 'skill_mongodb', name: 'MongoDB', category: 'Database', aliases: ['nosql', 'mongo'], description: 'Document-oriented NoSQL database.' },
    { id: 'skill_cloud', name: 'Cloud Computing', category: 'Cloud Infrastructure', aliases: ['gcp', 'azure', 'cloud'], description: 'Distributed systems architectures and cloud-native solutions.' },
    { id: 'skill_graphql', name: 'GraphQL', category: 'Backend & Data', aliases: ['gql', 'apollo'], description: 'API query language for flexible data fetching.' }
  ];
  await db.skills.insertMany(skillsList);

  // 4. Detailed Employees (Key Demo Personas + 92 synthetic employees = 100 total)
  const keyEmployees: IEmployee[] = [
    // Rahul Sharma: AWS + Data Analytics (Healthy workload, verified AWS)
    {
      id: 'emp_rahul',
      employeeId: 'EMP-1001',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@workforce.ai',
      departmentId: 'dept_cloud',
      jobRole: 'Cloud Solutions Architect',
      title: 'Senior Cloud Solutions Architect',
      skills: { 'AWS': 4, 'Data Analytics': 4, 'Python': 3, 'Docker': 3 },
      verifiedSkills: ['AWS', 'Data Analytics'],
      experienceYears: 6.5,
      weeklyCapacityHours: 40.0,
      allocatedHours: 10.0,
      availableHours: 30.0,
      utilizationRate: 25,
      workloadRiskScore: 24,
      availabilityStatus: 'AVAILABLE',
      onLeave: false,
      githubUsername: 'rahul-cloud',
      githubConnected: true,
      githubAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      portfolioSummary: 'Senior cloud architect specialized in multi-cloud infrastructure, cost optimization, and enterprise ETL pipelines.',
      verifiedBadges: [
        { badgeName: 'Certified AWS Specialist', skill: 'AWS', issuedDate: '2026-01-15', evidenceSource: 'GitHub: rahul-cloud/aws-cdk-infra' },
        { badgeName: 'Enterprise Data Analytics Lead', skill: 'Data Analytics', issuedDate: '2026-02-10', evidenceSource: 'Project: Data Mesh Core' }
      ],
      activeAssignmentsCount: 1,
      mentorCapacityHours: 6
    },
    // Priya Patel: Python + Data Analytics + SQL (Healthy, verified Python & SQL)
    {
      id: 'emp_priya',
      employeeId: 'EMP-1002',
      name: 'Priya Patel',
      email: 'priya.patel@workforce.ai',
      departmentId: 'dept_data',
      jobRole: 'Lead Data Engineer',
      title: 'Staff Data Pipeline Engineer',
      skills: { 'Python': 5, 'Data Analytics': 4, 'SQL': 4, 'FastAPI': 3 },
      verifiedSkills: ['Python', 'SQL'],
      experienceYears: 5.5,
      weeklyCapacityHours: 40.0,
      allocatedHours: 15.0,
      availableHours: 25.0,
      utilizationRate: 38,
      workloadRiskScore: 32,
      availabilityStatus: 'AVAILABLE',
      onLeave: false,
      githubUsername: 'priya-data',
      githubConnected: true,
      githubAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      portfolioSummary: 'Data infrastructure expert designing streaming pipelines, warehouse transformations, and query performance optimizations.',
      verifiedBadges: [
        { badgeName: 'Certified Python Specialist', skill: 'Python', issuedDate: '2026-01-20', evidenceSource: 'GitHub: priya-data/py-etl' }
      ],
      activeAssignmentsCount: 1,
      mentorCapacityHours: 4
    },
    // Arjun Verma: Python 5 + AWS 5 (CRITICAL OVERLOAD: 94/100 Fatigue Risk -> must be blocked by fatigue policy!)
    {
      id: 'emp_arjun',
      employeeId: 'EMP-1003',
      name: 'Arjun Verma',
      email: 'arjun.verma@workforce.ai',
      departmentId: 'dept_cloud',
      jobRole: 'Principal Cloud Architect',
      title: 'Principal Cloud & Systems Engineer',
      skills: { 'Python': 5, 'AWS': 5, 'Docker': 5, 'Kubernetes': 4 },
      verifiedSkills: ['Python', 'AWS', 'Docker'],
      experienceYears: 8.5,
      weeklyCapacityHours: 40.0,
      allocatedHours: 42.0, // Over allocated!
      availableHours: 0.0,
      utilizationRate: 105,
      workloadRiskScore: 94, // BLOCKED BY POLICY
      availabilityStatus: 'OVERLOADED',
      onLeave: false,
      githubUsername: 'arjun-core',
      githubConnected: true,
      githubAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      portfolioSummary: 'Principal distributed systems engineer. Currently leading two enterprise platform rollouts.',
      verifiedBadges: [
        { badgeName: 'Master Cloud Architect', skill: 'AWS', issuedDate: '2025-11-12', evidenceSource: 'GitHub: arjun-core/k8s-mesh' }
      ],
      activeAssignmentsCount: 3,
      mentorCapacityHours: 0
    },
    // Neha Gupta: Python + AWS + Cloud Computing (HEALTHY ALTERNATIVE to Arjun!)
    {
      id: 'emp_neha',
      employeeId: 'EMP-1004',
      name: 'Neha Gupta',
      email: 'neha.gupta@workforce.ai',
      departmentId: 'dept_cloud',
      jobRole: 'Cloud Solutions Engineer',
      title: 'Senior Cloud Platform Engineer',
      skills: { 'Python': 4, 'AWS': 4, 'Cloud Computing': 4, 'Docker': 3 },
      verifiedSkills: ['AWS', 'Cloud Computing'],
      experienceYears: 4.2,
      weeklyCapacityHours: 40.0,
      allocatedHours: 12.0,
      availableHours: 28.0,
      utilizationRate: 30,
      workloadRiskScore: 26,
      availabilityStatus: 'AVAILABLE',
      onLeave: false,
      githubUsername: 'neha-cloud',
      githubConnected: true,
      githubAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      portfolioSummary: 'Cloud systems and microservices engineer with hands-on AWS production experience and Python backend expertise.',
      verifiedBadges: [
        { badgeName: 'Certified AWS Specialist', skill: 'AWS', issuedDate: '2026-02-01', evidenceSource: 'GitHub: neha-cloud/serverless-api' }
      ],
      activeAssignmentsCount: 1,
      mentorCapacityHours: 4
    },
    // Vikram Singh: Junior/Mid Python Developer (Backup candidate)
    {
      id: 'emp_vikram',
      employeeId: 'EMP-1005',
      name: 'Vikram Singh',
      email: 'vikram.singh@workforce.ai',
      departmentId: 'dept_data',
      jobRole: 'Backend & Data Engineer',
      title: 'Software Engineer II',
      skills: { 'Python': 4, 'Data Analytics': 3, 'SQL': 4, 'Docker': 2 },
      verifiedSkills: ['Python'],
      experienceYears: 3.2,
      weeklyCapacityHours: 40.0,
      allocatedHours: 10.0,
      availableHours: 30.0,
      utilizationRate: 25,
      workloadRiskScore: 22,
      availabilityStatus: 'AVAILABLE',
      onLeave: false,
      githubUsername: 'vikram-py',
      githubConnected: true,
      githubAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      portfolioSummary: 'Backend engineer focused on data ingestion and Python APIs.',
      verifiedBadges: [],
      activeAssignmentsCount: 1,
      mentorCapacityHours: 2
    },
    // Anita Desai: React + TypeScript UI specialist
    {
      id: 'emp_anita',
      employeeId: 'EMP-1006',
      name: 'Anita Desai',
      email: 'anita.desai@workforce.ai',
      departmentId: 'dept_app',
      jobRole: 'Frontend Architect',
      title: 'Lead Frontend UI Architect',
      skills: { 'React': 5, 'TypeScript': 5, 'Node.js': 3, 'GraphQL': 4 },
      verifiedSkills: ['React', 'TypeScript'],
      experienceYears: 6.0,
      weeklyCapacityHours: 40.0,
      allocatedHours: 15.0,
      availableHours: 25.0,
      utilizationRate: 38,
      workloadRiskScore: 30,
      availabilityStatus: 'AVAILABLE',
      onLeave: false,
      githubUsername: 'anita-react',
      githubConnected: true,
      githubAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      portfolioSummary: 'Enterprise frontend architect specializing in high-performance web applications and design systems.',
      verifiedBadges: [
        { badgeName: 'Certified React Specialist', skill: 'React', issuedDate: '2026-01-10', evidenceSource: 'GitHub: anita-react/enterprise-design-system' }
      ],
      activeAssignmentsCount: 1,
      mentorCapacityHours: 6
    },
    // Karthik Reddy: Node.js + MongoDB + SQL
    {
      id: 'emp_karthik',
      employeeId: 'EMP-1007',
      name: 'Karthik Reddy',
      email: 'karthik.reddy@workforce.ai',
      departmentId: 'dept_app',
      jobRole: 'Backend Engineer',
      title: 'Senior Backend Engineer',
      skills: { 'Node.js': 4, 'TypeScript': 4, 'MongoDB': 4, 'SQL': 4 },
      verifiedSkills: ['Node.js'],
      experienceYears: 4.8,
      weeklyCapacityHours: 40.0,
      allocatedHours: 15.0,
      availableHours: 25.0,
      utilizationRate: 38,
      workloadRiskScore: 32,
      availabilityStatus: 'AVAILABLE',
      onLeave: false,
      githubUsername: 'karthik-node',
      githubConnected: true,
      githubAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      portfolioSummary: 'Backend microservices specialist with extensive REST and GraphQL architecture experience.',
      verifiedBadges: [],
      activeAssignmentsCount: 1,
      mentorCapacityHours: 4
    },
    // Meera Nair: Machine Learning + Python
    {
      id: 'emp_meera',
      employeeId: 'EMP-1008',
      name: 'Meera Nair',
      email: 'meera.nair@workforce.ai',
      departmentId: 'dept_data',
      jobRole: 'Machine Learning Scientist',
      title: 'Staff ML Research Engineer',
      skills: { 'Machine Learning': 5, 'Python': 5, 'Data Analytics': 4, 'FastAPI': 3 },
      verifiedSkills: ['Machine Learning', 'Python'],
      experienceYears: 5.0,
      weeklyCapacityHours: 40.0,
      allocatedHours: 12.0,
      availableHours: 28.0,
      utilizationRate: 30,
      workloadRiskScore: 25,
      availabilityStatus: 'AVAILABLE',
      onLeave: false,
      githubUsername: 'meera-ai',
      githubConnected: true,
      githubAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150',
      portfolioSummary: 'Applied AI researcher deploying PyTorch models, vector databases, and predictive algorithms in production.',
      verifiedBadges: [
        { badgeName: 'Certified Machine Learning Specialist', skill: 'Machine Learning', issuedDate: '2026-01-28', evidenceSource: 'GitHub: meera-ai/transformer-eval' }
      ],
      activeAssignmentsCount: 1,
      mentorCapacityHours: 4
    }
  ];

  // Generate 92 more realistic synthetic employees to reach 100 employees
  const names = [
    'Siddharth Rao', 'Pooja Iyer', 'Rohan Mehta', 'Aakash Nair', 'Divya Menon',
    'Sameer Kulkarni', 'Ananya Roy', 'Manish Bansal', 'Shalini Sen', 'Varun Joshi',
    'Deepak Agarwal', 'Swati Deshmukh', 'Aditya Malhotra', 'Ritu Saxena', 'Karan Pillai',
    'Sneha Kapoor', 'Gaurav Bhatia', 'Tarun Nambiar', 'Shweta Pandey', 'Naveen Chawla',
    'Pranav Ghosh', 'Bhavna Dave', 'Suresh Kumar', 'Kavita Hegde', 'Harish Chandra'
  ];

  const syntheticEmployees: IEmployee[] = [];
  const deptIds = departments.map(d => d.id);
  const allSkillNames = skillsList.map(s => s.name);

  for (let i = 9; i <= 100; i++) {
    const baseName = names[(i - 9) % names.length] + ` ${Math.floor(i / names.length) + 1}`;
    const deptId = deptIds[i % deptIds.length];

    // Pick 3-5 skills
    const empSkills: Record<string, number> = {};
    const count = 3 + (i % 3);
    for (let s = 0; s < count; s++) {
      const sk = allSkillNames[(i * 3 + s) % allSkillNames.length];
      empSkills[sk] = 2 + ((i + s) % 4); // 2 to 5
    }

    // Workload distribution: ~15% overloaded, ~25% underutilized, ~60% normal
    let allocated = 15.0;
    let risk = 35.0;
    let status: IEmployee['availabilityStatus'] = 'AVAILABLE';

    if (i % 7 === 0) {
      allocated = 38.0 + (i % 6);
      risk = 88.0 + (i % 10);
      status = 'OVERLOADED';
    } else if (i % 5 === 0) {
      allocated = 5.0;
      risk = 12.0;
      status = 'AVAILABLE';
    } else {
      allocated = 15.0 + (i % 15);
      risk = 30.0 + (i % 30);
      status = allocated > 25 ? 'PARTIALLY_COMMITTED' : 'AVAILABLE';
    }

    const exp = 1.5 + (i % 10) * 0.9;
    const verified = Object.keys(empSkills).filter((_, idx) => (i + idx) % 3 === 0);

    syntheticEmployees.push({
      id: `emp_${i}`,
      employeeId: `EMP-${1000 + i}`,
      name: baseName,
      email: `${baseName.toLowerCase().replace(/[^a-z]/g, '.')}@workforce.ai`,
      departmentId: deptId,
      jobRole: 'Software Engineer',
      title: exp > 5 ? 'Senior Engineer' : 'Software Engineer',
      skills: empSkills,
      verifiedSkills: verified,
      experienceYears: Math.round(exp * 10) / 10,
      weeklyCapacityHours: 40.0,
      allocatedHours: allocated,
      availableHours: Math.max(0, 40.0 - allocated),
      utilizationRate: Math.round((allocated / 40.0) * 100),
      workloadRiskScore: Math.round(risk),
      availabilityStatus: status,
      onLeave: i === 15 || i === 42, // couple of employees on leave
      githubUsername: `dev-${i}`,
      githubConnected: i % 2 === 0,
      githubAvatar: `https://images.unsplash.com/photo-${1500000000000 + i}?w=150`,
      portfolioSummary: `Experienced engineering contributor with expertise in ${Object.keys(empSkills).slice(0, 3).join(', ')}.`,
      verifiedBadges: verified.slice(0, 1).map(v => ({
        badgeName: `Certified ${v} Engineer`,
        skill: v,
        issuedDate: '2026-01-10',
        evidenceSource: `GitHub: dev-${i}/${v.toLowerCase()}-lab`
      })),
      activeAssignmentsCount: allocated > 20 ? 2 : 1,
      mentorCapacityHours: 2
    });
  }

  const allEmployees = [...keyEmployees, ...syntheticEmployees];
  await db.employees.insertMany(allEmployees);

  // 5. Seed Demonstration Projects (Including AMC Hack Attack Scenarios)
  const projects: IProject[] = [
    // Scenario A & Core Demo: Cloud Analytics Platform
    // Requires: Cloud Solutions Architect (AWS >= 4), Lead Data Engineer (Python >= 4), Frontend Architect (React >= 4)
    {
      id: 'proj_cloud_analytics',
      title: 'Enterprise Cloud Analytics Platform',
      description: 'Next-generation cloud data warehouse integrating real-time telemetry, predictive analytics, and executive dashboards.',
      departmentId: 'dept_cloud',
      priority: 'High',
      startDate: '2026-11-01',
      endDate: '2026-12-15',
      durationWeeks: 6,
      teamSize: 3,
      roleSlots: [
        {
          roleId: 'role_cloud_lead',
          roleName: 'Cloud Solutions Architect',
          mandatorySkills: { 'AWS': 4 },
          preferredSkills: { 'Data Analytics': 3, 'Docker': 3 },
          minExperienceYears: 4.0,
          hoursPerWeek: 15.0
        },
        {
          roleId: 'role_data_lead',
          roleName: 'Lead Data Engineer',
          mandatorySkills: { 'Python': 4 },
          preferredSkills: { 'Data Analytics': 4, 'SQL': 4 },
          minExperienceYears: 3.5,
          hoursPerWeek: 15.0
        },
        {
          roleId: 'role_frontend_lead',
          roleName: 'Frontend Architect',
          mandatorySkills: { 'React': 4 },
          preferredSkills: { 'TypeScript': 4 },
          minExperienceYears: 3.0,
          hoursPerWeek: 15.0
        }
      ],
      status: 'PLANNING',
      assignedTeam: [],
      createdAt: new Date().toISOString()
    },
    // Project 2: AI Customer Intelligence
    {
      id: 'proj_ai_intelligence',
      title: 'AI Customer Intelligence Pipeline',
      description: 'Customer behavior analytics and predictive churn forecasting using transformer models and streaming pipelines.',
      departmentId: 'dept_data',
      priority: 'Critical',
      startDate: '2026-11-15',
      endDate: '2027-01-15',
      durationWeeks: 8,
      teamSize: 3,
      roleSlots: [
        {
          roleId: 'role_ml_lead',
          roleName: 'Lead ML Scientist',
          mandatorySkills: { 'Machine Learning': 4, 'Python': 4 },
          preferredSkills: { 'Data Analytics': 3 },
          minExperienceYears: 4.0,
          hoursPerWeek: 20.0
        },
        {
          roleId: 'role_backend_eng',
          roleName: 'FastAPI Backend Engineer',
          mandatorySkills: { 'FastAPI': 3, 'Python': 3 },
          preferredSkills: { 'Docker': 3 },
          minExperienceYears: 2.5,
          hoursPerWeek: 15.0
        },
        {
          roleId: 'role_sql_architect',
          roleName: 'Data Pipeline Specialist',
          mandatorySkills: { 'SQL': 4, 'Data Analytics': 3 },
          preferredSkills: { 'Python': 3 },
          minExperienceYears: 3.0,
          hoursPerWeek: 15.0
        }
      ],
      status: 'PLANNING',
      assignedTeam: [],
      createdAt: new Date().toISOString()
    },
    // Project 3: Zero-Trust Security Infrastructure (Already Staffed Project to show live metrics)
    {
      id: 'proj_zero_trust',
      title: 'Zero-Trust Security Infrastructure',
      description: 'Company-wide identity security hardening, automated IAM role reviews, and compliance enforcement.',
      departmentId: 'dept_sec',
      priority: 'Medium',
      startDate: '2026-10-01',
      endDate: '2026-11-30',
      durationWeeks: 8,
      teamSize: 2,
      roleSlots: [
        {
          roleId: 'role_sec_lead',
          roleName: 'Lead Security Engineer',
          mandatorySkills: { 'Cybersecurity': 4 },
          preferredSkills: { 'Cloud Computing': 3 },
          minExperienceYears: 4.0,
          hoursPerWeek: 10.0
        },
        {
          roleId: 'role_devops_eng',
          roleName: 'Platform DevOps Specialist',
          mandatorySkills: { 'DevOps': 3, 'Docker': 3 },
          preferredSkills: { 'Kubernetes': 3 },
          minExperienceYears: 2.0,
          hoursPerWeek: 10.0
        }
      ],
      status: 'STAFFED',
      assignedTeam: [
        {
          employeeId: 'emp_rahul',
          employeeName: 'Rahul Sharma',
          roleId: 'role_sec_lead',
          roleName: 'Lead Security Engineer',
          assignedHours: 10.0
        },
        {
          employeeId: 'emp_priya',
          employeeName: 'Priya Patel',
          roleId: 'role_devops_eng',
          roleName: 'Platform DevOps Specialist',
          assignedHours: 15.0
        }
      ],
      createdAt: new Date().toISOString()
    }
  ];
  await db.projects.insertMany(projects);

  // 6. Active Assignments for Project 3
  const assignments: IAssignment[] = [
    {
      id: 'asgn_init_1',
      projectId: 'proj_zero_trust',
      employeeId: 'emp_rahul',
      roleId: 'role_sec_lead',
      roleName: 'Lead Security Engineer',
      weeklyHours: 10.0,
      startDate: '2026-10-01',
      endDate: '2026-11-30',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    },
    {
      id: 'asgn_init_2',
      projectId: 'proj_zero_trust',
      employeeId: 'emp_priya',
      roleId: 'role_devops_eng',
      roleName: 'Platform DevOps Specialist',
      weeklyHours: 15.0,
      startDate: '2026-10-01',
      endDate: '2026-11-30',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    }
  ];
  await db.assignments.insertMany(assignments);

  // 7. Verification Queue (GitHub Evidence Candidates)
  const evidences: ISkillEvidence[] = [
    {
      id: 'evid_101',
      employeeId: 'emp_vikram',
      employeeName: 'Vikram Singh',
      skillName: 'AWS',
      source: 'GITHUB_COMMIT',
      repositoryName: 'vikram-py/serverless-order-processor',
      commitHash: 'a7f3c92',
      linesChanged: 840,
      evidenceSnippet: 'Configured AWS Lambda triggers, SQS FIFO queues, and DynamoDB transactional writes.',
      detectedProficiency: 4,
      reviewStatus: 'PENDING_REVIEW',
      badgeAwarded: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'evid_102',
      employeeId: 'emp_karthik',
      employeeName: 'Karthik Reddy',
      skillName: 'Docker',
      source: 'GITHUB_PR',
      repositoryName: 'karthik-node/microservices-boilerplate',
      commitHash: '39b81f0',
      linesChanged: 340,
      evidenceSnippet: 'Engineered multi-stage Docker build pipeline reducing memory footprint by 45%.',
      detectedProficiency: 4,
      reviewStatus: 'PENDING_REVIEW',
      badgeAwarded: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'evid_103',
      employeeId: 'emp_anita',
      employeeName: 'Anita Desai',
      skillName: 'React',
      source: 'PROJECT_DELIVERABLE',
      repositoryName: 'anita-react/enterprise-design-system',
      commitHash: '91ec24a',
      linesChanged: 3200,
      evidenceSnippet: 'Shipped comprehensive accessible UI component library with WCAG 2.1 AA compliance.',
      detectedProficiency: 5,
      reviewStatus: 'VERIFIED',
      reviewerId: 'admin_1',
      reviewerNotes: 'Outstanding design system implementation and architecture.',
      badgeAwarded: true,
      createdAt: new Date().toISOString(),
      verifiedAt: '2026-01-10T10:00:00Z'
    }
  ];
  await db.skillEvidence.insertMany(evidences);

  // 8. Mentorship Pairings
  const mentorships: IMentorship[] = [
    {
      id: 'ment_101',
      mentorId: 'emp_rahul',
      mentorName: 'Rahul Sharma',
      menteeId: 'emp_vikram',
      menteeName: 'Vikram Singh',
      targetSkill: 'AWS',
      weeklyHours: 4,
      milestones: [
        { id: 'ms_1', title: 'AWS IAM & Core VPC Architecture', description: 'Deep-dive into multi-region network routing and IAM policies.', completed: true, dueDate: '2026-10-20' },
        { id: 'ms_2', title: 'Serverless Event Architecture', description: 'Hands-on Lambda and EventBridge integration in staging.', completed: false, dueDate: '2026-11-05' },
        { id: 'ms_3', title: 'Production Code Review & Verification', description: 'Submit verified PR for enterprise review.', completed: false, dueDate: '2026-11-20' }
      ],
      status: 'ACTIVE',
      startDate: '2026-10-10',
      notes: 'Structured upskilling program targeting Cloud Architect readiness.'
    }
  ];
  await db.mentorships.insertMany(mentorships);

  // 9. Demo Users with Hashed Passwords
  const passwordHash = bcrypt.hashSync('demo123', 8);

  const demoUsers: IUser[] = [
    {
      id: 'user_admin',
      name: 'Elena Rostova (Admin)',
      email: 'admin@workforce.ai',
      passwordHash,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user_manager',
      name: 'Marcus Vance (Manager)',
      email: 'manager@workforce.ai',
      passwordHash,
      role: 'MANAGER',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user_employee',
      name: 'Rahul Sharma (Employee)',
      email: 'employee@workforce.ai',
      passwordHash,
      role: 'EMPLOYEE',
      employeeRef: 'emp_rahul',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: new Date().toISOString()
    }
  ];
  await db.users.insertMany(demoUsers);

  // 10. Initial Meetings
  const meetings: IMeeting[] = [
    {
      id: 'meet_init_1',
      projectId: 'proj_cloud_analytics',
      projectTitle: 'Enterprise Cloud Analytics Platform',
      title: 'Cloud Analytics Architecture Kickoff',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      durationMinutes: 45,
      meetUrl: 'https://meet.google.com/wfc-hack-demo',
      isDemoMeeting: true,
      organizerId: 'user_manager',
      organizerName: 'Marcus Vance',
      attendees: [
        { employeeId: 'emp_rahul', name: 'Rahul Sharma', email: 'rahul.sharma@workforce.ai' },
        { employeeId: 'emp_priya', name: 'Priya Patel', email: 'priya.patel@workforce.ai' }
      ],
      status: 'SCHEDULED'
    }
  ];
  await db.meetings.insertMany(meetings);

  // 11. Initial Audit Logs
  await db.auditLogs.create({
    id: `audit_init_1`,
    timestamp: new Date().toISOString(),
    userId: 'user_admin',
    userName: 'Elena Rostova',
    userRole: 'ADMIN',
    action: 'SYSTEM_INITIALIZED',
    entity: 'SYSTEM',
    details: 'Database seeded with 100 enterprise employees, 6 departments, 18 skills, and live project models.'
  });

  console.log('✅ Database seeded successfully: 100 employees, 6 departments, 3 projects, demo accounts ready.');
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
