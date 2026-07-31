import React, { useState } from 'react';
import { Search, X, GraduationCap, UserPlus, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SearchView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    currentUser,
    users,
    sendConnectRequest,
    setSelectedUserIdForView,
    setLightboxImage,
  } = useApp();

  const [query, setQuery] = useState('');

  if (!currentUser) return null;

  const results = users.filter((u) => {
    if (u.id === currentUser.id || !u.isApproved || u.isBlacklisted) return false;
    if (!query.trim()) return true; // Show top recommended peers
    const q = query.toLowerCase().replace('@', '');
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      u.gradYear.includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-md pt-16 px-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1C1F23] rounded-3xl max-w-xl w-full border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search students, alumni, departments (@username)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm sm:text-base bg-transparent text-slate-900 dark:text-white focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Stream */}
        <div className="overflow-y-auto p-4 space-y-2 flex-1 divide-y divide-slate-100 dark:divide-slate-800">
          {results.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">No matching campus members found.</div>
          ) : (
            results.map((user) => {
              const isConnected = currentUser.connections.includes(user.id);
              const isPending = currentUser.pendingRequestsSent.includes(user.id);

              return (
                <div
                  key={user.id}
                  className="pt-2 pb-2 px-2 rounded-2xl flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div
                    className="flex items-center gap-3 min-w-0 cursor-pointer"
                    onClick={() => {
                      setSelectedUserIdForView(user.id);
                      onClose();
                    }}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxImage({ src: user.avatar, title: user.name });
                      }}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {user.name}
                      </h4>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                        @{user.username}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{user.department}</p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isConnected ? (
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-xl">
                        Connected
                      </span>
                    ) : isPending ? (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-xl">
                        Pending
                      </span>
                    ) : (
                      <button
                        onClick={() => sendConnectRequest(user.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Connect
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
