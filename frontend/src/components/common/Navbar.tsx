import React, { useState } from 'react';
import { Sparkles, Bell, Shield, User, Briefcase, Cpu, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationDrawer } from './NotificationDrawer';

export const Navbar: React.FC = () => {
  const { user, role, switchRole, unreadCount, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-zinc-200 bg-white sticky top-0 z-40 px-6 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        {/* Left: Brand & Engine status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-zinc-900">Workforce Intelligence AI</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 font-semibold font-mono">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 hidden md:block">
                Right People. Balanced Teams. Resilient Projects.
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-600">
            <Cpu className="w-3.5 h-3.5 text-zinc-900" />
            <span>OR-Tools CP-SAT Solver:</span>
            <span className="text-zinc-900 font-semibold flex items-center gap-1 font-mono">
              <CheckCircle className="w-3 h-3 text-black" /> Online & Feasible
            </span>
          </div>
        </div>

        {/* Center / Right: Demo Switcher & Profile */}
        <div className="flex items-center gap-4">
          {/* Quick Demo Switcher for Hackathon Judges */}
          <div className="bg-zinc-100 p-1 rounded-xl flex items-center gap-1 border border-zinc-200/80">
            <button
              onClick={() => switchRole('MANAGER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                role === 'MANAGER'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-zinc-600 hover:text-black hover:bg-white/60'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Manager
            </button>

            <button
              onClick={() => switchRole('EMPLOYEE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                role === 'EMPLOYEE'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-zinc-600 hover:text-black hover:bg-white/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Employee
            </button>

            <button
              onClick={() => switchRole('ADMIN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                role === 'ADMIN'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-zinc-600 hover:text-black hover:bg-white/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>

          {/* Notifications Bell */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative p-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 hover:text-black hover:bg-zinc-50 transition shadow-sm"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User profile avatar */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-200">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-200 bg-zinc-100">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-700">
                  {user?.name?.[0] || 'U'}
                </div>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-zinc-900 truncate max-w-[120px]">{user?.name}</p>
              <p className="text-[10px] text-zinc-500 capitalize">{role.toLowerCase()} Portal</p>
            </div>
          </div>

          {/* Sign Out Action */}
          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 px-3 rounded-xl bg-white border border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-50 transition shadow-sm flex items-center gap-1.5 text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5 text-zinc-900" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <NotificationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};
