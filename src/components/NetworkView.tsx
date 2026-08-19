import React, { useState } from 'react';
import { UserCheck, UserPlus, Search, GraduationCap, Check, X, Clock, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NetworkView: React.FC = () => {
  const {
    currentUser,
    users,
    sendConnectRequest,
    acceptConnectRequest,
    declineConnectRequest,
    setSelectedUserIdForView,
    setLightboxImage,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'alumni'>('all');

  if (!currentUser) return null;

  // Received pending requests
  const pendingRequestsUsers = users.filter(
    (u) => currentUser.pendingRequestsReceived.includes(u.id) && !u.isBlacklisted
  );

  // Users to discover
  const discoverableUsers = users.filter((u) => {
    if (u.id === currentUser.id || !u.isApproved || u.isBlacklisted) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.gradYear.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-24 sm:pb-20 lg:pb-12">
      {/* Received Pending Connect Requests Received Banner */}
      {pendingRequestsUsers.length > 0 && (
        <div className="bg-indigo-950/40 dark:bg-indigo-950/40 rounded-3xl p-5 border border-indigo-500/30 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-400" />
              <span>Pending Connection Requests ({pendingRequestsUsers.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingRequestsUsers.map((requester) => (
              <div
                key={requester.id}
                className="bg-white dark:bg-[#1C1F23] p-4 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 shadow-sm"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer min-w-0"
                  onClick={() => setSelectedUserIdForView(requester.id)}
                >
                  <img
                    src={requester.avatar}
                    alt={requester.name}
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {requester.name}
                    </h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                      @{requester.username}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{requester.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => acceptConnectRequest(requester.id)}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                    title="Accept Connect Request"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => declineConnectRequest(requester.id)}
                    className="p-2 bg-slate-100 dark:bg-[#2A2E35] hover:bg-rose-100 text-slate-600 hover:text-rose-600 dark:hover:bg-rose-950 rounded-xl text-xs transition-colors"
                    title="Decline"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Network Header & Filters */}
      <div className="bg-white dark:bg-[#1C1F23] rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">NCE Campus Directory</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Connect with students and alumni across all university departments.</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, username (@), major, or batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#2A2E35] border border-slate-200 dark:border-white/5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#2A2E35] p-1 rounded-2xl w-full sm:w-auto">
            {(['all', 'student', 'alumni'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  roleFilter === r
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r === 'all' ? 'All Roles' : r === 'student' ? 'Students' : 'Alumni'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Peer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {discoverableUsers.map((peer) => {
          const isConnected = currentUser.connections.includes(peer.id);
          const isPendingSent = currentUser.pendingRequestsSent.includes(peer.id);

          return (
            <div
              key={peer.id}
              className="bg-white dark:bg-[#1C1F23] rounded-3xl p-5 border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <img
                    src={peer.avatar}
                    alt={peer.name}
                    onClick={() => setLightboxImage({ src: peer.avatar, title: peer.name })}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500/20 cursor-pointer"
                  />
                  {peer.role === 'alumni' ? (
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Alumni '{peer.gradYear}
                    </span>
                  ) : (
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                      Student '{peer.gradYear}
                    </span>
                  )}
                </div>

                <h3
                  onClick={() => setSelectedUserIdForView(peer.id)}
                  className="font-bold text-slate-900 dark:text-white text-base hover:text-indigo-600 cursor-pointer"
                >
                  {peer.name}
                </h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
                  @{peer.username}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                  {peer.department}
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">
                  {peer.bio || 'No bio provided.'}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                {isConnected ? (
                  <button
                    onClick={() => setActiveTab('messaging')}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" /> Direct Message
                  </button>
                ) : isPendingSent ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl text-xs font-semibold cursor-not-allowed"
                  >
                    <Clock className="w-4 h-4" /> Connection Request Sent
                  </button>
                ) : (
                  <button
                    onClick={() => sendConnectRequest(peer.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
                  >
                    <UserPlus className="w-4 h-4" /> Send Request to Connect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
