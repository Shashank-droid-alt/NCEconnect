import React, { useState } from 'react';
import {
  GraduationCap,
  Sun,
  Moon,
  Bell,
  Search,
  Shield,
  UserCheck,
  ChevronDown,
  LogOut,
  UserPlus,
  MoreVertical,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onOpenAuthModal: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenAdminConsole: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuthModal,
  onOpenSearch,
  onOpenNotifications,
  onOpenAdminConsole,
}) => {
  const {
    currentUser,
    users,
    switchUser,
    logoutUser,
    theme,
    toggleTheme,
    notifications,
    adminLogs,
    setActiveTab,
    setSelectedUserIdForView,
    setLightboxImage,
  } = useApp();

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const unreadNotificationsCount = notifications.filter(
    (n) => n.userId === currentUser?.id && !n.read
  ).length;

  const pendingApprovalsCount = users.filter((u) => !u.isApproved && !u.isBlacklisted).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#1C1F23]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Logo */}
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0"
          onClick={() => setActiveTab('feed')}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-black text-lg sm:text-xl tracking-tighter text-slate-900 dark:text-white">
                <span className="text-indigo-600 dark:text-indigo-400">NCE</span>connect
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold px-1 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                Campus
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hidden md:block">
              University Students & Alumni Network
            </p>
          </div>
        </div>

        {/* Center: Search Trigger Bar (Adjusted for Mobile) */}
        <div className="flex-1 max-w-md min-w-0">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-slate-100 dark:bg-[#2A2E35] hover:bg-slate-200/80 dark:hover:bg-[#343942] text-slate-500 dark:text-slate-300 text-xs sm:text-sm border border-slate-200/60 dark:border-white/5 transition-all group"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-indigo-400 shrink-0" />
            <span className="truncate hidden sm:inline">Search students, alumni, departments (@username)...</span>
            <span className="truncate sm:hidden inline text-slate-400">Search (@username)...</span>
          </button>
        </div>

        {/* Right: Action Items (Desktop View) */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2A2E35] transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-5 h-5 text-slate-700" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>

          {/* User Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2A2E35] transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Dedicated ADMIN Activity Bar Trigger */}
          {currentUser?.isAdmin && (
            <button
              onClick={onOpenAdminConsole}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium text-xs shadow-md shadow-indigo-500/20 transition-all transform active:scale-95"
              title="Admin Live Activity Monitor Bar"
            >
              <Shield className="w-4 h-4 text-indigo-200 animate-spin-slow" />
              <span className="hidden md:inline font-semibold">Activity Stream</span>
              {pendingApprovalsCount > 0 && (
                <span className="bg-amber-400 text-slate-900 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                  {pendingApprovalsCount} new
                </span>
              )}
            </button>
          )}

          {/* Account Profile / Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
              className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-[#2A2E35] transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10"
            >
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxImage({ src: currentUser?.avatar || '', title: currentUser?.name });
                }}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30 cursor-pointer"
                title="Click to view avatar"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight truncate max-w-[100px]">
                  {currentUser?.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[100px]">
                  @{currentUser?.username}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isSwitcherOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1C1F23] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 py-2 z-50 animate-fadeIn"
                onClick={() => setIsSwitcherOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100 dark:border-white/10">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{currentUser?.name}</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">@{currentUser?.username}</p>
                  {currentUser?.isAdmin && (
                    <span className="mt-1 inline-block bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                      ADMINISTRATOR
                    </span>
                  )}
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setIsSwitcherOpen(false);
                      setActiveTab('me');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2A2E35] flex items-center gap-2 font-medium"
                  >
                    <UserCheck className="w-4 h-4 text-indigo-500" /> View My Profile
                  </button>
                  <button
                    onClick={onOpenAuthModal}
                    className="w-full text-left px-4 py-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#2A2E35] flex items-center gap-2 font-medium"
                  >
                    <UserPlus className="w-4 h-4" /> Register New Account
                  </button>
                  <button
                    onClick={() => {
                      setIsSwitcherOpen(false);
                      logoutUser();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium border-t border-slate-100 dark:border-white/10 mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Mobile Actions & Three-Dot Menu Button */}
        <div className="flex sm:hidden items-center gap-1 shrink-0">
          {/* Notifications Quick Icon */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2A2E35] transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Three-Dot Menu Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 rounded-xl transition-colors ${
              isMobileMenuOpen
                ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2A2E35]'
            }`}
            title="More Options"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <MoreVertical className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Three-Dot Slide-down Panel */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#1C1F23] px-4 py-3 space-y-3 animate-fadeIn shadow-2xl">
          {/* Theme Toggle Option */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-[#2A2E35] border border-slate-200/60 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-indigo-600" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400" />
              )}
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {theme === 'light' ? 'Light Theme Active' : 'Dark Theme Active'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Toggle dark / light display</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow hover:bg-indigo-500 transition-colors"
            >
              Switch to {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          </div>

          {/* Admin Activity Stream (if admin) */}
          {currentUser?.isAdmin && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAdminConsole();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-bold shadow"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-200" />
                <span>Admin Activity Monitor Stream</span>
              </div>
              {pendingApprovalsCount > 0 && (
                <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {pendingApprovalsCount} new
                </span>
              )}
            </button>
          )}

          {/* Current Profile Info & Account Role Switcher */}
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#2A2E35] border border-slate-200/60 dark:border-white/5 space-y-2">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200/60 dark:border-white/5">
              <img src={currentUser?.avatar} alt={currentUser?.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 truncate">@{currentUser?.username}</p>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setActiveTab('me');
                }}
                className="px-2.5 py-1 bg-white dark:bg-[#1C1F23] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-bold"
              >
                View Profile
              </button>
            </div>

            <div className="flex gap-2 border-t border-slate-200/60 dark:border-white/5 pt-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="flex-1 text-center py-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                <UserPlus className="w-4 h-4" /> Register
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logoutUser();
                }}
                className="flex-1 text-center py-2 text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center gap-1 bg-rose-50 dark:bg-rose-950/40 rounded-xl"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

