import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Image as ImageIcon,
  Search,
  MessageSquare,
  ArrowLeft,
  Users,
  Lock,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FormattedText } from '../utils/textFormatter';

export const MessagingView: React.FC = () => {
  const {
    currentUser,
    users,
    messages,
    sendDirectMessage,
    setLightboxImage,
    activeChatUserId,
    setActiveChatUserId,
    setActiveTab,
    setSelectedUserIdForView,
  } = useApp();

  const [searchContactQuery, setSearchContactQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [photoAttachment, setPhotoAttachment] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Only users who have accepted friend/connect requests (in currentUser.connections)
  const connectedUsers = (currentUser?.connections || [])
    .map((connId) => users.find((u) => u.id === connId))
    .filter((u): u is typeof users[0] => !!u && u.isApproved && !u.isBlacklisted);

  // Internal active contact state
  const [activeContactId, setActiveContactId] = useState<string>(() => {
    if (activeChatUserId && currentUser?.connections.includes(activeChatUserId)) {
      return activeChatUserId;
    }
    return connectedUsers[0]?.id || '';
  });

  // Sync when activeChatUserId from context changes or when connectedUsers change
  useEffect(() => {
    if (activeChatUserId && currentUser?.connections.includes(activeChatUserId)) {
      setActiveContactId(activeChatUserId);
      setShowMobileChat(true);
    } else if (!activeContactId && connectedUsers.length > 0) {
      setActiveContactId(connectedUsers[0].id);
    }
  }, [activeChatUserId, currentUser?.connections, connectedUsers]);

  // Auto-scroll messages to bottom when chat changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeContactId, messages.length]);

  if (!currentUser) return null;

  // Filter connected friends by search query
  const filteredConnectedContacts = connectedUsers.filter((u) => {
    if (!searchContactQuery.trim()) return true;
    const q = searchContactQuery.toLowerCase().replace('@', '');
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
    );
  });

  const activeContact = users.find((u) => u.id === activeContactId);
  const isContactConnected = activeContact ? currentUser.connections.includes(activeContact.id) : false;

  // Filter messages between current user and active contact
  const chatMessages = messages
    .filter(
      (m) =>
        (m.senderId === currentUser.id && m.receiverId === activeContactId) ||
        (m.senderId === activeContactId && m.receiverId === currentUser.id)
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !photoAttachment) return;
    if (!activeContactId || !isContactConnected) return;

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
      {/* Left Contact List: ONLY CONNECTED FRIENDS */}
      <div
        className={`${
          showMobileChat ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 border-r border-slate-200 dark:border-white/10 flex-col bg-slate-50/60 dark:bg-[#1C1F23]`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Direct Messages</span>
            </h3>
            <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
              {connectedUsers.length} {connectedUsers.length === 1 ? 'Friend' : 'Friends'}
            </span>
          </div>

          {/* Search friends filter */}
          {connectedUsers.length > 0 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search connected friends..."
                value={searchContactQuery}
                onChange={(e) => setSearchContactQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#2A2E35] border border-slate-200 dark:border-white/5 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Contacts Stream */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-white/5">
          {connectedUsers.length === 0 ? (
            <div className="p-6 text-center space-y-4 my-auto">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  No Connected Friends Yet
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  You can only message users who have accepted your connection request.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('network')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
              >
                <UserPlus className="w-4 h-4" /> Find Peers in Directory
              </button>
            </div>
          ) : filteredConnectedContacts.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No connected friends match "{searchContactQuery}".
            </div>
          ) : (
            filteredConnectedContacts.map((contact) => {
              const isActive = contact.id === activeContactId;

              // Check if there are any unread messages from this contact
              const lastMsg = messages
                .filter(
                  (m) =>
                    (m.senderId === contact.id && m.receiverId === currentUser.id) ||
                    (m.senderId === currentUser.id && m.receiverId === contact.id)
                )
                .slice(-1)[0];

              return (
                <button
                  key={contact.id}
                  onClick={() => {
                    setActiveContactId(contact.id);
                    setActiveChatUserId(contact.id);
                    setShowMobileChat(true);
                  }}
                  className={`w-full text-left p-3.5 flex items-center gap-3 transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 font-medium'
                      : 'hover:bg-slate-100 dark:hover:bg-[#2A2E35]'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/20"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 w-3 h-3 rounded-full border-2 border-white dark:border-[#1C1F23]" title="Connected" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {contact.name}
                      </span>
                      <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-semibold shrink-0">
                        Friend
                      </span>
                    </div>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono truncate">
                      @{contact.username}
                    </p>
                    {lastMsg && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {lastMsg.senderId === currentUser.id ? 'You: ' : ''}
                        {lastMsg.content || (lastMsg.photo ? '📷 Photo' : '')}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Chat Screen */}
      <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white dark:bg-[#1C1F23]`}>
        {activeContact ? (
          <>
            {/* Active Contact Header */}
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#1C1F23]">
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
                  className="w-10 h-10 rounded-full object-cover cursor-pointer ring-2 ring-indigo-500/20"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4
                      onClick={() => setSelectedUserIdForView(activeContact.id)}
                      className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 cursor-pointer"
                    >
                      {activeContact.name}
                    </h4>
                    {isContactConnected && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" /> Connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">
                    @{activeContact.username} • {activeContact.department}
                  </p>
                </div>
              </div>
            </div>

            {/* If NOT connected, show locked banner */}
            {!isContactConnected ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-50/50 dark:bg-[#0F1113]/50">
                <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center shadow-inner">
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Direct Messaging Locked
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                  You can only send messages to users who have accepted your friend request. Once @{activeContact.username} accepts your connection request, you can chat freely.
                </p>
              </div>
            ) : (
              <>
                {/* Chat Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30 dark:bg-[#0F1113]/50">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs space-y-2">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-slate-600 dark:text-slate-300">
                        Connected with {activeContact.name}!
                      </p>
                      <p className="text-slate-400">Send a greeting to start your conversation.</p>
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
                            className={`p-3.5 rounded-2xl text-xs sm:text-sm space-y-1 shadow-sm ${
                              isMine
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-white dark:bg-[#2A2E35] text-slate-900 dark:text-white rounded-bl-none border border-slate-200 dark:border-white/5'
                            }`}
                          >
                            {msg.photo && (
                              <img
                                src={msg.photo}
                                alt="Attachment"
                                onClick={() => setLightboxImage({ src: msg.photo! })}
                                className="max-h-48 rounded-xl object-cover cursor-pointer mb-1 border border-white/20"
                              />
                            )}
                            <p className="leading-relaxed">
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
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Box */}
                <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-white/10 space-y-2 bg-white dark:bg-[#1C1F23]">
                  {photoAttachment && (
                    <div className="relative inline-block">
                      <img src={photoAttachment} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-slate-300 dark:border-slate-700 shadow-sm" />
                      <button
                        type="button"
                        onClick={() => setPhotoAttachment(null)}
                        className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5 hover:bg-rose-700 transition-colors shadow"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <label className="p-2 text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                      <ImageIcon className="w-5 h-5" />
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>

                    <input
                      type="text"
                      placeholder={`Message @${activeContact.username}...`}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-full bg-slate-100 dark:bg-[#2A2E35] border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />

                    <button
                      type="submit"
                      disabled={!inputText.trim() && !photoAttachment}
                      className="p-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-full disabled:opacity-40 transition-all shadow-md shadow-indigo-500/20"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Select a connected friend to start messaging
            </p>
            <p className="text-xs text-slate-400 max-w-xs">
              Only users who have accepted your friend request will appear in your direct messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
