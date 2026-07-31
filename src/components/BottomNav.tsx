import React from 'react';
import { Home, Users, MessageSquare, User as UserIcon, PlusCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BottomNavProps {
  onOpenCreatePost: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenCreatePost }) => {
  const { currentUser, activeTab, setActiveTab } = useApp();

  if (!currentUser) return null;

  const pendingRequestsCount = currentUser.pendingRequestsReceived.length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1C1F23]/95 backdrop-blur-md border-t border-slate-200 dark:border-white/10 lg:hidden px-2 py-1.5 flex items-center justify-around shadow-2xl">
      <button
        onClick={() => setActiveTab('feed')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors ${
          activeTab === 'feed'
            ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Feed</span>
      </button>

      <button
        onClick={() => setActiveTab('network')}
        className={`relative flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors ${
          activeTab === 'network'
            ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Users className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Network</span>
        {pendingRequestsCount > 0 && (
          <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
        )}
      </button>

      {/* Floating Create Post Button */}
      <button
        onClick={onOpenCreatePost}
        className="flex flex-col items-center justify-center -mt-5 p-3 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform"
      >
        <PlusCircle className="w-6 h-6" />
      </button>

      <button
        onClick={() => setActiveTab('messaging')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors ${
          activeTab === 'messaging'
            ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Chat</span>
      </button>

      <button
        onClick={() => setActiveTab('me')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors ${
          activeTab === 'me'
            ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <UserIcon className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Me</span>
      </button>

      {currentUser.isAdmin && (
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors ${
            activeTab === 'admin'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <ShieldCheck className="w-5 h-5 text-purple-500" />
          <span className="text-[10px] mt-0.5">Activity</span>
        </button>
      )}
    </div>
  );
};
