import React, { useEffect, useState } from 'react';
import { History, Shield, Filter, Clock, Search } from 'lucide-react';
import { api } from '../../api';
import { AuditLog } from '../../types';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.getAuditLogs();
      setLogs(res.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.userName.toLowerCase().includes(q) ||
      l.entity.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              Immutable Governance Stream
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">System Audit & Assignment History</h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
            Tamper-evident record of all optimization executions, team approvals, recovery interventions,
            and badge issuance events.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter audit logs..."
            className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 w-64"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400 bg-slate-950/50">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Initiator</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-white block">{log.userName}</span>
                    <span className="text-[10px] text-indigo-400 font-sans">{log.userRole}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-bold text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-sans">{log.entity}</td>
                  <td className="py-3 px-4 font-sans text-slate-300 max-w-md truncate">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
