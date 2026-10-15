import React, { useState } from 'react';
import { Sparkles, ArrowRight, User, Mail, Lock, Shield, Briefcase, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const MinimalLogin: React.FC = () => {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123');
  const [role, setRole] = useState<UserRole>('MANAGER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide an email address.');
      return;
    }
    if (!password) {
      setError('Please provide a password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(name.trim() || undefined, email.trim(), password, role);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for convenience
  const fillSample = (sampleRole: UserRole, sampleName: string, sampleEmail: string) => {
    setRole(sampleRole);
    setName(sampleName);
    setEmail(sampleEmail);
    setPassword('123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center px-4 py-12 select-none">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-black text-white shadow-sm mb-1">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Workforce Intelligence AI
          </h1>
          <p className="text-xs text-zinc-500">
            Enter your employee name, email ID, and password to sign in.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-300 flex items-center gap-2 text-xs text-zinc-900">
            <AlertCircle className="w-4 h-4 text-zinc-900 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Minimal Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Portal / Role selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 block">
              Select Portal / Role
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200">
              <button
                type="button"
                onClick={() => setRole('MANAGER')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  role === 'MANAGER'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Manager
              </button>
              <button
                type="button"
                onClick={() => setRole('EMPLOYEE')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  role === 'EMPLOYEE'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Employee
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  role === 'ADMIN'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </button>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 block">
              Employee / User Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Marcus Vance or Rahul Sharma"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black transition"
              />
            </div>
          </div>

          {/* Email ID Field */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 block">
              Email ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@workforce.ai"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black transition"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 block">
                Password
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">Default: 123</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="123"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black transition font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Sample Autofil Options */}
        <div className="pt-2 border-t border-zinc-100 text-center space-y-2">
          <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
            Quick Auto-Fill (Optional)
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => fillSample('MANAGER', 'Marcus Vance', 'marcus.vance@workforce.ai')}
              className="px-2.5 py-1 rounded-lg border border-zinc-200 hover:border-zinc-400 text-zinc-700 bg-white transition"
            >
              Manager Sample
            </button>
            <button
              type="button"
              onClick={() => fillSample('EMPLOYEE', 'Rahul Sharma', 'rahul.sharma@workforce.ai')}
              className="px-2.5 py-1 rounded-lg border border-zinc-200 hover:border-zinc-400 text-zinc-700 bg-white transition"
            >
              Employee Sample
            </button>
            <button
              type="button"
              onClick={() => fillSample('ADMIN', 'Sarah Jenkins', 'admin@workforce.ai')}
              className="px-2.5 py-1 rounded-lg border border-zinc-200 hover:border-zinc-400 text-zinc-700 bg-white transition"
            >
              Admin Sample
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
