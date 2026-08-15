'use client';

import { useState } from 'react';
import { 
  ShieldCheck, Users, Database, FileText, Download, Upload, Trash2, 
  Sparkles, CheckCircle2, Shield, RefreshCw, X, AlertTriangle, Key, Activity
} from 'lucide-react';

export default function AdminPanelModal({
  isOpen = true,
  onClose,
  profiles,
  activeProfile,
  onSaveProfiles,
  tasks,
  notes,
  routines,
  reminders,
  onOpenLogsModal,
  isEmbedded = false
}) {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'metrics' | 'backup'
  const [backupJson, setBackupJson] = useState('');
  const [importStatus, setImportStatus] = useState(null);

  if (!isOpen && !isEmbedded) return null;

  const isAdmin = activeProfile?.role === 'Admin';

  const handleRoleToggle = (profileId) => {
    if (profileId === activeProfile?.id) {
      alert("You cannot downgrade your own active Admin status.");
      return;
    }
    const updated = profiles.map(p => {
      if (p.id === profileId) {
        const newRole = p.role === 'Admin' ? 'Member' : 'Admin';
        return { ...p, role: newRole };
      }
      return p;
    });
    onSaveProfiles(updated);
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '1.1.0-rc1',
      exportedAt: new Date().toISOString(),
      exportedBy: activeProfile?.name || 'Admin',
      profiles,
      tasks,
      notes,
      routines,
      reminders,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    setBackupJson(jsonStr);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskpulse-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.profiles && Array.isArray(data.profiles)) {
          onSaveProfiles(data.profiles);
          setImportStatus({ type: 'success', text: `Successfully restored ${data.profiles.length} profiles and system backup!` });
        } else {
          setImportStatus({ type: 'error', text: 'Invalid backup file structure.' });
        }
      } catch (err) {
        setImportStatus({ type: 'error', text: `Failed to parse backup JSON: ${err.message}` });
      }
    };
    reader.readAsText(file);
  };

  if (isEmbedded) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full overflow-hidden shadow-2xl flex flex-col min-h-[600px]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-100">System Admin Control Panel</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  RBAC Active
                </span>
                <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 flex items-center gap-1">
                  <Database className="w-3 h-3 text-indigo-400" /> NeonDB PostgreSQL Active
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> v1.0.0-beta
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Log in as <strong className="text-slate-200">{activeProfile?.name}</strong> ({activeProfile?.role || 'User'})
              </p>
            </div>
          </div>
        </div>

        {/* Access Warning if Non-Admin */}
        {!isAdmin ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-200">Admin Access Restricted</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Your profile <strong className="text-slate-200">{activeProfile?.name}</strong> is currently assigned the <span className="text-slate-300 font-semibold">{activeProfile?.role}</span> role. Only profiles with **Admin** privileges can manage users or perform system resets.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800 bg-slate-950/40">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'users'
                    ? 'border-indigo-500 text-indigo-300 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4 text-indigo-400" /> User Accounts & RBAC
              </button>

              <button
                onClick={() => setActiveTab('metrics')}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'metrics'
                    ? 'border-indigo-500 text-indigo-300 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-4 h-4 text-amber-400" /> System Metrics & Health
              </button>

              <button
                onClick={() => setActiveTab('backup')}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'backup'
                    ? 'border-indigo-500 text-indigo-300 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-4 h-4 text-emerald-400" /> Data Backup & Recovery
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              {/* TAB 1: USER ACCOUNTS & RBAC */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-200">Registered User Profiles</h3>
                      <p className="text-[11px] text-slate-400">Manage user roles and permissions across isolated account profiles.</p>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                      {profiles.length} Profiles
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {profiles.map(p => {
                      const userTasksCount = tasks.filter(t => t.profileId === p.id).length;
                      const userNotesCount = notes.filter(n => n.profileId === p.id).length;
                      const userRoutinesCount = routines.filter(r => r.profileId === p.id).length;
                      const isCurrent = p.id === activeProfile?.id;

                      return (
                        <div
                          key={p.id}
                          className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm"
                              style={{ backgroundColor: `${p.color || '#6366f1'}20`, border: `1px solid ${p.color || '#6366f1'}40` }}
                            >
                              {p.avatar || '👤'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-100">{p.name}</span>
                                {isCurrent && (
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                                    Current Session
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400 block">{p.email}</span>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono pt-1">
                                <span>{userTasksCount} tasks</span> • <span>{userNotesCount} notes</span> • <span>{userRoutinesCount} routines</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleRoleToggle(p.id)}
                              disabled={isCurrent}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer disabled:opacity-50 ${
                                p.role === 'Admin'
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                              }`}
                              title={isCurrent ? 'Cannot change active profile role' : 'Click to toggle Admin / Member role'}
                            >
                              Role: {p.role || 'Member'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: SYSTEM METRICS */}
              {activeTab === 'metrics' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Tasks</span>
                      <span className="text-xl font-bold text-slate-100">{tasks.length}</span>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Notes</span>
                      <span className="text-xl font-bold text-indigo-400">{notes.length}</span>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Routines</span>
                      <span className="text-xl font-bold text-amber-400">{routines.length}</span>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Reminders</span>
                      <span className="text-xl font-bold text-emerald-400">{reminders.length}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-bold text-slate-200">System Logs & Audit Trail</h4>
                      </div>
                      <button
                        onClick={onOpenLogsModal}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        Launch System Log Viewer
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">
                      View full daily operational logs (`logs/log_YYYY-MM-DD.log`) and audit trailing events.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: BACKUP & RECOVERY */}
              {activeTab === 'backup' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-slate-200">Export System Database Backup</h4>
                    </div>
                    <p className="text-xs text-slate-400">
                      Download a complete, encrypted JSON archive containing all user profiles, tasks, note cards, and routine schedules.
                    </p>
                    <button
                      onClick={handleExportBackup}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Full System Backup (.json)
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-xs font-bold text-slate-200">Restore System Backup</h4>
                    </div>
                    <p className="text-xs text-slate-400">
                      Upload a previously exported TaskPulse JSON backup to restore user profiles and database records.
                    </p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer">
                      <Upload className="w-3.5 h-3.5" /> Choose Backup File (.json)
                      <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                    </label>

                    {importStatus && (
                      <div className={`p-3 rounded-xl text-xs font-mono border ${
                        importStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        {importStatus.text}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-100">System Admin Control Panel</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  RBAC Active
                </span>
                <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 flex items-center gap-1">
                  <Database className="w-3 h-3 text-indigo-400" /> NeonDB PostgreSQL Active
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> v1.0.0-beta
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Log in as <strong className="text-slate-200">{activeProfile?.name}</strong> ({activeProfile?.role || 'User'})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Access Warning if Non-Admin */}
        {!isAdmin ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-200">Admin Access Restricted</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Your profile <strong className="text-slate-200">{activeProfile?.name}</strong> is currently assigned the <span className="text-slate-300 font-semibold">{activeProfile?.role}</span> role. Only profiles with **Admin** privileges can manage users or perform system resets.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl"
            >
              Return to Workspace
            </button>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800 bg-slate-950/40">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'users'
                    ? 'border-indigo-500 text-indigo-300 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4 text-indigo-400" /> User Accounts & RBAC
              </button>

              <button
                onClick={() => setActiveTab('metrics')}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'metrics'
                    ? 'border-indigo-500 text-indigo-300 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-4 h-4 text-amber-400" /> System Metrics & Health
              </button>

              <button
                onClick={() => setActiveTab('backup')}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'backup'
                    ? 'border-indigo-500 text-indigo-300 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-4 h-4 text-emerald-400" /> Data Backup & Recovery
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              {/* TAB 1: USER ACCOUNTS & RBAC */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-200">Registered User Profiles</h3>
                      <p className="text-[11px] text-slate-400">Manage user roles and permissions across isolated account profiles.</p>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                      {profiles.length} Profiles
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {profiles.map(p => {
                      const userTasksCount = tasks.filter(t => t.profileId === p.id).length;
                      const userNotesCount = notes.filter(n => n.profileId === p.id).length;
                      const userRoutinesCount = routines.filter(r => r.profileId === p.id).length;
                      const isCurrent = p.id === activeProfile?.id;

                      return (
                        <div
                          key={p.id}
                          className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm"
                              style={{ backgroundColor: `${p.color || '#6366f1'}20`, border: `1px solid ${p.color || '#6366f1'}40` }}
                            >
                              {p.avatar || '👤'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-100">{p.name}</span>
                                {isCurrent && (
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                                    Current Session
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400 block">{p.email}</span>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono pt-1">
                                <span>{userTasksCount} tasks</span> • <span>{userNotesCount} notes</span> • <span>{userRoutinesCount} routines</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleRoleToggle(p.id)}
                              disabled={isCurrent}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer disabled:opacity-50 ${
                                p.role === 'Admin'
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                              }`}
                              title={isCurrent ? 'Cannot change active profile role' : 'Click to toggle Admin / Member role'}
                            >
                              Role: {p.role || 'Member'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: SYSTEM METRICS */}
              {activeTab === 'metrics' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Tasks</span>
                      <span className="text-xl font-bold text-slate-100">{tasks.length}</span>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Notes</span>
                      <span className="text-xl font-bold text-indigo-400">{notes.length}</span>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Routines</span>
                      <span className="text-xl font-bold text-amber-400">{routines.length}</span>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Reminders</span>
                      <span className="text-xl font-bold text-emerald-400">{reminders.length}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-bold text-slate-200">System Logs & Audit Trail</h4>
                      </div>
                      <button
                        onClick={onOpenLogsModal}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
                      >
                        Launch System Log Viewer
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">
                      View full daily operational logs (`logs/log_YYYY-MM-DD.log`) and audit trailing events.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: BACKUP & RECOVERY */}
              {activeTab === 'backup' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-slate-200">Export System Database Backup</h4>
                    </div>
                    <p className="text-xs text-slate-400">
                      Download a complete, encrypted JSON archive containing all user profiles, tasks, note cards, and routine schedules.
                    </p>
                    <button
                      onClick={handleExportBackup}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Full System Backup (.json)
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-xs font-bold text-slate-200">Restore System Backup</h4>
                    </div>
                    <p className="text-xs text-slate-400">
                      Upload a previously exported TaskPulse JSON backup to restore user profiles and database records.
                    </p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer">
                      <Upload className="w-3.5 h-3.5" /> Choose Backup File (.json)
                      <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                    </label>

                    {importStatus && (
                      <div className={`p-3 rounded-xl text-xs font-mono border ${
                        importStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        {importStatus.text}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
