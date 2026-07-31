import React, { useState } from 'react';
import { X, Flag, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ReportModalProps {
  targetUserId: string;
  postId?: string;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ targetUserId, postId, onClose }) => {
  const { users, reportUserOrPost } = useApp();

  const [reason, setReason] = useState('Inappropriate Content / Harassment');
  const [customReason, setCustomReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const targetUser = users.find((u) => u.id === targetUserId);

  const reasonsList = [
    'Inappropriate Content / Harassment',
    'Spam / Unsolicited Promotion',
    'Fake Identity / Impersonation',
    'Hate Speech / Offensive Language',
    'Violating Campus Policy',
    'Other Reason',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason === 'Other Reason' ? customReason || 'Other' : reason;
    reportUserOrPost(targetUserId, finalReason, postId);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1C1F23] rounded-3xl max-w-md w-full border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Report User</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-2">
            <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
            <h4 className="font-bold text-slate-900 dark:text-white">Report Submitted</h4>
            <p className="text-xs text-slate-500">
              Thank you for keeping NCEconnect safe. The report has been recorded.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              You are reporting user{' '}
              <strong className="text-indigo-600 dark:text-indigo-400">@{targetUser?.username}</strong> ({targetUser?.name}).
              Accounts reaching 3 reports are automatically banned.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Select Reason:
              </label>
              {reasonsList.map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value)}
                    className="accent-indigo-600"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            {reason === 'Other Reason' && (
              <textarea
                rows={2}
                placeholder="Explain the violation details..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow"
              >
                File Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
