import React, { useState } from 'react';
import {
  Shield,
  UserCheck,
  UserX,
  Trash2,
  ShieldAlert,
  Activity,
  X,
  AlertTriangle,
  CheckCircle,
  Users,
  Flag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminConsoleBar: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    users,
    adminLogs,
    reports,
    approveUser,
    rejectUser,
    deleteUserRequest,
    blacklistUser,
    unblacklistUser,
    deleteUserAccount,
    toggleAdminRole,
    clearAdminLogs,
    deletePost,
    setLightboxImage,
    setSelectedUserIdForView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'logs' | 'reports' | 'all_users'>('pending');

  const pendingUsers = users.filter((u) => !u.isApproved && !u.isBlacklisted);
  const reportedUsers = users.filter((u) => u.reportCount > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1C1F23] rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Console Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-200" />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-sm sm:text-lg flex items-center gap-2 truncate">
                Campus Advisory Activity Stream
              </h2>
              <p className="text-[10px] sm:text-xs text-indigo-200 truncate">
                Platform Control Center • Member Requests & Live Event Monitor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-3 sm:px-6 py-3 bg-slate-50 dark:bg-[#2A2E35] border-b border-slate-200 dark:border-white/10 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pending'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Pending Approvals</span>
            {pendingUsers.length > 0 && (
              <span className="bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold">
                {pendingUsers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'logs'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Live Activity Log ({adminLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reports'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Flag className="w-4 h-4 text-rose-400" />
            <span>User Reports ({reports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('all_users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all_users'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Member Directory ({users.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: Pending Approvals */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {pendingUsers.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    All new account requests have been processed!
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Newly registered students and alumni will appear here for verification.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {pendingUsers.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white dark:bg-slate-800 p-5 rounded-2xl border-2 border-amber-300 dark:border-amber-700/80 shadow-md flex flex-col justify-between"
                    >
                      <div>
                        {/* Header Badge */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.avatar}
                              alt={p.name}
                              onClick={() => setLightboxImage({ src: p.avatar, title: p.name })}
                              className="w-12 h-12 rounded-full object-cover shrink-0 cursor-pointer ring-2 ring-indigo-500/30"
                            />
                            <div>
                              <h4 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                                <span>{p.name}</span>
                                <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700 uppercase">
                                  ON HOLD
                                </span>
                              </h4>
                              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">@{p.username}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            ID: {p.id}
                          </span>
                        </div>

                        {/* Detailed Examination Data Grid */}
                        <div className="mt-3 bg-slate-50 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
                          <p className="font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                            <Shield className="w-3 h-3" /> Submitted Examination Record:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 font-mono text-[11px]">
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
                              <span className="text-slate-400 block font-sans text-[10px]">1. Full Name:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-100">{p.name}</span>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
                              <span className="text-slate-400 block font-sans text-[10px]">2. Branch / Dept:</span>
                              <span className="font-bold text-indigo-600 dark:text-indigo-300 truncate block">{p.department}</span>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
                              <span className="text-slate-400 block font-sans text-[10px]">3. Email ID:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-100 truncate block">{p.email}</span>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
                              <span className="text-slate-400 block font-sans text-[10px]">4. Passout Year:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-100">{p.gradYear} ({p.role.toUpperCase()})</span>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
                              <span className="text-slate-400 block font-sans text-[10px]">5. Date of Birth:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-100">{p.dob || 'N/A'}</span>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
                              <span className="text-slate-400 block font-sans text-[10px]">6. Roll Number:</span>
                              <span className="font-bold text-amber-600 dark:text-amber-400">{p.rollNumber || 'N/A'}</span>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
                              <span className="text-slate-400 block font-sans text-[10px]">7. Instagram Handle:</span>
                              <span className="font-bold text-indigo-500">@{p.username}</span>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
                              <span className="text-slate-400 block font-sans text-[10px]">8. Account Password:</span>
                              <span className="font-bold text-rose-500">●●●●●●●●</span>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
                              <span className="text-slate-400 block font-sans text-[10px]">9. Registration No:</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">{p.registrationNumber || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Admin Decision Action Controls */}
                      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => approveUser(p.id)}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                        >
                          <UserCheck className="w-4 h-4" /> Accept & Approve Access
                        </button>
                        <button
                          onClick={() => rejectUser(p.id)}
                          className="py-2.5 px-4 bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 text-amber-800 dark:text-amber-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                        >
                          <UserX className="w-4 h-4" /> Reject Request
                        </button>
                        <button
                          onClick={() => deleteUserRequest(p.id)}
                          className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-rose-600/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Live Activity Log Stream */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 font-semibold">System Audit Trail ({adminLogs.length} events)</p>
                {adminLogs.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all platform activity logs?')) {
                        clearAdminLogs();
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors border border-rose-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Activity Logs</span>
                  </button>
                )}
              </div>

              {adminLogs.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-slate-500 font-medium">No activity logs recorded.</p>
                </div>
              ) : (
                adminLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3"
                  >
                    <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1">
                          @{log.actorUsername}
                        </span>
                        ({log.actorName}): {log.details}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Reports & Auto Blacklist System */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 shrink-0 text-amber-600" />
                <span>
                  <strong>Safety Policy Enforcement:</strong> Accounts that receive 3 user reports are automatically deleted and blacklisted from NCEconnect by the platform engine.
                </span>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">No user reports filed.</div>
              ) : (
                <div className="space-y-3">
                  {reports.map((rep) => {
                    const target = users.find((u) => u.id === rep.targetUserId);
                    return (
                      <div
                        key={rep.id}
                        className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 shadow-sm"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Reported User: <span className="text-rose-600 font-mono">@{rep.targetUsername}</span>
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                            Reason: "{rep.reason}" (Reported by @{rep.reporterUsername})
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Target Report Count: {target?.reportCount || 0} / 3 {target?.isBlacklisted ? '• (AUTO-BLACKLISTED)' : ''}
                          </p>
                        </div>

                        {target && !target.isBlacklisted && (
                          <button
                            onClick={() => blacklistUser(target.id)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow shrink-0"
                          >
                            Blacklist Now
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: All Member Directory */}
          {activeTab === 'all_users' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className={`bg-white dark:bg-slate-800 p-4 rounded-2xl border ${
                      u.isBlacklisted
                        ? 'border-rose-400 dark:border-rose-900 bg-rose-50/20 dark:bg-rose-950/20'
                        : 'border-slate-200 dark:border-slate-700'
                    } flex flex-col justify-between gap-3 shadow-sm`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        onClick={() => setLightboxImage({ src: u.avatar, title: u.name })}
                        className="w-10 h-10 rounded-full object-cover shrink-0 cursor-pointer ring-2 ring-indigo-500/20"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {u.name}
                          </h4>
                          {u.isAdmin && (
                            <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-300 dark:border-amber-700">
                              <Shield className="w-3 h-3 text-amber-500" /> ADMIN
                            </span>
                          )}
                          {u.isBlacklisted && (
                            <span className="bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-300 dark:border-rose-800">
                              <ShieldAlert className="w-3 h-3 text-rose-500" /> BLACKLISTED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">@{u.username}</p>
                        <p className="text-[10px] text-slate-400 truncate">{u.department} ({u.role.toUpperCase()})</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-700">
                      {/* Admin Toggle */}
                      <button
                        onClick={() => toggleAdminRole(u.id)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1 ${
                          u.isAdmin
                            ? 'bg-amber-100 dark:bg-amber-950 hover:bg-amber-200 text-amber-800 dark:text-amber-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                        title={u.isAdmin ? 'Revoke Admin Privileges' : 'Grant Admin Privileges'}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>{u.isAdmin ? 'Remove Admin' : 'Make Admin'}</span>
                      </button>

                      {/* Blacklist / Un-blacklist Toggle */}
                      {u.isBlacklisted ? (
                        <button
                          onClick={() => unblacklistUser(u.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-sm"
                          title="Allow user access again"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Allow Access</span>
                        </button>
                      ) : (
                        !u.isAdmin && (
                          <button
                            onClick={() => blacklistUser(u.id)}
                            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-xl text-[11px] font-bold border border-amber-500/30 flex items-center gap-1"
                            title="Blacklist account"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Blacklist</span>
                          </button>
                        )
                      )}

                      {/* Permanent Delete Account */}
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to permanently DELETE the account for @${u.username} (${u.name})? This action cannot be undone.`)) {
                            deleteUserAccount(u.id);
                          }
                        }}
                        className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-sm shadow-rose-600/20"
                        title="Delete entire user account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
