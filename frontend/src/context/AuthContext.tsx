import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from '../api';
import { User, Employee, UserRole, AppNotification } from '../types';

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  role: UserRole;
  loading: boolean;
  notifications: AppNotification[];
  unreadCount: number;
  login: (name: string | undefined, email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [role, setRole] = useState<UserRole>('MANAGER');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Socket connection
  useEffect(() => {
    const socket: Socket = io('http://127.0.0.1:5000');

    socket.on('connect', () => {
      // connected
    });

    socket.on('EMERGENCY_DISRUPTION', (data) => {
      refreshNotifications();
    });

    socket.on('ASSIGNMENT_APPROVED', () => {
      refreshNotifications();
      refreshUser();
    });

    socket.on('RECOVERY_APPROVED', () => {
      refreshNotifications();
      refreshUser();
    });

    socket.on('SKILL_VERIFIED', () => {
      refreshNotifications();
      refreshUser();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const refreshUser = async () => {
    const token = localStorage.getItem('workforce_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      setUser(data.user);
      setRole(data.user.role);
      if (data.employee) {
        setEmployee(data.employee);
      }
      await refreshNotifications();
    } catch (e) {
      localStorage.removeItem('workforce_token');
      setUser(null);
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch (e) {
      // ignore
    }
  };

  const login = async (name: string | undefined, email: string, password: string, role?: UserRole) => {
    setLoading(true);
    try {
      const res = await api.login({ name, email, password, role });
      localStorage.setItem('workforce_token', res.token);
      localStorage.setItem('workforce_demo_role', res.user.role);
      setUser(res.user);
      setRole(res.user.role);

      if (res.user.employeeRef) {
        try {
          const empRes = await api.getEmployeeById(res.user.employeeRef);
          setEmployee(empRes.employee);
        } catch {
          setEmployee(null);
        }
      } else {
        setEmployee(null);
      }

      await refreshNotifications();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('workforce_token');
    localStorage.removeItem('workforce_demo_role');
    setUser(null);
    setEmployee(null);
  };

  const switchRole = async (newRole: UserRole) => {
    setLoading(true);
    try {
      const res = await api.quickDemoLogin(newRole);
      localStorage.setItem('workforce_token', res.token);
      localStorage.setItem('workforce_demo_role', newRole);
      setUser(res.user);
      setRole(newRole);

      if (res.user.employeeRef) {
        const empRes = await api.getEmployeeById(res.user.employeeRef);
        setEmployee(empRes.employee);
      } else {
        setEmployee(null);
      }

      await refreshNotifications();
    } catch (err) {
      console.error('Failed to switch demo role', err);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('workforce_token');
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        employee,
        role,
        loading,
        notifications,
        unreadCount,
        login,
        logout,
        switchRole,
        refreshUser,
        refreshNotifications,
        markNotificationRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
