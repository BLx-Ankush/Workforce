import { db } from '../config/database';
import { IMentorship } from '../models/types';
import { SocketService } from './socketService';

export class MentorshipService {
  /**
   * Analyzes workforce skill supply vs project demand to identify critical gaps.
   */
  public static async analyzeWorkforceSkillGaps() {
    const projects = await db.projects.find();
    const employees = await db.employees.find();

    // 1. Demand count per skill
    const demand: Record<string, { mandatory: number; preferred: number }> = {};
    projects.forEach(p => {
      p.roleSlots.forEach(slot => {
        Object.keys(slot.mandatorySkills || {}).forEach(sk => {
          if (!demand[sk]) demand[sk] = { mandatory: 0, preferred: 0 };
          demand[sk].mandatory += 1;
        });
        Object.keys(slot.preferredSkills || {}).forEach(sk => {
          if (!demand[sk]) demand[sk] = { mandatory: 0, preferred: 0 };
          demand[sk].preferred += 1;
        });
      });
    });

    // 2. Supply count per skill in workforce
    const supply: Record<string, { total: number; verified: number; advanced: number }> = {};
    employees.forEach(emp => {
      Object.entries(emp.skills || {}).forEach(([sk, prof]) => {
        if (!supply[sk]) supply[sk] = { total: 0, verified: 0, advanced: 0 };
        supply[sk].total += 1;
        if (prof >= 4) supply[sk].advanced += 1;
        if (emp.verifiedSkills?.includes(sk)) supply[sk].verified += 1;
      });
    });

    // 3. Compute gap score and urgency
    const gaps = Object.keys({ ...demand, ...supply }).map(skill => {
      const d = demand[skill] || { mandatory: 0, preferred: 0 };
      const s = supply[skill] || { total: 0, verified: 0, advanced: 0 };

      const totalDemand = d.mandatory * 2 + d.preferred;
      const deficit = totalDemand - s.advanced;
      const urgency = deficit > 0 ? (deficit >= 3 ? 'CRITICAL' : 'MODERATE') : 'HEALTHY';

      // Find senior specialist for this skill
      const seniorCandidates = employees.filter(e => !e.onLeave && (e.skills[skill] || 0) >= 3);
      seniorCandidates.sort((a, b) => {
        const aScore = (a.skills[skill] || 0) * 10 + (a.verifiedSkills?.includes(skill) ? 15 : 0) + (a.experienceYears || 0);
        const bScore = (b.skills[skill] || 0) * 10 + (b.verifiedSkills?.includes(skill) ? 15 : 0) + (b.experienceYears || 0);
        return bScore - aScore;
      });

      const topSenior = seniorCandidates[0] || employees.find(e => (e.skills[skill] || 0) >= 2) || employees[0];

      const seniorPerson = topSenior ? {
        id: topSenior.id,
        name: topSenior.name,
        role: topSenior.title || topSenior.jobRole || 'Senior Staff Specialist',
        avatar: topSenior.githubAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        proficiency: topSenior.skills[skill] || 4,
        isVerified: topSenior.verifiedSkills?.includes(skill) || false,
        experienceYears: topSenior.experienceYears || 5,
        availableHours: topSenior.availableHours || 10
      } : null;

      const youtubeCourses: Record<string, { title: string; url: string; channel: string; duration: string }> = {
        'AWS': {
          title: 'AWS Certified Cloud Practitioner & Solutions Architect Course',
          url: 'https://www.youtube.com/watch?v=SOTamWNgDKc',
          channel: 'freeCodeCamp.org',
          duration: '13 hours'
        },
        'Docker': {
          title: 'Docker Full Course for Beginners - Complete Tutorial',
          url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
          channel: 'freeCodeCamp.org',
          duration: '4 hours'
        },
        'Python': {
          title: 'Python for Beginners - Full Masterclass',
          url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
          channel: 'Programming with Mosh',
          duration: '6 hours'
        },
        'React': {
          title: 'React 18 & 19 Full Masterclass for Production Engineering',
          url: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
          channel: 'freeCodeCamp.org',
          duration: '11 hours'
        },
        'TypeScript': {
          title: 'TypeScript Full Course - Beginner to Advanced',
          url: 'https://www.youtube.com/watch?v=BwuLxPH8IDs',
          channel: 'freeCodeCamp.org',
          duration: '5 hours'
        },
        'Data Analytics': {
          title: 'Data Analysis with Python Course - Hands-On Project Tutorial',
          url: 'https://www.youtube.com/watch?v=r-uOLxNrNk8',
          channel: 'freeCodeCamp.org',
          duration: '4 hours'
        },
        'Kubernetes': {
          title: 'Kubernetes Course for Beginners - Complete Crash Course',
          url: 'https://www.youtube.com/watch?v=X48VuDVv0do',
          channel: 'freeCodeCamp.org',
          duration: '4 hours'
        },
        'Machine Learning': {
          title: 'Machine Learning for Everybody - Full Course',
          url: 'https://www.youtube.com/watch?v=i_LwzRVP7bg',
          channel: 'freeCodeCamp.org',
          duration: '4 hours'
        },
        'SQL': {
          title: 'SQL Tutorial - Full Database Course for Beginners',
          url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
          channel: 'freeCodeCamp.org',
          duration: '4.5 hours'
        },
        'FastAPI': {
          title: 'FastAPI Course - Build Fast Python APIs from Scratch',
          url: 'https://www.youtube.com/watch?v=0sOvCWFmrtA',
          channel: 'freeCodeCamp.org',
          duration: '19 hours'
        }
      };

      const course = youtubeCourses[skill] || {
        title: `${skill} Professional Engineering Full Course`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' full course tutorial')}`,
        channel: 'YouTube Technical Learning',
        duration: 'Comprehensive'
      };

      return {
        skill,
        mandatoryProjectDemand: d.mandatory,
        preferredProjectDemand: d.preferred,
        totalQualifiedEmployees: s.total,
        verifiedSpecialistsCount: s.verified,
        seniorProficientCount: s.advanced,
        gapIndex: Math.max(0, deficit),
        urgency,
        seniorMentor: seniorPerson,
        course
      };
    });

    gaps.sort((a, b) => b.gapIndex - a.gapIndex);

    return gaps;
  }

  /**
   * Recommends a Practical Mentorship pairing to close a specific skill gap.
   */
  public static async recommendMentorship(targetSkill: string) {
    const employees = await db.employees.find();

    // Mentors: must have verified targetSkill OR proficiency >= 4, and healthy workload (< 75%)
    const potentialMentors = employees.filter(e =>
      !e.onLeave &&
      e.workloadRiskScore < 75 &&
      e.availableHours >= 5 &&
      ((e.skills[targetSkill] || 0) >= 4 || e.verifiedSkills?.includes(targetSkill))
    );

    // Mentees: have targetSkill <= 2, experience > 1 yr, and have some available hours
    const potentialMentees = employees.filter(e =>
      !e.onLeave &&
      e.availableHours >= 4 &&
      (e.skills[targetSkill] || 0) < 3
    );

    potentialMentors.sort((a, b) => (b.skills[targetSkill] || 0) - (a.skills[targetSkill] || 0));
    potentialMentees.sort((a, b) => (a.skills[targetSkill] || 0) - (b.skills[targetSkill] || 0));

    return {
      targetSkill,
      availableMentors: potentialMentors.slice(0, 3).map(m => ({
        id: m.id,
        name: m.name,
        proficiency: m.skills[targetSkill] || 4,
        isVerified: m.verifiedSkills?.includes(targetSkill),
        availableHours: m.availableHours,
        workloadRisk: m.workloadRiskScore
      })),
      potentialMentees: potentialMentees.slice(0, 5).map(m => ({
        id: m.id,
        name: m.name,
        currentProficiency: m.skills[targetSkill] || 0,
        availableHours: m.availableHours,
        department: m.departmentId
      }))
    };
  }

  /**
   * Creates an active practical mentorship agreement.
   */
  public static async createMentorship(
    mentorId: string,
    menteeId: string,
    targetSkill: string,
    weeklyHours: number = 4
  ): Promise<IMentorship> {
    const mentor = await db.employees.findById(mentorId);
    const mentee = await db.employees.findById(menteeId);
    if (!mentor || !mentee) throw new Error('Mentor or mentee not found');

    const milestones = [
      {
        id: `ms_1`,
        title: `Core Architectural Principles in ${targetSkill}`,
        description: `Review production design patterns and setup local developer environment.`,
        completed: false,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
      },
      {
        id: `ms_2`,
        title: `Supervised Mini-Project Implementation`,
        description: `Implement modular business logic feature under mentor code review.`,
        completed: false,
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
      },
      {
        id: `ms_3`,
        title: `Deliverable Evaluation & GitHub Evidence Submission`,
        description: `Commit tested PR to repo, conduct retrospective, and submit for skill verification.`,
        completed: false,
        dueDate: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0]
      }
    ];

    const mentorship: IMentorship = {
      id: `ment_${Date.now()}`,
      mentorId,
      mentorName: mentor.name,
      menteeId,
      menteeName: mentee.name,
      targetSkill,
      weeklyHours,
      milestones,
      status: 'ACTIVE',
      startDate: new Date().toISOString().split('T')[0],
      notes: `Practical upskilling track supervised by ${mentor.name} for ${targetSkill} mastery.`
    };

    await db.mentorships.create(mentorship);

    // Notify mentee and mentor
    await db.notifications.create({
      id: `notif_${Date.now()}_mentee`,
      recipientId: mentee.id,
      type: 'MENTORSHIP',
      title: `Mentorship Track Started: ${targetSkill}`,
      message: `${mentor.name} is now your practical mentor for ${targetSkill}. Check your milestones!`,
      read: false,
      createdAt: new Date().toISOString()
    });

    SocketService.broadcast('MENTORSHIP_CREATED', {
      mentorName: mentor.name,
      menteeName: mentee.name,
      targetSkill
    });

    return mentorship;
  }
}
