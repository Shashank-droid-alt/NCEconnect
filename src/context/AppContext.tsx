import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Post,
  Comment,
  Reply,
  DirectMessage,
  NotificationItem,
  AdminActivityLog,
  UserReport,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_POSTS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_ADMIN_LOGS,
} from '../data/seedData';
import { extractTaggedUsernames } from '../utils/textFormatter';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  messages: DirectMessage[];
  notifications: NotificationItem[];
  adminLogs: AdminActivityLog[];
  reports: UserReport[];
  theme: 'light' | 'dark';
  activeTab: 'feed' | 'network' | 'messaging' | 'me' | 'admin';
  selectedUserIdForView: string | null; // Profile modal target
  lightboxImage: { src: string; title?: string } | null;
  isAuthenticated: boolean;

  // Actions
  setActiveTab: (tab: 'feed' | 'network' | 'messaging' | 'me' | 'admin') => void;
  setSelectedUserIdForView: (id: string | null) => void;
  setLightboxImage: (data: { src: string; title?: string } | null) => void;
  switchUser: (userId: string) => void;
  loginUser: (identifier: string, pass: string) => { success: boolean; message: string };
  logoutUser: () => void;
  loginAsDemoUser: (userId: string) => void;
  toggleTheme: () => void;
  registerUser: (newUser: Omit<User, 'id' | 'isApproved' | 'reportCount' | 'connections' | 'pendingRequestsReceived' | 'pendingRequestsSent' | 'createdAt'>) => { success: boolean; message: string };
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  createPost: (content: string, photos: string[], videoUrl?: string) => void;
  deletePost: (postId: string) => void;
  likePost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  likeComment: (postId: string, commentId: string) => void;
  addReply: (postId: string, commentId: string, content: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
  sendConnectRequest: (targetUserId: string) => void;
  acceptConnectRequest: (requesterId: string) => void;
  declineConnectRequest: (requesterId: string) => void;
  sendDirectMessage: (receiverId: string, content: string, photo?: string) => void;
  reportUserOrPost: (targetUserId: string, reason: string, postId?: string) => void;
  blacklistUser: (userId: string) => void;
  unblacklistUser: (userId: string) => void;
  deleteUserAccount: (userId: string) => void;
  toggleAdminRole: (userId: string) => void;
  deleteUserRequest: (userId: string) => void;
  updateBioAndAvatar: (bio: string, avatar: string, coverImage?: string) => void;
  updateCoverImage: (coverImage: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAdminLogs: () => void;
  clearUserActivity: (userId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'nceconnect_app_data_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or fallback to seed data
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
    let list: User[] = saved ? JSON.parse(saved) : INITIAL_USERS;
    const hasAdmin = list.find((u) => u.username?.toLowerCase() === 'admin_nce' || u.id === 'u-admin');
    if (!hasAdmin) {
      list = [INITIAL_USERS[0], ...list];
    } else {
      list = list.map((u) => {
        if (u.username?.toLowerCase() === 'admin_nce' || u.id === 'u-admin') {
          return {
            ...u,
            isAdmin: true,
            isApproved: true,
            password: u.password || 'Admin@2026',
          };
        }
        return u;
      });
    }
    return list;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_posts`);
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [messages, setMessages] = useState<DirectMessage[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_messages`);
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [adminLogs, setAdminLogs] = useState<AdminActivityLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_adminLogs`);
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_LOGS;
  });

  const [reports, setReports] = useState<UserReport[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_reports`);
    return saved ? JSON.parse(saved) : [];
  });

  // Auth & Session State
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_currentUserId`);
    return saved || 'u-1';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_isAuthenticated`);
    return saved ? saved === 'true' : false; // First opening web app shows Login / Register page
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_theme`);
    return (saved as 'light' | 'dark') || 'dark';
  });

  const [activeTab, setActiveTab] = useState<'feed' | 'network' | 'messaging' | 'me' | 'admin'>('feed');
  const [selectedUserIdForView, setSelectedUserIdForView] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title?: string } | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_posts`, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_messages`, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_adminLogs`, JSON.stringify(adminLogs));
  }, [adminLogs]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_reports`, JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_currentUserId`, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_isAuthenticated`, isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_theme`, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const currentUser = isAuthenticated
    ? users.find((u) => u.id === currentUserId && !u.isBlacklisted && u.isApproved) || null
    : null;

  // If session state indicates authenticated but no valid approved user is found, reset auth state
  useEffect(() => {
    if (isAuthenticated && !currentUser) {
      setIsAuthenticated(false);
      setCurrentUserId('');
    }
  }, [isAuthenticated, currentUser]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId && u.isApproved && !u.isBlacklisted);
    if (target) {
      setCurrentUserId(userId);
      setIsAuthenticated(true);
    }
  };

  const loginUser = (identifier: string, pass: string) => {
    const cleanId = identifier.trim().toLowerCase().replace(/^@/, '');
    const targetUser = users.find(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        (cleanId === 'admin' && u.username.toLowerCase() === 'admin_nce') ||
        u.email.toLowerCase() === cleanId ||
        (u.registrationNumber && u.registrationNumber.toLowerCase() === cleanId) ||
        (u.rollNumber && u.rollNumber.toLowerCase() === cleanId)
    );

    if (!targetUser) {
      return { success: false, message: 'No account found matching this Username, Email ID, or Registration No.' };
    }

    if (targetUser.isBlacklisted) {
      return {
        success: false,
        message: 'Your account has been blacklisted by campus administration. Login is restricted. Please contact the admin if you believe this is an error.',
      };
    }

    if (!targetUser.isApproved) {
      return {
        success: false,
        message: 'Your account registration is currently ON HOLD pending Administrator examination & approval.',
      };
    }

    if (targetUser.password && targetUser.password !== pass) {
      return { success: false, message: 'Incorrect password. Please verify your credentials.' };
    }

    setCurrentUserId(targetUser.id);
    setIsAuthenticated(true);
    return { success: true, message: `Welcome back, ${targetUser.name}!` };
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    setCurrentUserId('');
  };

  const loginAsDemoUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(userId);
      setIsAuthenticated(true);
    }
  };

  const addAdminLog = (type: AdminActivityLog['type'], details: string, actorNameOverride?: string, actorUsernameOverride?: string) => {
    const log: AdminActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      actorName: actorNameOverride || currentUser?.name || 'System',
      actorUsername: actorUsernameOverride || currentUser?.username || 'system',
      details,
      createdAt: new Date().toISOString(),
    };
    setAdminLogs((prev) => [log, ...prev]);
  };

  const addNotification = (
    targetUserId: string,
    type: NotificationItem['type'],
    message: string,
    postId?: string
  ) => {
    if (!currentUser || targetUserId === currentUser.id) return;
    const item: NotificationItem = {
      id: `n-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: targetUserId,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorUsername: currentUser.username,
      actorAvatar: currentUser.avatar,
      type,
      message,
      postId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [item, ...prev]);
  };

  // Register New User (Pending Admin Approval or Auto-Approved)
  const registerUser = (
    newUser: Omit<User, 'id' | 'isApproved' | 'reportCount' | 'connections' | 'pendingRequestsReceived' | 'pendingRequestsSent' | 'createdAt'>
  ) => {
    const existing = users.find(
      (u) =>
        u.username.toLowerCase() === newUser.username.toLowerCase() ||
        u.email.toLowerCase() === newUser.email.toLowerCase() ||
        (newUser.registrationNumber &&
          u.registrationNumber &&
          u.registrationNumber.toLowerCase() === newUser.registrationNumber.toLowerCase())
    );
    if (existing) {
      if (existing.username.toLowerCase() === newUser.username.toLowerCase()) {
        return { success: false, message: 'This username is already taken. Please choose another.' };
      }
      if (existing.email.toLowerCase() === newUser.email.toLowerCase()) {
        return { success: false, message: 'An account with this Email ID already exists.' };
      }
      return { success: false, message: 'An account with this Registration Number already exists.' };
    }

    const created: User = {
      ...newUser,
      id: `u-${Date.now()}`,
      isApproved: false, // Put ON HOLD pending admin verification!
      reportCount: 0,
      connections: [],
      pendingRequestsReceived: [],
      pendingRequestsSent: [],
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, created]);

    addAdminLog(
      'signup',
      `New user registration submitted (ON HOLD): @${created.username} (${created.name}, ${created.department}, Roll: ${created.rollNumber || 'N/A'}, Reg: ${created.registrationNumber || 'N/A'}).`,
      created.name,
      created.username
    );

    return {
      success: true,
      message: 'Account registered successfully and placed ON HOLD! An administrator will examine your details and approve access before you can log in.',
    };
  };

  // Admin Actions
  const approveUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isApproved: true } : u))
    );

    addAdminLog('signup', `ADMIN APPROVED new user @${target.username} (${target.name}) into the platform.`);
  };

  const rejectUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    setUsers((prev) => prev.filter((u) => u.id !== userId));
    addAdminLog('delete', `ADMIN REJECTED registration request for @${target.username} (${target.name}).`);
  };

  const deleteUserRequest = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    setUsers((prev) => prev.filter((u) => u.id !== userId));
    addAdminLog('delete', `ADMIN DELETED registration request & user record for @${target.username} (${target.name}).`);
  };

  const blacklistUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    // Purge target user posts & comments
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBlacklisted: true, isApproved: false } : u))
    );

    setPosts((prev) => prev.filter((p) => p.authorId !== userId));

    addAdminLog('blacklist', `USER BLACKLISTED: @${target.username} was suspended and posts purged.`);
  };

  const unblacklistUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, isBlacklisted: false, isApproved: true, reportCount: 0 }
          : u
      )
    );

    addAdminLog('signup', `ADMIN UN-BLACKLISTED / RESTORED ACCESS: @${target.username} (${target.name}) account un-blacklisted.`);
  };

  const deleteUserAccount = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    // Completely remove user from users list and purge connections
    setUsers((prev) =>
      prev
        .filter((u) => u.id !== userId)
        .map((u) => ({
          ...u,
          connections: u.connections.filter((id) => id !== userId),
          pendingRequestsReceived: u.pendingRequestsReceived.filter((id) => id !== userId),
          pendingRequestsSent: u.pendingRequestsSent.filter((id) => id !== userId),
        }))
    );

    // Delete user's posts
    setPosts((prev) => prev.filter((p) => p.authorId !== userId));

    // Delete messages
    setMessages((prev) => prev.filter((m) => m.senderId !== userId && m.receiverId !== userId));

    // Delete reports
    setReports((prev) => prev.filter((r) => r.targetUserId !== userId && r.reporterId !== userId));

    addAdminLog('delete', `ADMIN DELETED USER ACCOUNT: @${target.username} (${target.name}) permanently removed from system.`);

    // If deleting currently logged in user, logout
    if (currentUserId === userId) {
      logoutUser();
    }
  };

  const toggleAdminRole = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const nextIsAdmin = !target.isAdmin;
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isAdmin: nextIsAdmin } : u))
    );

    addAdminLog(
      'role_change',
      `ADMIN ROLE CHANGED: Privileges ${nextIsAdmin ? 'GRANTED TO' : 'REVOKED FROM'} @${target.username} (${target.name}).`
    );
  };

  // Create Post
  const createPost = (content: string, photos: string[], videoUrl?: string) => {
    if (!currentUser) return;

    const taggedUsernames = extractTaggedUsernames(content);

    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.role,
      authorDept: currentUser.department,
      authorGradYear: currentUser.gradYear,
      content,
      photos,
      videoUrl,
      taggedUsernames,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) => [newPost, ...prev]);

    // Admin activity log
    addAdminLog('post', `Published a new post with ${photos.length} photos.`);

    // Send notifications to tagged users
    taggedUsernames.forEach((tag) => {
      const targetUser = users.find((u) => u.username.toLowerCase() === tag.toLowerCase());
      if (targetUser) {
        addNotification(targetUser.id, 'tag', `tagged you in a post: "${content.substring(0, 40)}..."`, newPost.id);
      }
    });
  };

  // Delete Post
  const deletePost = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    setPosts((prev) => prev.filter((p) => p.id !== postId));
    addAdminLog('delete', `Deleted post (ID: ${postId}) by @${post.authorUsername}.`);
  };

  // Like Post
  const likePost = (postId: string) => {
    if (!currentUser) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = p.likes.includes(currentUser.id);
          const newLikes = isLiked
            ? p.likes.filter((id) => id !== currentUser.id)
            : [...p.likes, currentUser.id];

          if (!isLiked && p.authorId !== currentUser.id) {
            addNotification(p.authorId, 'like', `liked your post: "${p.content.substring(0, 30)}..."`, postId);
            addAdminLog('like', `Liked post by @${p.authorUsername}`);
          }

          return { ...p, likes: newLikes };
        }
        return p;
      })
    );
  };

  // Add Comment
  const addComment = (postId: string, content: string) => {
    if (!currentUser) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
      likes: [],
      replies: [],
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          if (p.authorId !== currentUser.id) {
            addNotification(p.authorId, 'comment', `commented on your post: "${content.substring(0, 30)}..."`, postId);
          }
          addAdminLog('comment', `Commented on @${p.authorUsername}'s post.`);
          return { ...p, comments: [...p.comments, newComment] };
        }
        return p;
      })
    );
  };

  // Like Comment
  const likeComment = (postId: string, commentId: string) => {
    if (!currentUser) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updatedComments = p.comments.map((c) => {
            if (c.id === commentId) {
              const isLiked = c.likes.includes(currentUser.id);
              const newLikes = isLiked
                ? c.likes.filter((id) => id !== currentUser.id)
                : [...c.likes, currentUser.id];
              return { ...c, likes: newLikes };
            }
            return c;
          });
          return { ...p, comments: updatedComments };
        }
        return p;
      })
    );
  };

  // Add Reply
  const addReply = (postId: string, commentId: string, content: string) => {
    if (!currentUser) return;

    const newReply: Reply = {
      id: `r-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
      likes: [],
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updatedComments = p.comments.map((c) => {
            if (c.id === commentId) {
              if (c.authorId !== currentUser.id) {
                addNotification(c.authorId, 'reply', `replied to your comment: "${content.substring(0, 30)}..."`, postId);
              }
              return { ...c, replies: [...c.replies, newReply] };
            }
            return c;
          });
          return { ...p, comments: updatedComments };
        }
        return p;
      })
    );
  };

  // Delete Comment
  const deleteComment = (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: p.comments.filter((c) => c.id !== commentId),
          };
        }
        return p;
      })
    );
    addAdminLog('delete', `Deleted a comment on post ${postId}.`);
  };

  // Networking - Connect Requests
  const sendConnectRequest = (targetUserId: string) => {
    if (!currentUser || currentUser.id === targetUserId) return;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          if (u.pendingRequestsSent.includes(targetUserId)) return u;
          return { ...u, pendingRequestsSent: [...u.pendingRequestsSent, targetUserId] };
        }
        if (u.id === targetUserId) {
          if (u.pendingRequestsReceived.includes(currentUser.id)) return u;
          return { ...u, pendingRequestsReceived: [...u.pendingRequestsReceived, currentUser.id] };
        }
        return u;
      })
    );

    const targetUser = users.find((u) => u.id === targetUserId);
    addNotification(targetUserId, 'connect_request', `sent you a request to connect on NCEconnect.`);
    addAdminLog('connect', `Sent connection request to @${targetUser?.username || 'user'}.`);
  };

  const acceptConnectRequest = (requesterId: string) => {
    if (!currentUser) return;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            connections: Array.from(new Set([...u.connections, requesterId])),
            pendingRequestsReceived: u.pendingRequestsReceived.filter((id) => id !== requesterId),
          };
        }
        if (u.id === requesterId) {
          return {
            ...u,
            connections: Array.from(new Set([...u.connections, currentUser.id])),
            pendingRequestsSent: u.pendingRequestsSent.filter((id) => id !== currentUser.id),
          };
        }
        return u;
      })
    );

    const requester = users.find((u) => u.id === requesterId);
    addNotification(requesterId, 'connect_accept', `accepted your connection request! You are now connected.`);
    addAdminLog('connect', `Accepted connection with @${requester?.username || 'user'}.`);
  };

  const declineConnectRequest = (requesterId: string) => {
    if (!currentUser) return;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            pendingRequestsReceived: u.pendingRequestsReceived.filter((id) => id !== requesterId),
          };
        }
        if (u.id === requesterId) {
          return {
            ...u,
            pendingRequestsSent: u.pendingRequestsSent.filter((id) => id !== currentUser.id),
          };
        }
        return u;
      })
    );
  };

  // Direct Messaging
  const sendDirectMessage = (receiverId: string, content: string, photo?: string) => {
    if (!currentUser) return;

    const newMsg: DirectMessage = {
      id: `m-${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      content,
      photo,
      createdAt: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    addAdminLog('connect', `Sent direct message to user ID ${receiverId}.`);
  };

  // Reporting System (CRITICAL REQUIREMENT: 3 reports automatically deletes user account!)
  const reportUserOrPost = (targetUserId: string, reason: string, postId?: string) => {
    if (!currentUser) return;

    const targetUser = users.find((u) => u.id === targetUserId);
    if (!targetUser) return;

    const newReport: UserReport = {
      id: `rep-${Date.now()}`,
      reporterId: currentUser.id,
      reporterUsername: currentUser.username,
      targetUserId,
      targetUsername: targetUser.username,
      reason,
      postId,
      createdAt: new Date().toISOString(),
    };

    setReports((prev) => [newReport, ...prev]);

    const updatedReportCount = targetUser.reportCount + 1;

    addAdminLog(
      'report',
      `REPORT FILED: @${currentUser.username} reported @${targetUser.username} for "${reason}". (Total reports: ${updatedReportCount}/3)`
    );

    // CHECK IF 3 REPORTS REACHED -> AUTO DELETE ACCOUNT & BLACKLIST!
    if (updatedReportCount >= 3) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUserId
            ? { ...u, reportCount: updatedReportCount, isBlacklisted: true, isApproved: false }
            : u
        )
      );

      // Purge target user's posts from feed
      setPosts((prev) => prev.filter((p) => p.authorId !== targetUserId));

      addAdminLog(
        'blacklist',
        `⚠️ AUTOMATIC SYSTEM ACTION: @${targetUser.username} received 3 user reports. Account AUTOMATICALLY DELETED and blacklisted from platform.`
      );
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, reportCount: updatedReportCount } : u))
      );
    }
  };

  // Update Profile Info
  const updateBioAndAvatar = (bio: string, avatar: string, coverImage?: string) => {
    if (!currentUser) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, bio, avatar, coverImage: coverImage ?? u.coverImage } : u))
    );

    // Also update existing posts by this author with new avatar
    setPosts((prev) =>
      prev.map((p) => (p.authorId === currentUser.id ? { ...p, authorAvatar: avatar } : p))
    );

    addAdminLog('post', `Updated profile bio and photo.`);
  };

  const updateCoverImage = (coverImage: string) => {
    if (!currentUser) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, coverImage } : u))
    );

    addAdminLog('post', `Updated profile cover/background photo.`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => (n.userId === currentUser.id ? { ...n, read: true } : n))
    );
  };

  const clearAdminLogs = () => {
    setAdminLogs([]);
  };

  const clearUserActivity = (userId: string) => {
    setPosts((prev) =>
      prev.map((p) => ({
        ...p,
        likes: p.likes.filter((id) => id !== userId),
        comments: p.comments.filter((c) => c.authorId !== userId),
      }))
    );
    addAdminLog('post', `Cleared interactions and activity log.`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        posts,
        messages,
        notifications,
        adminLogs,
        reports,
        theme,
        activeTab,
        selectedUserIdForView,
        lightboxImage,
        isAuthenticated,
        setActiveTab,
        setSelectedUserIdForView,
        setLightboxImage,
        switchUser,
        loginUser,
        logoutUser,
        loginAsDemoUser,
        toggleTheme,
        registerUser,
        approveUser,
        rejectUser,
        createPost,
        deletePost,
        likePost,
        addComment,
        likeComment,
        addReply,
        deleteComment,
        sendConnectRequest,
        acceptConnectRequest,
        declineConnectRequest,
        sendDirectMessage,
        reportUserOrPost,
        blacklistUser,
        unblacklistUser,
        deleteUserAccount,
        toggleAdminRole,
        deleteUserRequest,
        updateBioAndAvatar,
        updateCoverImage,
        markNotificationRead,
        markAllNotificationsRead,
        clearAdminLogs,
        clearUserActivity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
