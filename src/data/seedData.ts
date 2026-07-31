import { User, Post, DirectMessage, NotificationItem, AdminActivityLog } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u-admin',
    name: 'Campus Admin',
    username: 'admin_nce',
    email: 'admin@nce.edu',
    role: 'alumni',
    department: 'Computer Science & Engineering |PG|',
    gradYear: '2020',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: 'Official NCE Campus System Administrator & Platform Advisory Chair.',
    isAdmin: true,
    isApproved: true,
    reportCount: 0,
    connections: [],
    pendingRequestsReceived: [],
    pendingRequestsSent: [],
    createdAt: '2026-01-01T08:00:00Z',
    rollNumber: 'ADMIN-001',
    registrationNumber: 'REG-ADMIN-001',
    dob: '1998-08-15',
    password: 'Admin@2026',
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-admin-welcome',
    authorId: 'u-admin',
    authorName: 'Campus Admin',
    authorUsername: 'admin_nce',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    authorRole: 'alumni',
    authorDept: 'Computer Science & Engineering |PG|',
    authorGradYear: '2020',
    content: '🎓 Welcome to NCEconnect — The Official Network for Students and Alumni across all Engineering branches!\n\nRegister your student or alumni account with your Roll Number and Registration Number to start connecting, sharing research updates, and building your network.',
    photos: [
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    ],
    taggedUsernames: ['admin_nce'],
    likes: ['u-admin'],
    comments: [
      {
        id: 'c-admin-1',
        authorId: 'u-admin',
        authorName: 'Campus Admin',
        authorUsername: 'admin_nce',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        content: 'System notice: Registration numbers are verified for security. Admin privileges can also be granted to promote coordinators.',
        createdAt: '2026-07-31T08:00:00Z',
        likes: ['u-admin'],
        replies: []
      }
    ],
    createdAt: '2026-07-31T07:30:00Z',
  },
];

export const INITIAL_MESSAGES: DirectMessage[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_ADMIN_LOGS: AdminActivityLog[] = [
  {
    id: 'log-1',
    type: 'role_change',
    actorName: 'Campus Admin',
    actorUsername: 'admin_nce',
    details: 'System initialized with single Official Admin account.',
    createdAt: '2026-07-31T08:00:00Z',
  },
];

