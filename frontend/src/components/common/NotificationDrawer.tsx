import React from 'react';
import { X, Bell, AlertTriangle, ShieldCheck, UserCheck, Calendar, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
        return <AlertTriangle className="w-4 h-4 text-black" />;
      case 'VERIFICATION':
        return <ShieldCheck className="w-4 h-4 text-black" />;
      case 'ASSIGNMENT':
        return <UserCheck className="w-4 h-4 text-black" />;
      case 'MEETING':
        return <Calendar className="w-4 h-4 text-black" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-zinc-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-zinc-900" />
              <h3 className="font-bold text-zinc-900 text-sm">Notifications & Alerts</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-800 font-mono font-bold">
                {notifications.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs text-zinc-500 mt-1">Live alerts will appear here in real time</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border transition ${
                    notif.read
                      ? 'bg-white border-zinc-100 text-zinc-500'
                      : 'bg-zinc-50 border-zinc-300 text-zinc-900 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-zinc-900 truncate">{notif.title}</h4>
                        <span className="text-[10px] text-zinc-400 whitespace-nowrap font-mono">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{notif.message}</p>
                      {!notif.read && (
                        <button
                          onClick={() => markNotificationRead(notif.id)}
                          className="mt-2 text-[11px] text-black font-semibold hover:underline flex items-center gap-1 transition"
                        >
                          <Check className="w-3 h-3" /> Mark read
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
