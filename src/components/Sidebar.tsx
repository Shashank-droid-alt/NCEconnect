import React from 'react';
import {
  Home,
  Users,
  MessageSquare,
  User as UserIcon,
  ShieldCheck,
  PlusCircle,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  onOpenCreatePost: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCreatePost }) => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    posts,
    setLightboxImage,
    setSelectedUserIdForView,
  } = useApp();

  if (!currentUser) return null;

  const myPostsCount = posts.filter((p) => p.authorId === currentUser.id).length;
  const pendingRequestsCount = currentUser.pendingRequestsReceived.length;

  interface NavItem {
    id: 'feed' | 'network' | 'messaging' | 'me' | 'admin';
    label: string;
    icon: React.ElementType;
    badge?: number | string | null;
  }

  const navItems: NavItem[] = [
    { id: 'feed', label: 'Home Feed', icon: Home },
    {
      id: 'network',
      label: 'My Network',
      icon: Users,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
    },
    { id: 'messaging', label: 'Messaging', icon: MessageSquare },
    { id: 'me', label: 'Me & Activity', icon: UserIcon },
  ];

  if (currentUser.isAdmin) {
    navItems.push({
      id: 'admin',
      label: 'Activity Stream',
      icon: ShieldCheck,
      badge: 'Live',
    });
  }

  return (
    <aside className="w-64 shrink-0 hidden lg:block space-y-4">
      {/* Mini Profile Card */}
      <div className="bg-white dark:bg-[#1C1F23] rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm text-center relative overflow-hidden">
        {/* Cover Accent */}
        <div className="h-16 -mx-5 -top-5 bg-indigo-600/30 relative mb-12">
          {/* Avatar floating */}
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              onClick={() => setLightboxImage({ src: currentUser.avatar, title: currentUser.name })}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white dark:ring-[#1C1F23] shadow-xl cursor-pointer hover:opacity-90 transition-opacity"
              title="Click to view full photo"
            />
          </div>
        </div>

        <h3
          onClick={() => {
            setSelectedUserIdForView(currentUser.id);
            setActiveTab('me');
          }}
          className="font-bold text-base text-slate-900 dark:text-white hover:text-indigo-400 cursor-pointer transition-colors"
        >
          {currentUser.name}
        </h3>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-2">
          @{currentUser.username}
        </p>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 px-2 mb-4 font-normal">
          {currentUser.bio || 'No bio added yet.'}
        </p>

        <div className="pt-3 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-2 text-center text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[9px] block uppercase tracking-widest font-bold">
              Connections
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
              {currentUser.connections.length}
            </span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[9px] block uppercase tracking-widest font-bold">
              Posts
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
              {myPostsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <nav className="bg-white dark:bg-[#1C1F23] rounded-2xl border border-slate-200 dark:border-white/10 p-2 space-y-1 shadow-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2A2E35]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white text-indigo-700' : 'bg-rose-500 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Action Button */}
      <button
        onClick={onOpenCreatePost}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-98 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all"
      >
        <PlusCircle className="w-5 h-5" />
        <span>Create Post</span>
      </button>

      {/* Campus Info Card */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
          <GraduationCap className="w-4 h-4 text-indigo-500" />
          <span>National College of Eng.</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          {currentUser.department} ({currentUser.role === 'alumni' ? `Graduated ${currentUser.gradYear}` : `Class of ${currentUser.gradYear}`})
        </p>
      </div>
    </aside>
  );
};
