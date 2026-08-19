import React, { useState } from 'react';
import {
  Edit3,
  Camera,
  Heart,
  Users,
  Grid,
  Check,
  GraduationCap,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PostCard } from './PostCard';
import { ImageCropperModal } from './ImageCropperModal';
import { uploadToCloudinary } from '../lib/cloudinary';

export const MeView: React.FC<{ onReport: (targetUserId: string, postId: string) => void }> = ({
  onReport,
}) => {
  const {
    currentUser,
    posts,
    users,
    updateBioAndAvatar,
    updateCoverImage,
    clearUserActivity,
    setLightboxImage,
    setSelectedUserIdForView,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'activity' | 'connections'>('posts');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(currentUser?.bio || '');
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Photo editing for profile pic
  const [tempProfileImage, setTempProfileImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tempCoverImage, setTempCoverImage] = useState<string | null>(null);
  const [showCoverCropper, setShowCoverCropper] = useState(false);

  if (!currentUser) return null;

  const myPosts = posts.filter((p) => p.authorId === currentUser.id);

  // My activity (posts I liked or commented on)
  const myLikedPosts = posts.filter((p) => p.likes.includes(currentUser.id));

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setTempCoverImage(evt.target.result as string);
          setShowCoverCropper(true);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCoverCropComplete = async (croppedUrl: string) => {
    setIsUploadingCover(true);
    setShowCoverCropper(false);
    try {
      const coverUrl = await uploadToCloudinary(croppedUrl);
      updateCoverImage(coverUrl);
    } catch (err) {
      console.error('Failed to upload cover picture to Cloudinary:', err);
      updateCoverImage(croppedUrl);
    } finally {
      setIsUploadingCover(false);
      setTempCoverImage(null);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setTempProfileImage(evt.target.result as string);
          setShowCropper(true);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleProfileCropComplete = async (croppedUrl: string) => {
    try {
      const finalUrl = await uploadToCloudinary(croppedUrl);
      updateBioAndAvatar(currentUser.bio, finalUrl);
    } catch (err) {
      console.error('Failed to upload avatar to Cloudinary:', err);
      updateBioAndAvatar(currentUser.bio, croppedUrl);
    }
    setShowCropper(false);
    setTempProfileImage(null);
  };

  const handleSaveBio = () => {
    updateBioAndAvatar(bioInput, currentUser.avatar);
    setIsEditingBio(false);
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-20 lg:pb-12">
      {/* Profile Header Banner */}
      <div className="bg-white dark:bg-[#1C1F23] rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-sm overflow-hidden">
        {/* Cover Banner */}
        <div className="h-36 sm:h-48 bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-700 relative overflow-hidden group">
          {currentUser.coverImage ? (
            <img
              src={currentUser.coverImage}
              alt="Profile Cover Background"
              onClick={() => setLightboxImage({ src: currentUser.coverImage!, title: `${currentUser.name}'s Cover Photo` })}
              className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-90" />
          )}

          {/* Badge */}
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/20">
            {currentUser.role === 'alumni' ? `Alumni Class of ${currentUser.gradYear}` : `Student Class of ${currentUser.gradYear}`}
          </div>

          {/* Cover Photo Upload Button */}
          <label className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-900 backdrop-blur-md text-white text-xs font-extrabold px-3.5 py-2 rounded-xl border border-white/20 shadow-lg cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2">
            <Camera className="w-4 h-4 text-indigo-400" />
            <span>{isUploadingCover ? 'Uploading Cover...' : 'Change Cover Photo'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverFileChange}
              className="hidden"
              disabled={isUploadingCover}
            />
          </label>
        </div>

        {/* Info Content */}
        <div className="px-6 pb-6 relative pt-0">
          {/* Avatar with Crop & Change Feature */}
          <div className="flex justify-between items-end -mt-14 mb-4">
            <div className="relative group">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                onClick={() => setLightboxImage({ src: currentUser.avatar, title: currentUser.name })}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white dark:ring-[#1C1F23] shadow-lg cursor-pointer"
                title="Click to expand full photo"
              />
              <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-md cursor-pointer hover:bg-indigo-500 transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-[#2A2E35] hover:bg-slate-200 dark:hover:bg-[#343942] text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditingBio ? 'Cancel Edit' : 'Edit Profile & Bio'}</span>
            </button>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {currentUser.name}
            </h2>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              @{currentUser.username}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              {currentUser.department}
            </p>
          </div>

          {/* Bio Section */}
          <div className="mt-4 p-4 bg-slate-50 dark:bg-[#2A2E35] rounded-2xl border border-slate-200/60 dark:border-white/5">
            {isEditingBio ? (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                  Edit Bio:
                </label>
                <textarea
                  rows={3}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-white dark:bg-[#1C1F23] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSaveBio}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  <Check className="w-4 h-4" /> Save Bio Changes
                </button>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {currentUser.bio || 'Add a bio describing your achievements, skills, or interests.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('posts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'posts'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Grid className="w-4 h-4" /> My Posts ({myPosts.length})
        </button>

        <button
          onClick={() => setActiveSubTab('activity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'activity'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Heart className="w-4 h-4" /> My Interactions ({myLikedPosts.length})
        </button>

        <button
          onClick={() => setActiveSubTab('connections')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'connections'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Connected Peers ({currentUser.connections.length})
        </button>
      </div>

      {/* Content Area */}
      {activeSubTab === 'posts' && (
        <div className="space-y-4">
          {myPosts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500">You haven't posted anything yet.</p>
            </div>
          ) : (
            myPosts.map((post) => <PostCard key={post.id} post={post} onReport={onReport} />)
          )}
        </div>
      )}

      {activeSubTab === 'activity' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-slate-500 font-semibold">Your Posts Interactions & Activity Log</p>
            {myLikedPosts.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your activity and post interactions?')) {
                    clearUserActivity(currentUser.id);
                  }
                }}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors border border-rose-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Activity Log</span>
              </button>
            )}
          </div>

          {myLikedPosts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500">No post interactions or activity logs found.</p>
            </div>
          ) : (
            myLikedPosts.map((post) => <PostCard key={post.id} post={post} onReport={onReport} />)
          )}
        </div>
      )}

      {activeSubTab === 'connections' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentUser.connections.map((connId) => {
            const peer = users.find((u) => u.id === connId);
            if (!peer) return null;
            return (
              <div
                key={peer.id}
                onClick={() => setSelectedUserIdForView(peer.id)}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 cursor-pointer hover:border-indigo-500 transition-colors shadow-sm"
              >
                <img src={peer.avatar} alt={peer.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{peer.name}</h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">@{peer.username}</p>
                  <p className="text-[11px] text-slate-500 truncate">{peer.department}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cropper Modal for Profile Avatar */}
      {showCropper && tempProfileImage && (
        <ImageCropperModal
          imageSrc={tempProfileImage}
          onClose={() => {
            setShowCropper(false);
            setTempProfileImage(null);
          }}
          onCropComplete={handleProfileCropComplete}
          aspectRatioPreset="1:1"
        />
      )}

      {/* Cropper Modal for Profile Cover Background */}
      {showCoverCropper && tempCoverImage && (
        <ImageCropperModal
          imageSrc={tempCoverImage}
          onClose={() => {
            setShowCoverCropper(false);
            setTempCoverImage(null);
          }}
          onCropComplete={handleCoverCropComplete}
          aspectRatioPreset="16:9"
        />
      )}
    </div>
  );
};
