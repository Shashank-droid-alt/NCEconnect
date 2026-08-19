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

import { extractTaggedUsernames } from '../utils/textFormatter';
import { hashPassword } from '../utils/crypto';
import { supabase } from '../lib/supabase';

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
  loginUser: (identifier: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logoutUser: () => void;
  loginAsDemoUser: (userId: string) => void;
  toggleTheme: () => void;
  registerUser: (newUser: Omit<User, 'id' | 'isApproved' | 'reportCount' | 'connections' | 'pendingRequestsReceived' | 'pendingRequestsSent' | 'createdAt'>) => Promise<{ success: boolean; message: string }>;
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

const LOCAL_STORAGE_KEY = 'nceconnect_app_data_v2';

// Module-level constant - not recreated on every render
const SEED_ADMIN: User = {
  id: 'u-admin-nce-001',
  name: 'NCE Admin',
  username: 'admin_nce',
  email: 'admin@nce.edu',
  role: 'alumni',
  department: 'Computer Science & Engineering | UG',
  gradYear: '2024',
  bio: 'Official NCEconnect Administrator. Managing campus digital community.',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=NCE+Admin&backgroundColor=4f46e5&textColor=ffffff',
  coverImage: undefined,
  isAdmin: true,
  isApproved: true,
  isBlacklisted: false,
  reportCount: 0,
  rollNumber: '21001103001',
  registrationNumber: 'REG-ADMIN-001',
  dob: '2000-01-01',
  password: 'a36aef5a11c4073fbe60314fc9df530a9d5f986533594d1f5190742ff9e0e408',
  connections: [],
  pendingRequestsReceived: [],
  pendingRequestsSent: [],
  createdAt: '2024-01-01T00:00:00.000Z',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage (if any) or fallback to seed admin user
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
    if (saved) {
      const parsed: User[] = JSON.parse(saved);
      // Ensure the seed admin always exists (re-inject if missing)
      if (!parsed.find((u) => u.id === SEED_ADMIN.id)) {
        return [SEED_ADMIN, ...parsed];
      }
      return parsed;
    }
    return [SEED_ADMIN];
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_posts`);
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState<DirectMessage[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_messages`);
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : [];
  });

  const [adminLogs, setAdminLogs] = useState<AdminActivityLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_adminLogs`);
    return saved ? JSON.parse(saved) : [];
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

  // Guard: prevents false session reset before Supabase data has loaded
  const [isSupabaseLoaded, setIsSupabaseLoaded] = useState(false);

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

  // Migration: hash any plain text passwords stored in local storage users array
  // Runs once on mount only to avoid infinite re-render (setUsers would re-trigger if users were in deps)
  useEffect(() => {
    const migratePasswords = async () => {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
      const storedUsers: any[] = saved ? JSON.parse(saved) : [];
      let needsUpdate = false;
      const updatedUsers = await Promise.all(
        storedUsers.map(async (u: any) => {
          if (u.password && !/^[a-f0-9]{64}$/i.test(u.password)) {
            needsUpdate = true;
            const hashed = await hashPassword(u.password);
            return { ...u, password: hashed };
          }
          return u;
        })
      );
      if (needsUpdate) {
        setUsers(updatedUsers);
      }
    };
    migratePasswords();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty: one-time password migration on mount

  // Supabase Integration: Fetch Initial Data & Setup Realtime
  useEffect(() => {
    const initSupabaseData = async () => {
      try {
        // 1. Fetch Users
        const { data: dbUsers } = await supabase.from('users').select('*');
        if (dbUsers && dbUsers.length > 0) {
          const mappedUsers = dbUsers.map((u: any) => ({
            id: u.id,
            name: u.name,
            username: u.username,
            email: u.email,
            role: u.role,
            department: u.department,
            gradYear: u.grad_year,
            avatar: u.avatar,
            coverImage: u.cover_image,
            bio: u.bio,
            isAdmin: u.is_admin,
            isApproved: u.is_approved,
            isBlacklisted: u.is_blacklisted,
            reportCount: u.report_count,
            rollNumber: u.roll_number,
            registrationNumber: u.registration_number,
            dob: u.dob,
            createdAt: u.created_at,
            connections: [],
            pendingRequestsReceived: [],
            pendingRequestsSent: [],
          }));
          
          setUsers(prev => {
            const merged = [...prev];
            mappedUsers.forEach(mu => {
              const idx = merged.findIndex(
                p => p.id === mu.id || p.email.toLowerCase() === mu.email.toLowerCase()
              );
              if (idx >= 0) {
                const local = merged[idx];
                merged[idx] = {
                  ...local,
                  ...mu,
                  isApproved: local.isApproved || mu.isApproved,
                  isAdmin: local.isAdmin || mu.isAdmin,
                  password: local.password || (mu as any).password,
                };
              } else {
                merged.push(mu);
              }
            });
            return merged;
          });
        }

        // 2. Fetch Posts
        const { data: dbPosts } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
        if (dbPosts && dbPosts.length > 0) {
          const mappedPosts: Post[] = dbPosts.map((p: any) => ({
            id: p.id,
            authorId: p.author_id,
            authorName: p.author_name,
            authorUsername: p.author_username,
            authorAvatar: p.author_avatar,
            authorRole: p.author_role,
            authorDept: p.author_dept,
            authorGradYear: p.author_grad_year,
            content: p.content,
            photos: p.photos || [],
            videoUrl: p.video_url || undefined,
            taggedUsernames: p.tagged_usernames || [],
            likes: p.likes || [],
            comments: p.comments || [],
            createdAt: p.created_at,
          }));
          setPosts(mappedPosts);
        }

        // 3. Fetch Direct Messages
        const { data: dbMessages } = await supabase.from('direct_messages').select('*').order('created_at', { ascending: true });
        if (dbMessages && dbMessages.length > 0) {
          const mappedMessages: DirectMessage[] = dbMessages.map((m: any) => ({
            id: m.id,
            senderId: m.sender_id,
            receiverId: m.receiver_id,
            content: m.content,
            photo: m.photo || undefined,
            read: m.read,
            createdAt: m.created_at,
          }));
          setMessages(mappedMessages);
        }
      } catch (err) {
        console.error('Supabase Sync Error:', err);
      } finally {
        setIsSupabaseLoaded(true);
      }
    };

    initSupabaseData();

    // Subscribe to real-time posts
    const postSub = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const p = payload.new as any;
          const newP: Post = {
            id: p.id,
            authorId: p.author_id,
            authorName: p.author_name,
            authorUsername: p.author_username,
            authorAvatar: p.author_avatar,
            authorRole: p.author_role,
            authorDept: p.author_dept,
            authorGradYear: p.author_grad_year,
            content: p.content,
            photos: p.photos || [],
            videoUrl: p.video_url || undefined,
            taggedUsernames: p.tagged_usernames || [],
            likes: p.likes || [],
            comments: p.comments || [],
            createdAt: p.created_at,
          };
          setPosts((prev) => (prev.some(x => x.id === newP.id) ? prev : [newP, ...prev]));
        } else if (payload.eventType === 'UPDATE') {
          const p = payload.new as any;
          setPosts((prev) =>
            prev.map((x) => (x.id === p.id ? { ...x, likes: p.likes || [], comments: p.comments || [] } : x))
          );
        } else if (payload.eventType === 'DELETE') {
          const oldP = payload.old as any;
          setPosts((prev) => prev.filter((x) => x.id !== oldP.id));
        }
      })
      .subscribe();

    // Subscribe to real-time messages
    const messageSub = supabase
      .channel('public:direct_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, (payload) => {
        const newMsg = payload.new as any;
        setMessages(prev => {
          if (prev.some(x => x.id === newMsg.id)) return prev;
          return [...prev, {
            id: newMsg.id,
            senderId: newMsg.sender_id,
            receiverId: newMsg.receiver_id,
            content: newMsg.content,
            photo: newMsg.photo,
            createdAt: newMsg.created_at,
            read: newMsg.read
          }];
        });
      })
      .subscribe();

    // Subscribe to real-time user changes (new registrations, approvals, blacklists, role changes)
    const userSub = supabase
      .channel('public:users')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, (payload) => {
        const u = payload.new as any;
        // Map Supabase row to local User shape
        const newUser: User = {
          id: u.id,
          name: u.name,
          username: u.username,
          email: u.email,
          role: u.role,
          department: u.department,
          gradYear: u.grad_year,
          avatar: u.avatar,
          coverImage: u.cover_image,
          bio: u.bio,
          isAdmin: u.is_admin ?? false,
          isApproved: u.is_approved ?? false,
          isBlacklisted: u.is_blacklisted ?? false,
          reportCount: u.report_count ?? 0,
          rollNumber: u.roll_number,
          registrationNumber: u.registration_number,
          dob: u.dob,
          createdAt: u.created_at,
          connections: [],
          pendingRequestsReceived: [],
          pendingRequestsSent: [],
        };
        setUsers(prev => {
          // Don't add if already exists (local registerUser already added them)
          if (prev.some(x => x.id === newUser.id || x.email.toLowerCase() === newUser.email.toLowerCase())) {
            return prev;
          }
          return [...prev, newUser];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, (payload) => {
        const u = payload.new as any;
        setUsers(prev => prev.map(existing => {
          if (existing.id === u.id || existing.email.toLowerCase() === (u.email || '').toLowerCase()) {
            return {
              ...existing,
              isApproved: u.is_approved ?? existing.isApproved,
              isAdmin: u.is_admin ?? existing.isAdmin,
              isBlacklisted: u.is_blacklisted ?? existing.isBlacklisted,
              avatar: u.avatar || existing.avatar,
              bio: u.bio || existing.bio,
              coverImage: u.cover_image || existing.coverImage,
            };
          }
          return existing;
        }));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'users' }, (payload) => {
        const deleted = payload.old as any;
        setUsers(prev => prev.filter(u => u.id !== deleted.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postSub);
      supabase.removeChannel(messageSub);
      supabase.removeChannel(userSub);
    };
  }, []);

  const currentUser = isAuthenticated
    ? users.find((u) => u.id === currentUserId && !u.isBlacklisted && u.isApproved) || null
    : null;

  // Only reset session AFTER Supabase has loaded - prevents false logout on page refresh
  useEffect(() => {
    if (isSupabaseLoaded && isAuthenticated && !currentUser) {
      setIsAuthenticated(false);
      setCurrentUserId('');
    }
  }, [isSupabaseLoaded, isAuthenticated, currentUser]);

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

  const loginUser = async (identifier: string, pass: string) => {
    const cleanId = identifier.trim().toLowerCase().replace(/^@/, '');
    
    // 1. Check local state first
    let candidates = users.filter(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        (cleanId === 'admin' && u.username.toLowerCase() === 'admin_nce') ||
        u.email.toLowerCase() === cleanId ||
        (u.registrationNumber && u.registrationNumber.toLowerCase() === cleanId) ||
        (u.rollNumber && u.rollNumber.toLowerCase() === cleanId)
    );

    // 2. Query Supabase directly to ensure latest approval and user state across all browsers
    try {
      const { data: dbUserList } = await supabase
        .from('users')
        .select('*')
        .or(`username.ilike.${cleanId},email.ilike.${cleanId},registration_number.ilike.${cleanId},roll_number.ilike.${cleanId}`);

      if (dbUserList && dbUserList.length > 0) {
        const mappedDbUsers: User[] = dbUserList.map((dbU: any) => ({
          id: dbU.id,
          name: dbU.name,
          username: dbU.username,
          email: dbU.email,
          role: dbU.role,
          department: dbU.department,
          gradYear: dbU.grad_year,
          avatar: dbU.avatar,
          coverImage: dbU.cover_image,
          bio: dbU.bio,
          isAdmin: dbU.is_admin,
          isApproved: dbU.is_approved,
          isBlacklisted: dbU.is_blacklisted,
          reportCount: dbU.report_count,
          rollNumber: dbU.roll_number,
          registrationNumber: dbU.registration_number,
          dob: dbU.dob,
          createdAt: dbU.created_at,
          connections: [],
          pendingRequestsReceived: [],
          pendingRequestsSent: [],
        }));

        // Merge mapped users into local state
        setUsers((prev) => {
          const merged = [...prev];
          mappedDbUsers.forEach((mu) => {
            const idx = merged.findIndex((p) => p.id === mu.id || p.email.toLowerCase() === mu.email.toLowerCase());
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...mu };
            } else {
              merged.push(mu);
            }
          });
          return merged;
        });

        candidates = mappedDbUsers;
      }
    } catch (err) {
      console.warn('Direct user query during login notice:', err);
    }

    if (candidates.length === 0) {
      return { success: false, message: 'No account found matching this Username, Email ID, or Registration No.' };
    }

    // Prefer an approved record if multiple records exist
    const targetUser = candidates.find((u) => u.isApproved) || candidates[0];

    if (targetUser.isBlacklisted) {
      return {
        success: false,
        message: 'Your account has been blacklisted by campus administration. Login is restricted.',
      };
    }

    if (!targetUser.isApproved) {
      return {
        success: false,
        message: 'Your account registration is currently ON HOLD pending Administrator examination & approval.',
      };
    }

    // Try Supabase Auth sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: targetUser.email,
      password: pass,
    });

    if (authError) {
      // Check if error is due to unconfirmed email from Supabase
      if (authError.message?.toLowerCase().includes('email not confirmed')) {
        return {
          success: false,
          message: 'Supabase email confirmation is pending on this account. Please run the SQL auto-confirm script in Supabase SQL editor to enable instant access.',
        };
      }

      // Fallback to local password hash check
      const hashedPass = await hashPassword(pass);
      if (targetUser.password) {
        if (targetUser.password !== hashedPass) {
          return { success: false, message: 'Incorrect password. Please verify your credentials.' };
        }
      } else {
        return { success: false, message: authError.message || 'Login failed. Please check your password.' };
      }
    }

    // Ensure the approved user is in current users array with isApproved: true
    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id || u.email.toLowerCase() === targetUser.email.toLowerCase() ? { ...u, isApproved: true } : u))
    );

    setCurrentUserId(targetUser.id);
    setIsAuthenticated(true);
    return { success: true, message: `Welcome back, ${targetUser.name}!` };
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    setCurrentUserId('');
    supabase.auth.signOut().catch(() => { /* silent */ });
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
  const registerUser = async (
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

    const hashedPassword = await hashPassword(newUser.password || '');

    // 1. Sign up with Supabase Auth (Pass all profile data as meta_data for the DB Trigger!)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newUser.email.toLowerCase(),
      password: newUser.password || '',
      options: {
        data: {
          name: newUser.name,
          username: newUser.username,
          role: newUser.role,
          department: newUser.department,
          grad_year: newUser.gradYear,
          avatar: newUser.avatar,
          bio: newUser.bio,
          roll_number: newUser.rollNumber,
          registration_number: newUser.registrationNumber,
          dob: newUser.dob,
          password_hash: hashedPassword,
        }
      }
    });

    if (authError) {
      console.error('Supabase Auth Error:', authError);
      return { success: false, message: `Auth Error: ${authError.message}` };
    }

    const created: User = {
      ...newUser,
      password: hashedPassword,
      id: authData?.user?.id || `u-${Date.now()}`,
      isApproved: false, 
      reportCount: 0,
      connections: [],
      pendingRequestsReceived: [],
      pendingRequestsSent: [],
      createdAt: new Date().toISOString(),
    };

    // 2. Ensure row is in public.users with is_approved = false (awaiting admin verification)
    if (authData?.user?.id) {
      try {
        await supabase.from('users').upsert({
          id: authData.user.id,
          name: newUser.name,
          username: newUser.username,
          email: newUser.email.toLowerCase(),
          role: newUser.role,
          department: newUser.department,
          grad_year: newUser.gradYear,
          avatar: newUser.avatar,
          bio: newUser.bio,
          roll_number: newUser.rollNumber,
          registration_number: newUser.registrationNumber,
          dob: newUser.dob,
          is_admin: false,
          is_approved: false,
          is_blacklisted: false,
          report_count: 0,
        }, { onConflict: 'id' });
      } catch (err) {
        console.warn('Direct public.users insert notice (trigger may have handled it):', err);
      }
    }

    // 3. Update Local State (Optimistic)
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
  const approveUser = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === userId || u.email.toLowerCase() === target.email.toLowerCase() ? { ...u, isApproved: true } : u))
    );

    try {
      const { data: updatedData, error } = await supabase
        .from('users')
        .update({ is_approved: true })
        .or(`id.eq.${userId},email.ilike.${target.email},username.ilike.${target.username}`)
        .select();

      if (error || !updatedData || updatedData.length === 0) {
        // Fallback: update by email
        const { error: emailErr } = await supabase.from('users').update({ is_approved: true }).ilike('email', target.email);
        if (emailErr) {
          console.warn('Fallback update notice:', emailErr);
        }
      }
    } catch (err) {
      console.error('Failed to sync user approval to Supabase:', err);
    }

    addAdminLog('signup', `ADMIN APPROVED new user @${target.username} (${target.name}) into the platform.`);
  };

  const rejectUser = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    setUsers((prev) => prev.filter((u) => u.id !== userId));

    try {
      await supabase.from('users').delete().eq('id', userId);
    } catch (err) {
      console.error('Failed to delete rejected user from Supabase:', err);
    }

    addAdminLog('delete', `ADMIN REJECTED registration request for @${target.username} (${target.name}).`);
  };

  const deleteUserRequest = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    setUsers((prev) => prev.filter((u) => u.id !== userId));

    try {
      await supabase.from('users').delete().eq('id', userId);
    } catch (err) {
      console.error('Failed to delete user request from Supabase:', err);
    }

    addAdminLog('delete', `ADMIN DELETED registration request & user record for @${target.username} (${target.name}).`);
  };

  const blacklistUser = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBlacklisted: true, isApproved: false } : u))
    );

    setPosts((prev) => prev.filter((p) => p.authorId !== userId));

    try {
      await supabase.from('users').update({ is_blacklisted: true, is_approved: false }).eq('id', userId);
      await supabase.from('posts').delete().eq('author_id', userId);
    } catch (err) {
      console.error('Failed to sync blacklist to Supabase:', err);
    }

    addAdminLog('blacklist', `USER BLACKLISTED: @${target.username} was suspended and posts purged.`);
  };

  const unblacklistUser = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, isBlacklisted: false, isApproved: true, reportCount: 0 }
          : u
      )
    );

    try {
      await supabase.from('users').update({ is_blacklisted: false, is_approved: true, report_count: 0 }).eq('id', userId);
    } catch (err) {
      console.error('Failed to sync unblacklist to Supabase:', err);
    }

    addAdminLog('signup', `ADMIN UN-BLACKLISTED / RESTORED ACCESS: @${target.username} (${target.name}) account un-blacklisted.`);
  };

  const deleteUserAccount = async (userId: string) => {
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

    try {
      await supabase.from('users').delete().eq('id', userId);
      await supabase.from('posts').delete().eq('author_id', userId);
    } catch (err) {
      console.error('Failed to delete user account from Supabase:', err);
    }

    addAdminLog('delete', `ADMIN DELETED USER ACCOUNT: @${target.username} (${target.name}) permanently removed from system.`);

    // If deleting currently logged in user, logout
    if (currentUserId === userId) {
      logoutUser();
    }
  };

  const toggleAdminRole = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const nextIsAdmin = !target.isAdmin;
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isAdmin: nextIsAdmin } : u))
    );

    try {
      await supabase.from('users').update({ is_admin: nextIsAdmin }).eq('id', userId);
    } catch (err) {
      console.error('Failed to update admin role in Supabase:', err);
    }

    addAdminLog(
      'role_change',
      `ADMIN ROLE CHANGED: Privileges ${nextIsAdmin ? 'GRANTED TO' : 'REVOKED FROM'} @${target.username} (${target.name}).`
    );
  };

  // Create Post
  const createPost = async (content: string, photos: string[], videoUrl?: string) => {
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

    try {
      await supabase.from('posts').insert([{
        id: newPost.id,
        author_id: currentUser.id,
        author_name: currentUser.name,
        author_username: currentUser.username,
        author_avatar: currentUser.avatar,
        author_role: currentUser.role,
        author_dept: currentUser.department,
        author_grad_year: currentUser.gradYear,
        content,
        photos: photos || [],
        video_url: videoUrl || null,
        tagged_usernames: taggedUsernames || [],
        likes: [],
        comments: [],
        created_at: newPost.createdAt
      }]);
    } catch (err) {
      console.error('Failed to insert post to Supabase:', err);
    }

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
  const deletePost = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    setPosts((prev) => prev.filter((p) => p.id !== postId));

    try {
      await supabase.from('posts').delete().eq('id', postId);
    } catch (err) {
      console.error('Failed to delete post from Supabase:', err);
    }

    addAdminLog('delete', `Deleted post (ID: ${postId}) by @${post.authorUsername}.`);
  };

  // Like Post - fixed: compute newLikes BEFORE setPosts to avoid closure race condition
  const likePost = async (postId: string) => {
    if (!currentUser) return;

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const isLiked = post.likes.includes(currentUser.id);
    const newLikes = isLiked
      ? post.likes.filter((id) => id !== currentUser.id)
      : [...post.likes, currentUser.id];

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: newLikes } : p))
    );

    if (!isLiked && post.authorId !== currentUser.id) {
      addNotification(post.authorId, 'like', `liked your post: "${post.content.substring(0, 30)}..."`, postId);
      addAdminLog('like', `Liked post by @${post.authorUsername}`);
    }

    try {
      await supabase.from('posts').update({ likes: newLikes }).eq('id', postId);
    } catch (err) {
      console.error('Failed to update likes in Supabase:', err);
    }
  };

  // Helper to sync post comments to Supabase
  const syncCommentsToSupabase = async (postId: string, updatedComments: Comment[]) => {
    try {
      await supabase.from('posts').update({ comments: updatedComments }).eq('id', postId);
    } catch (err) {
      console.error('Failed to sync comments to Supabase:', err);
    }
  };

  // Add Comment - fixed: compute updatedComments BEFORE setPosts
  const addComment = (postId: string, content: string) => {
    if (!currentUser) return;

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

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

    const updatedComments = [...post.comments, newComment];

    if (post.authorId !== currentUser.id) {
      addNotification(post.authorId, 'comment', `commented on your post: "${content.substring(0, 30)}..."`, postId);
    }
    addAdminLog('comment', `Commented on @${post.authorUsername}'s post.`);

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: updatedComments } : p))
    );

    syncCommentsToSupabase(postId, updatedComments);
  };

  // Like Comment - fixed: compute updatedComments BEFORE setPosts
  const likeComment = (postId: string, commentId: string) => {
    if (!currentUser) return;

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const updatedComments = post.comments.map((c) => {
      if (c.id === commentId) {
        const isLiked = c.likes.includes(currentUser.id);
        const newLikes = isLiked
          ? c.likes.filter((id) => id !== currentUser.id)
          : [...c.likes, currentUser.id];
        return { ...c, likes: newLikes };
      }
      return c;
    });

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: updatedComments } : p))
    );

    syncCommentsToSupabase(postId, updatedComments);
  };

  // Add Reply - fixed: compute updatedComments BEFORE setPosts
  const addReply = (postId: string, commentId: string, content: string) => {
    if (!currentUser) return;

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

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

    const updatedComments = post.comments.map((c) => {
      if (c.id === commentId) {
        if (c.authorId !== currentUser.id) {
          addNotification(c.authorId, 'reply', `replied to your comment: "${content.substring(0, 30)}..."`, postId);
        }
        return { ...c, replies: [...c.replies, newReply] };
      }
      return c;
    });

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: updatedComments } : p))
    );

    syncCommentsToSupabase(postId, updatedComments);
  };

  // Delete Comment - fixed: compute updatedComments BEFORE setPosts
  const deleteComment = (postId: string, commentId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const updatedComments = post.comments.filter((c) => c.id !== commentId);

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: updatedComments } : p))
    );

    syncCommentsToSupabase(postId, updatedComments);
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
  const sendDirectMessage = async (receiverId: string, content: string, photo?: string) => {
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

    try {
      await supabase.from('direct_messages').insert([{
        id: newMsg.id,
        sender_id: currentUser.id,
        receiver_id: receiverId,
        content,
        photo: photo || null,
        read: false,
        created_at: newMsg.createdAt
      }]);
    } catch (err) {
      console.error('Failed to insert message into Supabase:', err);
    }

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

  // Update Profile Info (with Supabase sync)
  const updateBioAndAvatar = async (bio: string, avatar: string, coverImage?: string) => {
    if (!currentUser) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, bio, avatar, coverImage: coverImage ?? u.coverImage } : u))
    );

    setPosts((prev) =>
      prev.map((p) => (p.authorId === currentUser.id ? { ...p, authorAvatar: avatar } : p))
    );

    try {
      await supabase.from('users').update({
        bio,
        avatar,
        cover_image: coverImage ?? currentUser.coverImage ?? null,
      }).eq('id', currentUser.id);
    } catch (err) {
      console.error('Failed to update profile in Supabase:', err);
    }

    addAdminLog('post', `Updated profile bio and photo.`);
  };

  const updateCoverImage = async (coverImage: string) => {
    if (!currentUser) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, coverImage } : u))
    );

    try {
      await supabase.from('users').update({ cover_image: coverImage }).eq('id', currentUser.id);
    } catch (err) {
      console.error('Failed to update cover image in Supabase:', err);
    }

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
