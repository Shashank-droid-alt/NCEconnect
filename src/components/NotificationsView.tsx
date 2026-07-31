import React from 'react';
import { Bell, Heart, MessageCircle, UserPlus, AtSign, CheckCheck, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationsView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    currentUser,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setSelectedUserIdForView,
    setActiveTab,
  } = useApp();

  if (!currentUser) return null;

  const myNotifications = notifications.filter((n) => n.userId === currentUser.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1C1F23] rounded-3xl max-w-lg w-full border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Campus Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-4 space-y-2 flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
          {myNotifications.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">No notifications yet.</div>
          ) : (
            myNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  markNotificationRead(item.id);
                  if (item.type === 'connect_request' || item.type === 'connect_accept') {
                    setActiveTab('network');
                  } else {
                    setActiveTab('feed');
                  }
                  onClose();
                }}
                className={`pt-2.5 pb-2 px-3 rounded-2xl flex items-start gap-3 cursor-pointer transition-colors ${
                  !item.read
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <img
                  src={item.actorAvatar}
                  alt={item.actorName}
                  className="w-10 h-10 rounded-full object-cover shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                    <span className="font-bold text-slate-900 dark:text-white mr-1">{item.actorName}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold mr-1">
                      @{item.actorUsername}
                    </span>
                    {item.message}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
