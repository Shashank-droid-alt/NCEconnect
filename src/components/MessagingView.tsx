import React, { useState } from 'react';
import { Send, Image as ImageIcon, Search, MessageSquare, CheckCheck, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FormattedText } from '../utils/textFormatter';

export const MessagingView: React.FC = () => {
  const { currentUser, users, messages, sendDirectMessage, setLightboxImage } = useApp();

  const [activeContactId, setActiveContactId] = useState<string>(
    currentUser?.connections[0] || (users.find((u) => u.id !== currentUser?.id)?.id || '')
  );
  const [inputText, setInputText] = useState('');
  const [photoAttachment, setPhotoAttachment] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState<boolean>(false);

  if (!currentUser) return null;

  const activeContact = users.find((u) => u.id === activeContactId);

  // Filter messages between current user and active contact
  const chatMessages = messages.filter(
    (m) =>
      (m.senderId === currentUser.id && m.receiverId === activeContactId) ||
      (m.senderId === activeContactId && m.receiverId === currentUser.id)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !photoAttachment) return;
    if (!activeContactId) return;

    sendDirectMessage(activeContactId, inputText.trim(), photoAttachment || undefined);
    setInputText('');
    setPhotoAttachment(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setPhotoAttachment(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1C1F23] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col md:flex-row h-[calc(100vh-160px)] min-h-[480px] max-h-[750px] mb-24 sm:mb-20 lg:mb-12">
      {/* Left Contact List */}
      <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-slate-200 dark:border-white/10 flex-col bg-slate-50/50 dark:bg-[#1C1F23]`}>
        <div className="p-4 border-b border-slate-200 dark:border-white/10">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Direct Messages</span>
          </h3>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-white/5">
          {users
            .filter((u) => u.id !== currentUser.id && u.isApproved && !u.isBlacklisted)
            .map((contact) => {
              const isActive = contact.id === activeContactId;
              const isConn = currentUser.connections.includes(contact.id);

              return (
                <button
                  key={contact.id}
                  onClick={() => {
                    setActiveContactId(contact.id);
                    setShowMobileChat(true);
                  }}
                  className={`w-full text-left p-3.5 flex items-center gap-3 transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 font-medium'
                      : 'hover:bg-slate-100 dark:hover:bg-[#2A2E35]'
                  }`}
                >
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {contact.name}
                      </span>
                      {isConn && (
                        <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-semibold">
                          Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">@{contact.username}</p>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Right Chat Screen */}
      <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white dark:bg-[#1C1F23]`}>
        {activeContact ? (
          <>
            {/* Active Contact Header */}
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#2A2E35] transition-colors"
                  title="Back to contacts list"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <img
                  src={activeContact.avatar}
                  alt={activeContact.name}
                  onClick={() => setLightboxImage({ src: activeContact.avatar, title: activeContact.name })}
                  className="w-10 h-10 rounded-full object-cover cursor-pointer"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{activeContact.name}</h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">@{activeContact.username} • {activeContact.department}</p>
                </div>
              </div>
            </div>

            {/* Chat Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30 dark:bg-[#0F1113]/50">
              {chatMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center p-6 text-slate-400 text-xs">
                  Start a conversation with @{activeContact.username}!
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMine = msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] ${isMine ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div
                        className={`p-3 rounded-2xl text-xs sm:text-sm space-y-1 ${
                          isMine
                            ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                            : 'bg-white dark:bg-[#2A2E35] text-slate-900 dark:text-white rounded-bl-none border border-slate-200 dark:border-white/5 shadow-sm'
                        }`}
                      >
                        {msg.photo && (
                          <img
                            src={msg.photo}
                            alt="Attachment"
                            onClick={() => setLightboxImage({ src: msg.photo! })}
                            className="max-h-48 rounded-xl object-cover cursor-pointer mb-1"
                          />
                        )}
                        <p>
                          <FormattedText text={msg.content} />
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-white/10 space-y-2">
              {photoAttachment && (
                <div className="relative inline-block">
                  <img src={photoAttachment} alt="Preview" className="w-16 h-16 rounded-xl object-cover border" />
                  <button
                    type="button"
                    onClick={() => setPhotoAttachment(null)}
                    className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <label className="p-2 text-slate-400 hover:text-indigo-400 cursor-pointer transition-colors">
                  <ImageIcon className="w-5 h-5" />
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>

                <input
                  type="text"
                  placeholder={`Message @${activeContact.username}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-full bg-slate-100 dark:bg-[#2A2E35] border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() && !photoAttachment}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full disabled:opacity-40 transition-colors shadow"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            Select a contact to view direct messages.
          </div>
        )}
      </div>
    </div>
  );
};
