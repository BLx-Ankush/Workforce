import React from 'react';
import { X, Bell, AlertTriangle, ShieldCheck, UserCheck, Calendar, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppNotification } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead } = useAuth();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'EMERGENCY':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'VERIFICATION':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'ASSIGNMENT':
        return <UserCheck className="w-4 h-4 text-indigo-400" />;
      case 'MEETING':
        return <Calendar className="w-4 h-4 text-cyan-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold text-white">Notifications & Alerts</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {notifications.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs text-slate-600 mt-1">Live alerts will appear here in real-time</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border transition ${
                    notif.read
                      ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                      : 'bg-slate-800/40 border-indigo-500/30 text-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/60 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-white truncate">{notif.title}</h4>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                      {!notif.read && (
                        <button
                          onClick={() => markNotificationRead(notif.id)}
                          className="mt-2 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
                        >
                          <Check className="w-3 h-3" /> Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
