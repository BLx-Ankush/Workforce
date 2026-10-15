import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { MeetingModal } from './components/common/MeetingModal';
import { ExternalLink, Video } from 'lucide-react';

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

import { MinimalLogin } from './components/common/MinimalLogin';

import { Meeting } from './types';

const MainContent: React.FC = () => {
  const { user, loading, role } = useAuth();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <MinimalLogin />;
  }

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
        case 'meetings':
          return (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-200 font-mono">
                      SparkMeet Conference Engine
                    </span>
                  </div>
                  <h3 className="font-bold text-zinc-900 text-base">Project Meetings & Calendar</h3>
                  <p className="text-xs text-zinc-500">Collaborate with your project team and leads via live video conferences on SparkMeet.</p>
                </div>
                <a
                  href="https://sparkmeet-web.onrender.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 whitespace-nowrap"
                >
                  <Video className="w-4 h-4 text-white" />
                  Join Meeting
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
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
        case 'learning':
          return <LearningMentorship />;
        case 'meetings':
          return (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-200 font-mono">
                      SparkMeet Conference Engine
                    </span>
                  </div>
                  <h3 className="font-bold text-zinc-900 text-base">Scheduled Team Meetings</h3>
                  <p className="text-xs text-zinc-500">Join real-time video conferences with your project team and mentors on SparkMeet.</p>
                </div>
                <a
                  href="https://sparkmeet-web.onrender.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 whitespace-nowrap"
                >
                  <Video className="w-4 h-4 text-white" />
                  Join Meeting
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <EmployeeDashboard
                onNavigateTab={setCurrentTab}
                onOpenMeeting={handleOpenMeeting}
              />
            </div>
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
    <div className="min-h-screen bg-zinc-50/60 text-zinc-900 flex flex-col">
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
