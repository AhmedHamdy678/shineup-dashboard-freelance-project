import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateConversation } from '../useProviderChat';

export default function NewInternalChatModal({ 
  isOpen, 
  onClose, 
  members, 
  providerId,
  onSuccess 
}) {
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [message, setMessage] = useState("");

  const { mutate: createConversation, isLoading: isCreating } = useCreateConversation();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMemberId || !message.trim()) return;

    createConversation(
      {
        type: 'PROVIDER_INTERNAL',
        providerId,
        providerMemberId: selectedMemberId,
        message: message.trim(),
      },
      {
        onSuccess: (response) => {
          const createdConv = response?.conversation || response?.data?.conversation;
          if (createdConv?.id) {
            onSuccess(createdConv.id);
          }
          setSelectedMemberId("");
          setMessage("");
          onClose();
        },
        onError: (err) => {
          console.error("Failed to create internal conversation", err);
          toast.error(err?.response?.data?.message || 'فشل إنشاء المحادثة');
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm rtl:dir-rtl">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">محادثة جديدة مع فريقك</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">اختر العضو</label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              disabled={isCreating}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              <option value="" disabled>-- قائمة الأعضاء --</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name || member.displayName || member.user?.fullName} {member.email ? `(${member.email})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">الرسالة الأولى</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isCreating}
              placeholder="اكتب رسالتك الترحيبية أو استفسارك هنا..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none h-32 disabled:opacity-50"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!selectedMemberId || !message.trim() || isCreating}
              className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>إرسال وبدء المحادثة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
