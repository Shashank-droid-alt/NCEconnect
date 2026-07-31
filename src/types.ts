export type UserRole = 'student' | 'alumni';

export interface User {
  id: string;
  name: string;
  username: string; // unique handle e.g. aarav_cs
  email: string;
  role: UserRole;
  department: string;
  gradYear: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  isAdmin?: boolean; // secret admin flag
  isApproved: boolean; // pending approval by admin
  isBlacklisted?: boolean;
  reportCount: number;
  connections: string[]; // user IDs of connected users
  pendingRequestsReceived: string[]; // user IDs who sent requests to this user
  pendingRequestsSent: string[]; // user IDs this user sent requests to
  createdAt: string;
  rollNumber?: string;
  registrationNumber?: string;
  dob?: string;
  password?: string;
}

export interface Reply {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: string[]; // user IDs
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: string[]; // user IDs
  replies: Reply[];
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorRole: UserRole;
  authorDept: string;
  authorGradYear: string;
  content: string;
  photos: string[];
  videoUrl?: string;
  taggedUsernames: string[];
  likes: string[]; // user IDs
  comments: Comment[];
  createdAt: string;
  reportsCount?: number;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  photo?: string;
  createdAt: string;
  read: boolean;
}

export type NotificationType = 
  | 'connect_request'
  | 'connect_accept'
  | 'like'
  | 'comment'
  | 'reply'
  | 'tag'
  | 'admin_notice';

export interface NotificationItem {
  id: string;
  userId: string; // target user receiving notification
  actorId: string; // user who triggered it
  actorName: string;
  actorUsername: string;
  actorAvatar: string;
  type: NotificationType;
  postId?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AdminActivityLog {
  id: string;
  type: 'signup' | 'post' | 'comment' | 'like' | 'connect' | 'report' | 'blacklist' | 'delete' | 'role_change';
  actorName: string;
  actorUsername: string;
  details: string;
  targetId?: string;
  createdAt: string;
}

export interface UserReport {
  id: string;
  reporterId: string;
  reporterUsername: string;
  targetUserId: string;
  targetUsername: string;
  reason: string;
  postId?: string;
  createdAt: string;
}
