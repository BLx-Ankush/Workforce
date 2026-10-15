import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { MeetingModal } from './components/common/MeetingModal';

// Manager Portal Components
import { ManagerOverview } from './components/manager/ManagerOverview';
import { EmployeeDirectory } from './components/manager/EmployeeDirectory';
import { WorkloadIntelligence } from './components/manager/WorkloadIntelligence';
import { ProjectList } from './components/manager/ProjectList';
import { TeamOptimizerView } from './components/manager/TeamOptimizerView';
import { EmergencyRecoverySimulator } from './components/manager/EmergencyRecoverySimulator';

// Employee Portal Components
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { EmployeeProfile } from './components/employee/EmployeeProfile';
import { GitHubIntegration } from './components/employee/GitHubIntegration';
import { LearningMentorship } from './components/employee/LearningMentorship';

// Admin Portal Components
import { VerificationQueue } from './components/admin/VerificationQueue';
import { WorkloadPolicies } from './components/admin/WorkloadPolicies';
import { AuditLogsView } from './components/admin/AuditLogsView';

import { Meeting } from './types';

const MainContent: React.FC = () => {
  const { role } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj_cloud_analytics');
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);

  // When role changes, set sensible default tab
  React.useEffect(() => {
    if (role === 'MANAGER') setCurrentTab('overview');
    else if (role === 'EMPLOYEE') setCurrentTab('dashboard');
    else if (role === 'ADMIN') setCurrentTab('overview');
  }, [role]);

  const handleSelectProjectForOptimization = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentTab('optimizer');
  };

  const handleOpenMeeting = (meeting: Meeting) => {
    setActiveMeeting(meeting);
    setIsMeetingOpen(true);
  };

  const renderContent = () => {
    if (role === 'MANAGER') {
      switch (currentTab) {
        case 'overview':
          return (
            <ManagerOverview
              onNavigateTab={setCurrentTab}
              onSelectProjectForOptimization={handleSelectProjectForOptimization}
            />
          );
        case 'employees':
          return <EmployeeDirectory />;
        case 'workload':
          return <WorkloadIntelligence />;
        case 'projects':
          return (
            <ProjectList
              onSelectProjectForOptimization={handleSelectProjectForOptimization}
            />
          );
        case 'optimizer':
          return (
            <TeamOptimizerView
              initialProjectId={selectedProjectId}
              onNavigateTab={setCurrentTab}
            />
          );
        case 'recovery':
          return <EmergencyRecoverySimulator />;
        case 'mentorship':
          return <LearningMentorship />;
        case 'meetings':
          return (
            <div className="space-y-4">
              <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">Project Meetings & Calendar</h3>
                  <p className="text-xs text-slate-400">Schedule meetings, invite staff, and launch Google Meet video rooms.</p>
                </div>
                <button
                  onClick={() => handleOpenMeeting({
                    id: 'meet_demo',
                    title: 'Cloud Analytics Architecture Kickoff',
                    scheduledAt: new Date().toISOString(),
                    durationMinutes: 45,
                    meetUrl: 'https://meet.google.com/wfc-hack-demo',
                    isDemoMeeting: true,
                    organizerName: 'Marcus Vance',
                    attendees: [
                      { employeeId: 'emp_rahul', name: 'Rahul Sharma', email: 'rahul.sharma@workforce.ai' },
                      { employeeId: 'emp_priya', name: 'Priya Patel', email: 'priya.patel@workforce.ai' }
                    ],
                    status: 'IN_PROGRESS'
                  })}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition"
                >
                  Launch Demo Room
                </button>
              </div>
            </div>
          );
        default:
          return (
            <ManagerOverview
              onNavigateTab={setCurrentTab}
              onSelectProjectForOptimization={handleSelectProjectForOptimization}
            />
          );
      }
    } else if (role === 'EMPLOYEE') {
      switch (currentTab) {
        case 'dashboard':
          return (
            <EmployeeDashboard
              onNavigateTab={setCurrentTab}
              onOpenMeeting={handleOpenMeeting}
            />
          );
        case 'profile':
          return <EmployeeProfile />;
        case 'github':
          return <GitHubIntegration />;
        case 'workload':
          return <WorkloadIntelligence />;
        case 'learning':
          return <LearningMentorship />;
        case 'meetings':
          return (
            <EmployeeDashboard
              onNavigateTab={setCurrentTab}
              onOpenMeeting={handleOpenMeeting}
            />
          );
        default:
          return (
            <EmployeeDashboard
              onNavigateTab={setCurrentTab}
              onOpenMeeting={handleOpenMeeting}
            />
          );
      }
    } else {
      // ADMIN
      switch (currentTab) {
        case 'overview':
          return (
            <ManagerOverview
              onNavigateTab={setCurrentTab}
              onSelectProjectForOptimization={handleSelectProjectForOptimization}
            />
          );
        case 'employees':
          return <EmployeeDirectory />;
        case 'departments':
          return <ManagerOverview onNavigateTab={setCurrentTab} onSelectProjectForOptimization={handleSelectProjectForOptimization} />;
        case 'skills':
          return <EmployeeDirectory />;
        case 'verification':
          return <VerificationQueue />;
        case 'policies':
          return <WorkloadPolicies />;
        case 'audit':
          return <AuditLogsView />;
        default:
          return <VerificationQueue />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {renderContent()}
        </main>
      </div>

      <MeetingModal
        isOpen={isMeetingOpen}
        onClose={() => setIsMeetingOpen(false)}
        meeting={activeMeeting}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
