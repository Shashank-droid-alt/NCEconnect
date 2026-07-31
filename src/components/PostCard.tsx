import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Trash2,
  Flag,
  Send,
  MoreHorizontal,
  CornerDownRight,
  UserCheck,
  ShieldAlert,
  Play,
  User as UserIcon,
} from 'lucide-react';
import { Post } from '../types';
import { useApp } from '../context/AppContext';
import { FormattedText } from '../utils/textFormatter';

interface PostCardProps {
  post: Post;
  onReport: (targetUserId: string, postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onReport }) => {
  const {
    currentUser,
    likePost,
    addComment,
    likeComment,
    addReply,
    deletePost,
    deleteComment,
    setLightboxImage,
    setSelectedUserIdForView,
  } = useApp();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showLikers, setShowLikers] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  if (!currentUser) return null;

  const isLiked = post.likes.includes(currentUser.id);
  const canDelete = currentUser.isAdmin || post.authorId === currentUser.id;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText.trim());
    setCommentText('');
    setShowComments(true);
  };

  const handleReplySubmit = (commentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    addReply(post.id, commentId, replyText.trim());
    setReplyText('');
    setActiveReplyId(null);
  };

  return (
    <div className="bg-white dark:bg-[#1C1F23] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Post Header */}
      <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            onClick={() => setLightboxImage({ src: post.authorAvatar, title: post.authorName })}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/20 cursor-pointer hover:opacity-90 transition-opacity"
            title="Click to view profile picture"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                onClick={() => setSelectedUserIdForView(post.authorId)}
                className="font-bold text-slate-900 dark:text-white text-sm hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
              >
                {post.authorName}
              </h4>
              <span
                onClick={() => setSelectedUserIdForView(post.authorId)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer hover:underline"
              >
                @{post.authorUsername}
              </span>
              {post.authorRole === 'alumni' ? (
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                  Alumni '{post.authorGradYear}
                </span>
              ) : (
                <span className="text-[10px] bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/50">
                  Student '{post.authorGradYear}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {post.authorDept} • {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Post Options Menu */}
        <div className="relative">
          <button
            onClick={() => setShowOptionsModal(!showOptionsModal)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showOptionsModal && (
            <div
              className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#1C1F23] rounded-xl shadow-lg border border-slate-200 dark:border-white/10 py-1 z-20"
              onClick={() => setShowOptionsModal(false)}
            >
              {canDelete && (
                <button
                  onClick={() => deletePost(post.id)}
                  className="w-full text-left px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium"
                >
                  <Trash2 className="w-4 h-4" /> Delete Post
                </button>
              )}
              {post.authorId !== currentUser.id && (
                <button
                  onClick={() => onReport(post.authorId, post.id)}
                  className="w-full text-left px-3.5 py-2 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2 font-medium"
                >
                  <Flag className="w-4 h-4" /> Report Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text Body */}
      <div className="px-4 sm:px-5 pb-3 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
        <FormattedText
          text={post.content}
          onTagClick={(username) => {
            const matchedUser = useApp().users.find((u) => u.username.toLowerCase() === username.toLowerCase());
            if (matchedUser) setSelectedUserIdForView(matchedUser.id);
          }}
        />
      </div>

      {/* Media Attachments (Photos Grid & Video) */}
      {post.photos && post.photos.length > 0 && (
        <div className="px-4 sm:px-5 pb-3">
          <div
            className={`grid gap-2 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 ${
              post.photos.length === 1
                ? 'grid-cols-1'
                : post.photos.length === 2
                ? 'grid-cols-2'
                : 'grid-cols-2 sm:grid-cols-3'
            }`}
          >
            {post.photos.map((photoUrl, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxImage({ src: photoUrl, title: `Photo ${idx + 1} by @${post.authorUsername}` })}
                className="relative aspect-video sm:aspect-square bg-slate-950 overflow-hidden cursor-pointer group"
              >
                <img
                  src={photoUrl}
                  alt={`Post attachment ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Attachment */}
      {post.videoUrl && (
        <div className="px-4 sm:px-5 pb-3">
          <div className="rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800">
            <iframe
              src={post.videoUrl.replace('watch?v=', 'embed/')}
              title="Post Video"
              className="w-full aspect-video"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="px-4 sm:px-5 py-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
        <button
          onClick={() => setShowLikers(!showLikers)}
          className="hover:underline hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 font-medium"
        >
          <span>{post.likes.length} likes</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="hover:underline hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
        >
          {post.comments.length} comments
        </button>
      </div>

      {/* Likers List Tooltip */}
      {showLikers && post.likes.length > 0 && (
        <div className="px-4 sm:px-5 py-2 bg-slate-50 dark:bg-slate-800/50 text-xs border-t border-slate-100 dark:border-slate-800">
          <span className="font-semibold text-slate-600 dark:text-slate-300 mr-1">Liked by:</span>
          {post.likes.map((id, index) => {
            const u = useApp().users.find((user) => user.id === id);
            return (
              <span key={id} className="text-indigo-600 dark:text-indigo-400 font-medium mr-2">
                @{u?.username || 'user'}
                {index < post.likes.length - 1 ? ',' : ''}
              </span>
            );
          })}
        </div>
      )}

      {/* Action Buttons Bar */}
      <div className="px-2 sm:px-4 py-1.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 text-center">
        <button
          onClick={() => likePost(post.id)}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            isLiked
              ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{isLiked ? 'Liked' : 'Like'}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Comment</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-[#0F1113]/60 border-t border-slate-200/80 dark:border-white/10 space-y-4 animate-fadeIn">
          {/* Add Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2 items-center">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
            <input
              type="text"
              placeholder={`Comment as @${currentUser.username}...`}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-full bg-white dark:bg-[#2A2E35] border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-3 pt-2">
            {post.comments.map((comment) => {
              const isCommentLiked = comment.likes.includes(currentUser.id);
              const isAuthorOrAdmin = currentUser.isAdmin || comment.authorId === currentUser.id;

              return (
                <div key={comment.id} className="text-xs space-y-2">
                  <div className="flex items-start gap-2.5 bg-white dark:bg-[#2A2E35] p-3 rounded-2xl border border-slate-200/60 dark:border-white/5">
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      onClick={() => setLightboxImage({ src: comment.authorAvatar, title: comment.authorName })}
                      className="w-7 h-7 rounded-full object-cover cursor-pointer shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            onClick={() => setSelectedUserIdForView(comment.authorId)}
                            className="font-bold text-slate-900 dark:text-white hover:underline cursor-pointer"
                          >
                            {comment.authorName}
                          </span>
                          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                            @{comment.authorUsername}
                          </span>
                        </div>
                        {isAuthorOrAdmin && (
                          <button
                            onClick={() => deleteComment(post.id, comment.id)}
                            className="text-slate-400 hover:text-rose-500 p-0.5 transition-colors"
                            title="Delete Comment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="text-slate-700 dark:text-slate-200 mt-1 leading-relaxed">
                        <FormattedText
                          text={comment.content}
                          onTagClick={(username) => {
                            const matchedUser = useApp().users.find((u) => u.username.toLowerCase() === username.toLowerCase());
                            if (matchedUser) setSelectedUserIdForView(matchedUser.id);
                          }}
                        />
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium">
                        <span>{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <button
                          onClick={() => likeComment(post.id, comment.id)}
                          className={`hover:underline flex items-center gap-0.5 font-semibold ${
                            isCommentLiked ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Like ({comment.likes.length})
                        </button>
                        <button
                          onClick={() => {
                            setActiveReplyId(activeReplyId === comment.id ? null : comment.id);
                            setReplyText(`@${comment.authorUsername} `);
                          }}
                          className="hover:underline font-semibold text-indigo-600 dark:text-indigo-400"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Nested Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="pl-6 space-y-2 border-l-2 border-indigo-200 dark:border-indigo-900 ml-3">
                      {comment.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="bg-white/80 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/40 flex items-start gap-2"
                        >
                          <CornerDownRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {reply.authorName}
                              </span>
                              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                                @{reply.authorUsername}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                              <FormattedText text={reply.content} />
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline Reply Input Box */}
                  {activeReplyId === comment.id && (
                    <form
                      onSubmit={(e) => handleReplySubmit(comment.id, e)}
                      className="pl-6 flex gap-2 items-center"
                    >
                      <input
                        type="text"
                        placeholder={`Reply to @${comment.authorUsername}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
                      >
                        Reply
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
