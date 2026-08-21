import React from 'react';
import {
  X,
  UserPlus,
  MessageSquare,
  GraduationCap,
  Clock,
  Flag,
  UserCheck,
  UserX,
  Shield,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PostCard } from './PostCard';

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
  onReport: (targetUserId: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userId,
  onClose,
  onReport,
}) => {
  const {
    currentUser,
    users,
    posts,
    sendConnectRequest,
    setActiveTab,
    openDirectChat,
    setLightboxImage,
    toggleAdminRole,
    blacklistUser,
    unblacklistUser,
    deleteUserAccount,
  } = useApp();

  const targetUser = users.find((u) => u.id === userId);

  if (!currentUser || !targetUser) return null;

  const isSelf = currentUser.id === targetUser.id;
  const isConnected = currentUser.connections.includes(targetUser.id);
  const isPendingSent = currentUser.pendingRequestsSent.includes(targetUser.id);

  const targetUserPosts = posts.filter((p) => p.authorId === targetUser.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1C1F23] rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">NCE Member Profile</h3>
            {targetUser.isAdmin && (
              <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-300 dark:border-amber-700">
                <Shield className="w-3 h-3 text-amber-500" /> ADMIN
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Header Banner & Avatar */}
          <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-white/10 bg-slate-900 text-white relative">
            {/* Background Cover Photo */}
            <div className="h-32 sm:h-40 relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 overflow-hidden">
              {targetUser.coverImage ? (
                <img
                  src={targetUser.coverImage}
                  alt="Cover"
                  onClick={() => setLightboxImage({ src: targetUser.coverImage!, title: `${targetUser.name}'s Cover Photo` })}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-90" />
              )}
            </div>

            {/* Profile Info Row */}
            <div className="p-6 relative pt-0 -mt-12 bg-white dark:bg-[#1C1F23]">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <img
                  src={targetUser.avatar}
                  alt={targetUser.name}
                  onClick={() => setLightboxImage({ src: targetUser.avatar, title: targetUser.name })}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-white dark:ring-[#1C1F23] shadow-lg cursor-pointer shrink-0"
                  title="Click to expand profile picture"
                />
                <div className="text-center sm:text-left flex-1 min-w-0">
                  <h2 className="text-xl font-extrabold flex items-center justify-center sm:justify-start gap-2 flex-wrap text-slate-900 dark:text-white">
                    <span>{targetUser.name}</span>
                    {targetUser.isAdmin && (
                      <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        ADMIN
                      </span>
                    )}
                    {targetUser.isBlacklisted && (
                      <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> BLACKLISTED
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">@{targetUser.username}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1 mt-1">
                    <GraduationCap className="w-4 h-4 text-indigo-500" />
                    {targetUser.department} ({targetUser.role === 'alumni' ? `Graduated ${targetUser.gradYear}` : `Class of ${targetUser.gradYear}`})
                  </p>

                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    {!isSelf && (
                      <>
                        {isConnected ? (
                          <button
                            onClick={() => {
                              onClose();
                              openDirectChat(targetUser.id);
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow hover:bg-indigo-700 flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-4 h-4" /> Direct Message
                          </button>
                        ) : isPendingSent ? (
                          <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Pending Request
                          </span>
                        ) : (
                          <button
                            onClick={() => sendConnectRequest(targetUser.id)}
                            className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow hover:bg-indigo-700 flex items-center gap-1.5"
                          >
                            <UserPlus className="w-4 h-4" /> Send Request
                          </button>
                        )}

                        <button
                          onClick={() => onReport(targetUser.id)}
                          className="px-3 py-2 bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-700 dark:text-rose-300 font-semibold text-xs rounded-xl flex items-center gap-1"
                        >
                          <Flag className="w-3.5 h-3.5" /> Report
                        </button>
                      </>
                    )}

                    {/* Admin Actions */}
                    {currentUser.isAdmin && !isSelf && (
                      <>
                        <button
                          onClick={() => toggleAdminRole(targetUser.id)}
                          className={`px-3 py-2 font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all ${
                            targetUser.isAdmin
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200'
                              : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                          }`}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>{targetUser.isAdmin ? 'Revoke Admin' : 'Make Admin'}</span>
                        </button>

                        {targetUser.isBlacklisted ? (
                          <button
                            onClick={() => unblacklistUser(targetUser.id)}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Allow Access (Un-blacklist)</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => blacklistUser(targetUser.id)}
                            className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Blacklist User</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to permanently DELETE the account for @${targetUser.username} (${targetUser.name})?`)) {
                              deleteUserAccount(targetUser.id);
                              onClose();
                            }
                          }}
                          className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Account</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">About Bio</h4>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              {targetUser.bio || 'No bio provided by user.'}
            </p>
          </div>

          {/* Posts by this User */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Posts by {targetUser.name} ({targetUserPosts.length})
            </h4>
            {targetUserPosts.length === 0 ? (
              <p className="text-xs text-slate-400">No posts published yet.</p>
            ) : (
              targetUserPosts.map((post) => (
                <PostCard key={post.id} post={post} onReport={() => onReport(targetUser.id)} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
