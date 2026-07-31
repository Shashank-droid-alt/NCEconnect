import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Feed } from './components/Feed';
import { NetworkView } from './components/NetworkView';
import { MessagingView } from './components/MessagingView';
import { MeView } from './components/MeView';
import { CreatePostModal } from './components/CreatePostModal';
import { NotificationsView } from './components/NotificationsView';
import { AdminConsoleBar } from './components/AdminConsoleBar';
import { AuthModal } from './components/AuthModal';
import { AuthScreen } from './components/AuthScreen';
import { ReportModal } from './components/ReportModal';
import { UserProfileModal } from './components/UserProfileModal';
import { ImageViewerModal } from './components/ImageViewerModal';
import { SearchView } from './components/SearchView';

function MainLayout() {
  const {
    isAuthenticated,
    activeTab,
    setActiveTab,
    selectedUserIdForView,
    setSelectedUserIdForView,
    lightboxImage,
    setLightboxImage,
  } = useApp();

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdminConsole, setShowAdminConsole] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [reportingData, setReportingData] = useState<{ targetUserId: string; postId?: string } | null>(
    null
  );

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-100 dark:bg-[#0F1113] text-slate-900 dark:text-slate-200 transition-colors flex flex-col font-sans">
      {/* Top Navigation Header */}
      <Header
        onOpenAuthModal={() => setShowAuthModal(true)}
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenAdminConsole={() => setShowAdminConsole(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex gap-4 lg:gap-6 min-w-0">
        {/* Left Desktop Sidebar */}
        <Sidebar onOpenCreatePost={() => setShowCreatePost(true)} />

        {/* Center Main Stage */}
        <section className="flex-1 min-w-0">
          {activeTab === 'feed' && (
            <Feed
              onOpenCreatePost={() => setShowCreatePost(true)}
              onReport={(targetUserId, postId) => setReportingData({ targetUserId, postId })}
            />
          )}

          {activeTab === 'network' && <NetworkView />}

          {activeTab === 'messaging' && <MessagingView />}

          {activeTab === 'me' && (
            <MeView
              onReport={(targetUserId, postId) => setReportingData({ targetUserId, postId })}
            />
          )}

          {activeTab === 'admin' && (
            <AdminConsoleBar onClose={() => setActiveTab('feed')} />
          )}
        </section>
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNav onOpenCreatePost={() => setShowCreatePost(true)} />

      {/* Global Modals */}
      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} />
      )}

      {showNotifications && (
        <NotificationsView onClose={() => setShowNotifications(false)} />
      )}

      {showAdminConsole && (
        <AdminConsoleBar onClose={() => setShowAdminConsole(false)} />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {showSearchModal && (
        <SearchView onClose={() => setShowSearchModal(false)} />
      )}

      {reportingData && (
        <ReportModal
          targetUserId={reportingData.targetUserId}
          postId={reportingData.postId}
          onClose={() => setReportingData(null)}
        />
      )}

      {selectedUserIdForView && (
        <UserProfileModal
          userId={selectedUserIdForView}
          onClose={() => setSelectedUserIdForView(null)}
          onReport={(targetUserId) => setReportingData({ targetUserId })}
        />
      )}

      {lightboxImage && (
        <ImageViewerModal
          src={lightboxImage.src}
          title={lightboxImage.title}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
