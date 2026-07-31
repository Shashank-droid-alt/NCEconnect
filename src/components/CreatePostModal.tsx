import React, { useState } from 'react';
import {
  X,
  Image as ImageIcon,
  Crop,
  Video,
  AtSign,
  Plus,
  Trash2,
  Send,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ImageCropperModal } from './ImageCropperModal';
import { uploadToCloudinary } from '../lib/cloudinary';

interface CreatePostModalProps {
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose }) => {
  const { currentUser, users, createPost } = useApp();

  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // Photo Cropper state
  const [croppingImageIndex, setCroppingImageIndex] = useState<number | null>(null);

  if (!currentUser) return null;

  // Handle Multi-Select File Upload with Cloudinary Support
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const url = await uploadToCloudinary(file);
        setPhotos((prev) => [...prev, url]);
      } catch (err) {
        console.error('Error uploading photo:', err);
      }
    }
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    if (croppingImageIndex !== null) {
      setPhotos((prev) =>
        prev.map((img, idx) => (idx === croppingImageIndex ? croppedDataUrl : img))
      );
      setCroppingImageIndex(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && photos.length === 0 && !videoUrl) return;

    createPost(content, photos, videoUrl || undefined);
    onClose();
  };

  const insertTag = (username: string) => {
    setContent((prev) => `${prev} @${username} `);
    setShowTagDropdown(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1C1F23] rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Create Campus Post</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* User Header */}
          <div className="flex items-center gap-3">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{currentUser.name}</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">@{currentUser.username}</p>
            </div>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              rows={4}
              placeholder="What's happening on campus? Share projects, internship tips, or announcements... Use @username to tag peers!"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (e.target.value.endsWith('@')) {
                  setShowTagDropdown(true);
                }
              }}
              className="w-full text-sm sm:text-base p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />

            {/* Tag Auto-complete Dropdown */}
            {showTagDropdown && (
              <div className="absolute left-0 bottom-full mb-1 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-30 max-h-48 overflow-y-auto">
                <p className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-1">Tag Student / Alumni</p>
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => insertTag(u.username)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-xs text-slate-800 dark:text-slate-200"
                  >
                    <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                    <span className="font-semibold">{u.name}</span>
                    <span className="text-[10px] text-indigo-500 font-mono">@{u.username}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Photo Preview & Edit Grid */}
          {photos.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Selected Photos ({photos.length}) — Click Crop icon to edit!
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-700">
                    <img src={photo} alt="Upload preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCroppingImageIndex(idx)}
                        className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        title="Crop / Edit Image"
                      >
                        <Crop className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video URL Input */}
          {showVideoInput && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Video URL (YouTube or Direct MP4 link):
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          )}

          {/* Toolbar & Action Options */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {/* Multi-photo file upload */}
              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-semibold cursor-pointer transition-colors">
                <ImageIcon className="w-4 h-4" />
                <span>Multi-Select Photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {/* Video URL Button */}
              <button
                type="button"
                onClick={() => setShowVideoInput(!showVideoInput)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
              >
                <Video className="w-4 h-4 text-purple-500" />
                <span>Video Link</span>
              </button>

              {/* Tag User Quick Button */}
              <button
                type="button"
                onClick={() => setShowTagDropdown(!showTagDropdown)}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold"
              >
                <AtSign className="w-4 h-4 text-blue-500" />
                <span>Tag</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={!content.trim() && photos.length === 0 && !videoUrl}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Publish Post</span>
            </button>
          </div>
        </form>
      </div>

      {/* Image Cropper Modal Sub-view */}
      {croppingImageIndex !== null && photos[croppingImageIndex] && (
        <ImageCropperModal
          imageSrc={photos[croppingImageIndex]}
          onClose={() => setCroppingImageIndex(null)}
          onCropComplete={handleCropComplete}
          aspectRatioPreset="16:9"
        />
      )}
    </div>
  );
};
