import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Filter, Loader2, Image, MessageSquarePlus, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PostCard } from './PostCard';

interface FeedProps {
  onOpenCreatePost: () => void;
  onReport: (targetUserId: string, postId: string) => void;
}

export const Feed: React.FC<FeedProps> = ({ onOpenCreatePost, onReport }) => {
  const { currentUser, posts } = useApp();

  const [filter, setFilter] = useState<'all' | 'students' | 'alumni' | 'tagged'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(3);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const loaderRef = useRef<HTMLDivElement>(null);

  // Filter posts based on tab — computed before hooks so we can use in useEffect deps
  const filteredPosts = posts.filter((p) => {
    if (filter === 'students') return p.authorRole === 'student';
    if (filter === 'alumni') return p.authorRole === 'alumni';
    if (filter === 'tagged') {
      return p.taggedUsernames.some(
        (username) => username.toLowerCase() === (currentUser?.username || '').toLowerCase()
      );
    }
    return true;
  });

  const displayedPosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  // Infinite Scroll Trigger via IntersectionObserver
  // IMPORTANT: useEffect must be declared unconditionally (React rules of hooks)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => prev + 2);
            setIsLoadingMore(false);
          }, 800);
        }
      },
      { threshold: 0.5 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, filteredPosts.length]);

  if (!currentUser) return null;

  return (
    <div className="space-y-4 pb-24 sm:pb-20 lg:pb-12">
      {/* Create Post Prompt Banner */}
      <div className="bg-white dark:bg-[#1C1F23] rounded-2xl border border-slate-200/90 dark:border-white/10 p-4 shadow-sm flex items-center gap-3">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-10 h-10 rounded-xl object-cover shrink-0 ring-2 ring-indigo-500/30"
        />
        <button
          onClick={onOpenCreatePost}
          className="flex-1 text-left px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#2A2E35] hover:bg-slate-200/80 dark:hover:bg-[#343942] text-slate-500 dark:text-slate-300 text-sm font-medium border border-slate-200/60 dark:border-white/5 transition-all flex items-center justify-between"
        >
          <span>Start a discussion, share campus updates or projects...</span>
          <MessageSquarePlus className="w-4 h-4 text-indigo-400 hidden sm:block" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Campus' },
          { id: 'students', label: 'Student Posts' },
          { id: 'alumni', label: 'Alumni Network' },
          { id: 'tagged', label: 'Tagged Me' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setFilter(item.id as any);
              setVisibleCount(3);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filter === item.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white dark:bg-[#1C1F23] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#2A2E35]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Posts Stream */}
      {displayedPosts.length === 0 ? (
        <div className="bg-white dark:bg-[#1C1F23] rounded-2xl border border-slate-200 dark:border-white/10 p-8 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-indigo-400 mx-auto opacity-80" />
          <h3 className="font-bold text-slate-900 dark:text-white">No posts in this feed yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Be the first to share news, project updates, or connect with university peers!
          </p>
          <button
            onClick={onOpenCreatePost}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow"
          >
            Create First Post
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedPosts.map((post) => (
            <PostCard key={post.id} post={post} onReport={onReport} />
          ))}
        </div>
      )}

      {/* Infinite Scroll Loader / Buffering Indicator */}
      {hasMore && (
        <div ref={loaderRef} className="py-6 flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-4 py-2 rounded-full border border-indigo-200 dark:border-indigo-800/50">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Buffering more campus posts...</span>
          </div>
        </div>
      )}

      {!hasMore && displayedPosts.length > 0 && (
        <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
          You've reached the end of the campus feed for now!
        </div>
      )}
    </div>
  );
};
