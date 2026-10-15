import React, { useState } from 'react';
import { Sparkles, Bell, Shield, User, Briefcase, Cpu, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationDrawer } from './NotificationDrawer';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { user, role, switchRole, unreadCount } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
        {/* Left: Brand & Engine status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">Workforce Intelligence AI</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold font-mono">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Right People. Balanced Teams. Resilient Projects.
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>OR-Tools CP-SAT Solver:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Feasible & Active
            </span>
          </div>
        </div>

        {/* Center / Right: Demo Switcher & Profile */}
        <div className="flex items-center gap-4">
          {/* Quick Demo Switcher for Hackathon Judges */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1 shadow-inner">
            <button
              onClick={() => switchRole('MANAGER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                role === 'MANAGER'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Manager
            </button>

            <button
              onClick={() => switchRole('EMPLOYEE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                role === 'EMPLOYEE'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Employee
            </button>

            <button
              onClick={() => switchRole('ADMIN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                role === 'ADMIN'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>

          {/* Notifications Bell */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User profile avatar */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 bg-slate-800">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-indigo-400">
                  {user?.name?.[0] || 'U'}
                </div>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white truncate max-w-[120px]">{user?.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{role.toLowerCase()} Portal</p>
            </div>
          </div>
        </div>
      </header>

      <NotificationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};
